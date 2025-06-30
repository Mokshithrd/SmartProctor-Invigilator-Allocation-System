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
        const { name, semesterData, year, rooms, faculty } = req.body;

        // Validation
        if (!name || !Array.isArray(semesterData) || semesterData.length === 0 ||
            !year || !Array.isArray(rooms) || rooms.length === 0 ||
            !Array.isArray(faculty) || faculty.length === 0
        ) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        // Validate semesterData (up to 2 semesters)
        if (semesterData.length > 2) {
            return res.status(400).json({
                success: false,
                message: "System can handle maximum 2 semesters at a time."
            });
        }

        // Validate each semester's data
        for (let semData of semesterData) {
            if (!semData.semester || !semData.totalStudents ||
                !Array.isArray(semData.subjects) || semData.subjects.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Each semester must include semester number, total students, and subjects."
                });
            }

            // Validate each subject
            for (let subject of semData.subjects) {
                if (!subject.name || !subject.subjectCode || !subject.date ||
                    !subject.startTime || !subject.endTime) {
                    return res.status(400).json({
                        success: false,
                        message: "Each subject must include name, subject code, date, start time, and end time."
                    });
                }
            }
        }

        // Check for overlapping subject timings within each semester
        for (let semData of semesterData) {
            for (let i = 0; i < semData.subjects.length; i++) {
                for (let j = i + 1; j < semData.subjects.length; j++) {
                    const s1 = semData.subjects[i];
                    const s2 = semData.subjects[j];

                    if (s1.date === s2.date) {
                        const s1Start = moment(s1.startTime, ["h:mm A", "HH:mm"]);
                        const s1End = moment(s1.endTime, ["h:mm A", "HH:mm"]);
                        const s2Start = moment(s2.startTime, ["h:mm A", "HH:mm"]);
                        const s2End = moment(s2.endTime, ["h:mm A", "HH:mm"]);

                        if (s1Start.isBefore(s2End) && s2Start.isBefore(s1End)) {
                            return res.status(400).json({
                                success: false,
                                message: `Subjects "${s1.name}" and "${s2.name}" in semester ${semData.semester} overlap on ${s1.date}.`
                            });
                        }
                    }
                }
            }
        }

        // Create a combined list of all subjects with their semester information
        const allSubjectsWithSemInfo = [];
        for (let semData of semesterData) {
            semData.subjects.forEach(subject => {
                allSubjectsWithSemInfo.push({
                    ...subject,
                    semester: semData.semester,
                    totalStudents: semData.totalStudents
                });
            });
        }

        // Check for overlapping times across different semesters
        // This is for validation only, we'll need to identify this case later for special allocation
        const overlappingExams = [];
        if (semesterData.length > 1) {
            for (let i = 0; i < semesterData[0].subjects.length; i++) {
                for (let j = 0; j < semesterData[1].subjects.length; j++) {
                    const s1 = semesterData[0].subjects[i];
                    const s2 = semesterData[1].subjects[j];

                    if (s1.date === s2.date) {
                        const s1Start = moment(s1.startTime, ["h:mm A", "HH:mm"]);
                        const s1End = moment(s1.endTime, ["h:mm A", "HH:mm"]);
                        const s2Start = moment(s2.startTime, ["h:mm A", "HH:mm"]);
                        const s2End = moment(s2.endTime, ["h:mm A", "HH:mm"]);

                        if (s1Start.isSame(s2Start) && s1End.isSame(s2End)) {
                            overlappingExams.push({
                                subject1: {
                                    name: s1.name,
                                    semester: semesterData[0].semester,
                                    totalStudents: semesterData[0].totalStudents,
                                    date: s1.date,
                                    startTime: s1.startTime,
                                    endTime: s1.endTime
                                },
                                subject2: {
                                    name: s2.name,
                                    semester: semesterData[1].semester,
                                    totalStudents: semesterData[1].totalStudents,
                                    date: s2.date,
                                    startTime: s2.startTime,
                                    endTime: s2.endTime
                                }
                            });
                        } else if (s1Start.isBefore(s2End) && s2Start.isBefore(s1End)) {
                            return res.status(400).json({
                                success: false,
                                message: `Subject "${s1.name}" from semester ${semesterData[0].semester} and "${s2.name}" from semester ${semesterData[1].semester} have overlapping times but are not exactly matching. Please adjust the timings.`
                            });
                        }
                    }
                }
            }
        }

        const selectedRooms = await Room.find({ _id: { $in: rooms } });
        if (selectedRooms.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid room selection." });
        }

        // Check room availability for each subject timing
        // For non-overlapping exams, check individual total students
        // For overlapping exams, check combined total students
        const subjectTimingsMap = new Map(); // Maps date+time to combined student count

        for (let subject of allSubjectsWithSemInfo) {
            const key = `${subject.date}_${subject.startTime}_${subject.endTime}`;

            if (subjectTimingsMap.has(key)) {
                const existingCount = subjectTimingsMap.get(key);
                subjectTimingsMap.set(key, existingCount + subject.totalStudents);
            } else {
                subjectTimingsMap.set(key, subject.totalStudents);
            }
        }

        // Now check availability for each unique timing with the appropriate student count
        for (let [key, totalStudents] of subjectTimingsMap.entries()) {
            const [date, startTime, endTime] = key.split('_');

            const availability = await RoomAllocator.checkRoomAvailability(
                rooms,
                date,
                startTime,
                endTime,
                totalStudents
            );

            if (!availability.success) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json(availability);
            }
        }

        // Create a single exam document that includes all semesters
        const newExam = new Exam({
            name,
            year,
            semesters: semesterData.map(semData => ({
                semester: semData.semester,
                totalStudents: semData.totalStudents
            })),
            rooms: [],
            faculty: [],
            subjects: []
        });

        await newExam.save({ session });

        // Create Subject documents for all semesters
        const subjectDocs = [];

        for (let semData of semesterData) {
            // Create Subject documents for this semester
            const semesterSubjects = await Subject.insertMany(
                semData.subjects.map(sub => ({
                    exam: newExam._id,
                    name: sub.name,
                    subjectCode: sub.subjectCode,
                    semester: semData.semester, // Store semester with the subject
                    date: moment.tz(sub.date, "YYYY-MM-DD", "Asia/Kolkata").startOf("day").toDate(),
                    startTime: moment(sub.startTime, ["h:mm A", "HH:mm"]).format("HH:mm"),
                    endTime: moment(sub.endTime, ["h:mm A", "HH:mm"]).format("HH:mm")
                })),
                { session }
            );

            subjectDocs.push(...semesterSubjects);
        }

        // Update exam with subject IDs
        newExam.subjects = subjectDocs.map(s => s._id);
        await newExam.save({ session });

        // Group subjects by date and time to identify overlapping exams
        const dateTimeSubjectMap = new Map();

        for (let subject of subjectDocs) {
            const key = `${moment(subject.date).format('YYYY-MM-DD')}_${subject.startTime}_${subject.endTime}`;

            if (!dateTimeSubjectMap.has(key)) {
                dateTimeSubjectMap.set(key, []);
            }

            dateTimeSubjectMap.get(key).push(subject);
        }

        const allocatedRoomIds = new Set();

        // Allocate rooms for each time slot
        for (let [dateTimeKey, subjectsAtTime] of dateTimeSubjectMap.entries()) {
            const [date, startTime, endTime] = dateTimeKey.split('_');

            // If we have overlapping subjects from different semesters
            if (subjectsAtTime.length > 1 &&
                new Set(subjectsAtTime.map(s => s.semester)).size > 1) {

                // Create allocation data for multi-semester allocation
                const semesterData = subjectsAtTime.map(subject => {
                    // Find the corresponding semester data from the exam
                    const semesterInfo = newExam.semesters.find(sem => sem.semester === subject.semester);

                    return {
                        examId: newExam._id,
                        subjectId: subject._id,
                        totalStudents: semesterInfo.totalStudents,
                        semester: subject.semester
                    };
                });

                // Call multi-semester room allocation
                const result = await RoomAllocator.allocateMultiSemesterToRooms(
                    semesterData,
                    rooms,
                    date,
                    startTime,
                    endTime,
                    session
                );

                if (!result.success) {
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(400).json(result);
                }

                result.allocations.forEach(alloc => allocatedRoomIds.add(alloc.roomId.toString()));

            } else {
                // Single semester subject allocation
                const subject = subjectsAtTime[0];
                // Find the corresponding semester data from the exam
                const semesterInfo = newExam.semesters.find(sem => sem.semester === subject.semester);

                const result = await RoomAllocator.allocateStudentsToRooms(
                    newExam._id,
                    subject._id,
                    semesterInfo.totalStudents,
                    rooms,
                    date,
                    startTime,
                    endTime,
                    subject.semester, // Pass semester number
                    session
                );

                if (!result.success) {
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(400).json(result);
                }

                result.allocations.forEach(alloc => allocatedRoomIds.add(alloc.roomId.toString()));
            }
        }

        // Update exam with room info
        newExam.rooms = [...allocatedRoomIds];
        await newExam.save({ session });

        // Allocate faculty for the exam
        const facultyResult = await FacultyAllocator.allocateFacultyToRooms(
            newExam._id,
            faculty,
            session
        );

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
            .populate("rooms", "roomNumber capacity building floor")
            .populate("faculty", "name email designation")
            .populate({
                path: "subjects",
                options: { sort: { semester: 1, date: 1 } }
            });

        const now = moment().startOf('day');
        const upcoming = [];
        const inProgress = [];
        const completed = [];

        for (let exam of exams) {
            if (!exam.subjects || exam.subjects.length === 0) continue;

            const subjectDates = exam.subjects.map(subject => moment(subject.date));
            const earliestDate = moment.min(subjectDates);
            const latestDate = moment.max(subjectDates);

            // Assign exam status based on dates
            if (now.isBefore(earliestDate)) {
                upcoming.push(exam);
            } else if (now.isAfter(latestDate)) {
                completed.push(exam);
            } else {
                inProgress.push(exam);
            }
        }

        const formatExam = (examList) =>
            examList.map(exam => {
                // Group subjects by semester
                const subjectsBySemester = {};
                const semesterStudentCounts = {};

                // Initialize semester student counts from exam.semesters
                if (exam.semesters && exam.semesters.length > 0) {
                    exam.semesters.forEach(sem => {
                        semesterStudentCounts[sem.semester] = sem.totalStudents;
                        subjectsBySemester[sem.semester] = [];
                    });
                }

                // Group subjects by their semester
                exam.subjects.forEach(subject => {
                    if (!subjectsBySemester[subject.semester]) {
                        subjectsBySemester[subject.semester] = [];
                    }
                    subjectsBySemester[subject.semester].push({
                        _id: subject._id,
                        name: subject.name,
                        subjectCode: subject.subjectCode,
                        date: subject.date,
                        startTime: subject.startTime,
                        endTime: subject.endTime
                    });
                });

                // Calculate start and end dates for each semester
                const semesterDateRanges = {};
                Object.keys(subjectsBySemester).forEach(semester => {
                    const semSubjects = subjectsBySemester[semester];
                    if (semSubjects && semSubjects.length > 0) {
                        const semSubjectDates = semSubjects.map(s => moment(s.date));
                        semesterDateRanges[semester] = {
                            startDate: moment.min(semSubjectDates).toDate(),
                            endDate: moment.max(semSubjectDates).toDate()
                        };
                    }
                });

                // Calculate overall exam date range
                const allDates = exam.subjects.map(s => moment(s.date));
                const examStartDate = moment.min(allDates).toDate();
                const examEndDate = moment.max(allDates).toDate();

                return {
                    _id: exam._id,
                    name: exam.name,
                    year: exam.year,
                    examStartDate: examStartDate,
                    examEndDate: examEndDate,
                    totalStudentsBySemester: semesterStudentCounts,
                    roomsUsed: exam.rooms.map(room => ({
                        _id: room._id,
                        roomNumber: room.roomNumber,
                        building: room.building,
                        floor: room.floor,
                        capacity: room.capacity
                    })),
                    totalRoomsUsed: exam.rooms.length,
                    uniqueFacultyCount: new Set(exam.faculty.map(fac => fac._id.toString())).size,
                    subjectsBySemester: Object.keys(subjectsBySemester).reduce((acc, semester) => {
                        acc[semester] = {
                            subjects: subjectsBySemester[semester],
                            totalStudents: semesterStudentCounts[semester] || 0,
                            startDate: semesterDateRanges[semester]?.startDate,
                            endDate: semesterDateRanges[semester]?.endDate
                        };
                        return acc;
                    }, {})
                };
            });

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
            .populate('rooms')
            .populate('faculty')
            .populate({
                path: 'subjects',
                options: { sort: { semester: 1, date: 1 } }
            });

        // If no exam is found, return a 404 error
        if (!exam) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        // Get faculty allocations for this exam
        const facultyAllocations = await Allocation.find({ examId: req.params.id })
            .populate('roomId', 'roomNumber building floor capacity')
            .populate('facultyId', 'name designation')
            .populate('subjectId', 'name subjectCode semester');

        // Get room allocations for this exam
        const roomAllocations = await RoomAllocation.find({ examId: req.params.id })
            .populate('roomId', 'roomNumber building floor capacity')
            .populate('subjectId', 'name subjectCode semester date startTime endTime')
            .lean();

        // Format the rooms
        const formattedRooms = exam.rooms.map(room => ({
            _id: room._id,
            roomNumber: room.roomNumber,
            building: room.building,
            floor: room.floor,
            capacity: room.capacity
        }));

        // Format the faculty allocations (table format as shown in Image 2)
        const formattedFacultyAllocations = facultyAllocations.map(alloc => {
            const dateObj = new Date(alloc.date);
            const formattedDate = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD

            return {
                facultyName: `${alloc.facultyId.name}`,
                date: formattedDate,
                time: `${alloc.startTime} - ${alloc.endTime}`,
                roomDetails: alloc.roomId ?
                    `${alloc.roomId.building}, ${alloc.roomId.roomNumber}, ${alloc.roomId.floor} Floor` :
                    'Not assigned'
            };
        });

        // Organize subjects by semester
        const subjectsBySemester = {};
        if (exam.subjects && exam.subjects.length > 0) {
            exam.subjects.forEach(subject => {
                const semester = subject.semester;
                if (!subjectsBySemester[semester]) {
                    subjectsBySemester[semester] = [];
                }

                const dateObj = new Date(subject.date);
                const formattedDate = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD

                subjectsBySemester[semester].push({
                    name: subject.name,
                    subjectCode: subject.subjectCode,
                    date: formattedDate,
                    time: `${subject.startTime} - ${subject.endTime}`
                });
            });
        }

        // Process student allocations by semester
        const studentAllocationsBySemester = {};

        if (roomAllocations && roomAllocations.length > 0) {
            // Track unique room-semester combinations to avoid duplicates
            const processedRooms = new Map();

            for (const roomAlloc of roomAllocations) {
                // Get all students in this room allocation
                const students = roomAlloc.students || [];

                // Group students by semester
                const studentsBySemester = {};

                students.forEach(studentId => {
                    // Check if the student ID contains semester info (format: "Sem2-Student91")
                    const semMatch = studentId.match(/Sem(\d+)-Student(\d+)/i);

                    if (semMatch) {
                        const semester = parseInt(semMatch[1]);
                        const studentNumber = parseInt(semMatch[2]);

                        if (!studentsBySemester[semester]) {
                            studentsBySemester[semester] = [];
                        }

                        studentsBySemester[semester].push(studentNumber);
                    }
                });

                // Process each semester's students separately
                for (const [semester, semesterStudents] of Object.entries(studentsBySemester)) {
                    if (!studentAllocationsBySemester[semester]) {
                        studentAllocationsBySemester[semester] = [];
                    }

                    // Create unique key for this room-semester combination
                    const roomKey = `${roomAlloc.roomId._id}-${semester}`;

                    // Skip if we've already processed this room for this semester
                    if (processedRooms.has(roomKey)) {
                        continue;
                    }

                    processedRooms.set(roomKey, true);

                    // Sort students by number
                    const sortedStudents = [...semesterStudents].sort((a, b) => a - b);

                    // Create student ranges
                    let currentRange = {
                        start: sortedStudents[0],
                        end: sortedStudents[0],
                        count: 1
                    };

                    const studentRanges = [];
                    for (let i = 1; i < sortedStudents.length; i++) {
                        const current = sortedStudents[i];
                        const prev = sortedStudents[i - 1];

                        if (current === prev + 1) {
                            currentRange.end = current;
                            currentRange.count++;
                        } else {
                            studentRanges.push(currentRange);
                            currentRange = {
                                start: current,
                                end: current,
                                count: 1
                            };
                        }
                    }

                    // Add the last range
                    studentRanges.push(currentRange);

                    // Format ranges as table format shown in Image 1
                    const formattedRange = {
                        studentRange: `${currentRange.start} - ${currentRange.end}`,
                        count: currentRange.count,
                        roomDetails: `${roomAlloc.roomId.building}, ${roomAlloc.roomId.roomNumber}, ${roomAlloc.roomId.floor} Floor`
                    };

                    studentAllocationsBySemester[semester].push(formattedRange);
                }
            }
        }

        for (const semester in studentAllocationsBySemester) {
            studentAllocationsBySemester[semester].sort((a, b) => {
                const aStart = parseInt(a.studentRange.split(' - ')[0]);
                const bStart = parseInt(b.studentRange.split(' - ')[0]);
                return aStart - bStart;
            });
        }

        // Prepare response data with the format you requested
        const formattedExam = {
            _id: exam._id,
            name: exam.name,
            year: exam.year,
            semesters: exam.semesters.map(sem => ({
                semester: sem.semester,
                totalStudents: sem.totalStudents
            })),
            rooms: formattedRooms,
            facultyAllocations: formattedFacultyAllocations,
            subjectsBySemester: subjectsBySemester,
            studentAllocationsBySemester: studentAllocationsBySemester
        };

        // Return the formatted exam details
        return res.status(200).json({
            success: true,
            exam: formattedExam
        });

    } catch (err) {
        console.error("Error fetching exam by ID:", err);
        return res.status(500).json({ success: false, message: 'Error fetching exam details' });
    }
};