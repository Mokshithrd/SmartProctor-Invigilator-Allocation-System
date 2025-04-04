const Exam = require("../models/Exam");
const Subject = require("../models/Subject");
const Room = require("../models/Room");
const RoomAllocator = require("../utils/roomAllocator");
const mongoose = require("mongoose");
const moment = require("moment");

exports.createExam = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { name, semester, year, totalStudents, rooms, faculty, subjects } = req.body;

        // Validate inputs
        if (!name || !semester || !year || !totalStudents ||
            !Array.isArray(rooms) || rooms.length === 0 ||
            !Array.isArray(faculty) || faculty.length === 0 ||
            !Array.isArray(subjects) || subjects.length === 0
        ) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        for (let subject of subjects) {
            if (!subject.name || !subject.subjectCode || !subject.date || !subject.startTime || !subject.endTime) {
                return res.status(400).json({ success: false, message: "Each subject must have a name, subject code, date, start time, and end time." });
            }
        }

        const selectedRooms = await Room.find({ _id: { $in: rooms } });
        if (selectedRooms.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid room selection." });
        }

        if (faculty.length < selectedRooms.length) {
            return res.status(400).json({ success: false, message: `At least ${selectedRooms.length} faculty members are required.` });
        }

        // Step 1: Check availability of all subjects first
        for (let subject of subjects) {
            const conflict = await RoomAllocator.checkRoomAvailability(rooms, subject.date, subject.startTime, subject.endTime, totalStudents);
            if (!conflict.success) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json(conflict);
            }
        }

        // Step 2: Create Exam
        const newExam = new Exam({
            name,
            semester,
            year,
            totalStudents,
            rooms: [],
            faculty,
            subjects: []
        });

        await newExam.save({ session });

        // Step 3: Create Subject documents
        const subjectDocs = await Subject.insertMany(
            subjects.map(sub => ({
                exam: newExam._id,
                name: sub.name,
                subjectCode: sub.subjectCode,
                date: moment(sub.date, "YYYY-MM-DD").toDate(),
                startTime: moment(sub.startTime, ["h:mm A", "HH:mm"]).format("HH:mm"),
                endTime: moment(sub.endTime, ["h:mm A", "HH:mm"]).format("HH:mm")
            })),
            { session }
        );

        let allocatedRoomIds = new Set();

        // Step 4: Allocate students for each subject
        for (let subject of subjectDocs) {
            const allocationResult = await RoomAllocator.allocateStudentsToRooms(
                newExam._id,
                totalStudents,
                rooms,
                subject.date,
                subject.startTime,
                subject.endTime,
                session 
            );

            if (!allocationResult.success) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json(allocationResult);
            }

            allocationResult.allocations.forEach(allocation => allocatedRoomIds.add(allocation.roomId.toString()));
        }

        // Step 5: Update Exam doc
        newExam.subjects = subjectDocs.map(s => s._id);
        newExam.rooms = Array.from(allocatedRoomIds);
        await newExam.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            message: "Exam created successfully!",
            exam: newExam
        });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error creating exam:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
