const Exam = require("../models/Exam");
const Subject = require("../models/Subject");
const Room = require("../models/Room");
const RoomAllocator = require("../utils/roomAllocator");
const FacultyAllocator = require("../utils/facultyAllocator");
const mongoose = require("mongoose");
const moment = require("moment-timezone");
const RoomAllocation = require("../models/RoomAllocation");
const Allocation = require("../models/Allocation");
const User = require("../models/User");


exports.createExam = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { name, semester, year, totalStudents, rooms, faculty, subjects } = req.body;

        // Validation
        if (!name || !semester || !year || !totalStudents ||
            !Array.isArray(rooms) || rooms.length === 0 ||
            !Array.isArray(faculty) || faculty.length === 0 ||
            !Array.isArray(subjects) || subjects.length === 0
        ) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        for (let subject of subjects) {
            if (!subject.name || !subject.subjectCode || !subject.date || !subject.startTime || !subject.endTime) {
                return res.status(400).json({
                    success: false,
                    message: "Each subject must include name, subject code, date, start time, and end time."
                });
            }
        }

        // Check for overlapping subject timings
        for (let i = 0; i < subjects.length; i++) {
            for (let j = i + 1; j < subjects.length; j++) {
                const s1 = subjects[i];
                const s2 = subjects[j];

                if (s1.date === s2.date) {
                    const s1Start = moment(s1.startTime, ["h:mm A", "HH:mm"]);
                    const s1End = moment(s1.endTime, ["h:mm A", "HH:mm"]);
                    const s2Start = moment(s2.startTime, ["h:mm A", "HH:mm"]);
                    const s2End = moment(s2.endTime, ["h:mm A", "HH:mm"]);

                    if (s1Start.isBefore(s2End) && s2Start.isBefore(s1End)) {
                        return res.status(400).json({
                            success: false,
                            message: `Subjects "${s1.name}" and "${s2.name}" overlap on ${s1.date}.`
                        });
                    }
                }
            }
        }

        const selectedRooms = await Room.find({ _id: { $in: rooms } });
        if (selectedRooms.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid room selection." });
        }

        // Step 1: Room availability check for all subjects
        for (let subject of subjects) {
            const availability = await RoomAllocator.checkRoomAvailability(
                rooms,
                subject.date,
                subject.startTime,
                subject.endTime,
                totalStudents
            );

            if (!availability.success) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json(availability);
            }
        }

        // Step 2: Create Exam document
        const newExam = new Exam({
            name,
            semester,
            year,
            totalStudents,
            rooms: [],
            faculty: [],
            subjects: []
        });

        await newExam.save({ session });

        // Step 3: Create Subject documents
        const subjectDocs = await Subject.insertMany(
            subjects.map(sub => ({
                exam: newExam._id,
                name: sub.name,
                subjectCode: sub.subjectCode,
                date: moment.tz(sub.date, "YYYY-MM-DD", "Asia/Kolkata").startOf("day").toDate(),
                startTime: moment(sub.startTime, ["h:mm A", "HH:mm"]).format("HH:mm"),
                endTime: moment(sub.endTime, ["h:mm A", "HH:mm"]).format("HH:mm")
            })),
            { session }
        );

        const allocatedRoomIds = new Set();

        // Step 4: Allocate students to rooms for each subject
        for (let subject of subjectDocs) {
            const result = await RoomAllocator.allocateStudentsToRooms(
                newExam._id,
                subject._id,
                totalStudents,
                rooms,
                subject.date,
                subject.startTime,
                subject.endTime,
                session
            );

            if (!result.success) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json(result);
            }

            result.allocations.forEach(alloc => allocatedRoomIds.add(alloc.roomId.toString()));
        }

        // Step 5: Update exam with subject and room info
        newExam.subjects = subjectDocs.map(s => s._id);
        newExam.rooms = [...allocatedRoomIds];
        await newExam.save({ session });

        // console.log(newExam);

        // Step 6: Allocate faculty
        const facultyResult = await FacultyAllocator.allocateFacultyToRooms(
            newExam._id,
            faculty,
            session
        );
        // const id = newExam._id;
        // const roomAllocations = await RoomAllocation.find({ examId:{ $in: id } });
        // console.log(roomAllocations);
        if (!facultyResult.success) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json(facultyResult);
        }

        const uniqueFacultyIds = [
            ...new Set(facultyResult.allocations.map(a => a.facultyId.toString()))
        ];
        newExam.faculty = uniqueFacultyIds;
        await newExam.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            success: true,
            message: "Exam created successfully!",
            exam: newExam
        });

    } catch (error) {
        console.error("❌ Error during exam creation:", error);
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


exports.deleteExam = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { examId } = req.params;

        if (!examId) {
            return res.status(400).json({ success: false, message: "Exam ID is required." });
        }

        const exam = await Exam.findById(examId).session(session);
        if (!exam) {
            return res.status(404).json({ success: false, message: "Exam not found." });
        }

        // Step 1: Delete all room allocations
        const roomAllocations = await RoomAllocation.find({ examId }).session(session);

        // Step 2: Delete faculty allocations and adjust previousAllocations count if needed
        const facultyAllocations = await Allocation.find({ examId }).session(session);
        const updateOps = [];

        for (let alloc of facultyAllocations) {
            const { facultyId, roomId, date, startTime, endTime } = alloc;

            const reusedElsewhere = await Allocation.exists({
                _id: { $ne: alloc._id },
                facultyId,
                roomId,
                date,
                startTime,
                endTime
            }).session(session);

            // Only decrement if not reused elsewhere
            if (!reusedElsewhere) {
                updateOps.push(
                    User.updateOne(
                        { _id: facultyId },
                        { $inc: { previousAllocations: -1 } },
                        { session }
                    )
                );
            }
        }

        await Promise.all(updateOps);

        await Allocation.deleteMany({ examId }).session(session);
        await RoomAllocation.deleteMany({ examId }).session(session);

        // Step 3: Delete subjects
        await Subject.deleteMany({ _id: { $in: exam.subjects } }).session(session);

        // Step 4: Delete exam
        await Exam.deleteOne({ _id: examId }).session(session);

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ success: true, message: "Exam deleted successfully." });

    } catch (error) {
        console.error("❌ Error deleting exam:", error);
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

exports.getAllExams = async (req, res) => {
    try {
        const exams = await Exam.find()
            .populate("rooms", "roomNumber capacity")
            .populate("faculty", "name email")
            .populate("subjects");

        const now = moment().startOf('day');
        const upcoming = [];
        const inProgress = [];
        const completed = [];

        for (let exam of exams) {
            if (!exam.subjects || exam.subjects.length === 0) continue;

            const subjectDates = exam.subjects.map(subject => moment(subject.date));
            const earliestDate = moment.min(subjectDates);
            const latestDate = moment.max(subjectDates);

            if (now.isBefore(earliestDate)) {
                upcoming.push(exam);
            } else if (now.isAfter(latestDate)) {
                completed.push(exam);
            } else {
                inProgress.push(exam);
            }
        }

        const formatExam = (examList) =>
            examList.map(exam => ({
                _id: exam._id,
                name: exam.name,
                semester: exam.semester,
                year: exam.year,
                totalStudents: exam.totalStudents,
                roomsUsed: exam.rooms.length,
                uniqueFacultyCount: new Set(exam.faculty.map(fac => fac._id.toString())).size,
                subjects: exam.subjects.map(s => ({
                    name: s.name,
                    subjectCode: s.subjectCode,
                    date: s.date,
                    startTime: s.startTime,
                    endTime: s.endTime
                }))
            }));

        return res.status(200).json({
            success: true,
            upcoming: formatExam(upcoming),
            inProgress: formatExam(inProgress),
            completed: formatExam(completed)
        });

    } catch (error) {
        console.error("Error fetching all exams:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


exports.getExamById = async (req, res) => {
    try {
      // Fetch the exam details from the database
      const exam = await Exam.findById(req.params.id)
        .populate('rooms')   // Assuming rooms is populated
        .populate('faculty') // Assuming faculty is populated
        .populate('subjects'); // Assuming subjects is populated
  
      // If no exam is found, return a 404 error
      if (!exam) {
        return res.status(404).json({ success: false, message: 'Exam not found' });
      }
  
      console.log("Exam fetched:", exam);
  
      // Check if the exam has the necessary fields before processing
      if (exam.rooms && Array.isArray(exam.rooms)) {
        exam.rooms.forEach(room => {
          if (room && room._id) {
            // Safe to access room._id
            console.log('Room:', room);
          }
        });
      } else {
        console.warn('No rooms found for the exam');
      }
  
      if (exam.faculty && Array.isArray(exam.faculty)) {
        exam.faculty.forEach(facultyMember => {
          if (facultyMember && facultyMember._id) {
            // Safe to access facultyMember._id
            console.log('Faculty Member:', facultyMember);
          }
        });
      } else {
        console.warn('No faculty found for the exam');
      }
  
      if (exam.subjects && Array.isArray(exam.subjects)) {
        exam.subjects.forEach(subject => {
          if (subject && subject._id) {
            // Safe to access subject._id
            console.log('Subject:', subject);
          }
        });
      } else {
        console.warn('No subjects found for the exam');
      }
  
      // Return the exam details if everything is fine
      return res.status(200).json({ success: true, exam });
    } catch (err) {
      console.error("Error fetching exam by ID:", err);
      return res.status(500).json({ success: false, message: 'Error fetching exam details' });
    }
  };
  