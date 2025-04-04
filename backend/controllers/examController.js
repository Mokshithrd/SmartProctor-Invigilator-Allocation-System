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

        // Validate required fields
        if (!name || !semester || !year || !totalStudents || 
            !Array.isArray(rooms) || rooms.length === 0 ||
            !Array.isArray(faculty) || faculty.length === 0 ||
            !Array.isArray(subjects) || subjects.length === 0) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        // Validate subject details
        for (let subject of subjects) {
            if (!subject.name || !subject.subjectCode || !subject.date || !subject.startTime || !subject.endTime) {
                return res.status(400).json({ success: false, message: "Each subject must have a Name, Subject Code, Date, Start time and End time." });
            }
        }

        // Fetch selected rooms from DB
        const selectedRooms = await Room.find({ _id: { $in: rooms } });

        if (selectedRooms.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid room selection." });
        }

        // Validate total room capacity
        const totalCapacity = selectedRooms.reduce((sum, room) => sum + (room.totalBenches * 2), 0);
        if (totalCapacity < totalStudents) {
            return res.status(400).json({
                success: false,
                message: `Selected rooms can only accommodate ${totalCapacity} students, but total students are ${totalStudents}.`
            });
        }

        // Validate faculty count (Faculty >= Number of Rooms)
        if (faculty.length < selectedRooms.length) {
            return res.status(400).json({
                success: false,
                message: `At least ${selectedRooms.length} faculty members are required for ${selectedRooms.length} rooms, but only ${faculty.length} provided.`
            });
        }

        // Step 1: Check room availability for all subjects before proceeding
        for (let subject of subjects) {
            const conflict = await RoomAllocator.checkRoomAvailability(rooms, subject.date, subject.startTime, subject.endTime);
            if (!conflict.success) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json(conflict);
            }
        }

        // Step 2: Create Exam Record
        const newExam = new Exam({
            name,
            semester,
            year,
            totalStudents,
            rooms: [], // Initially empty, will be updated after room allocation
            faculty,
            subjects: []
        });

        await newExam.save({ session });

        // Step 3: Create Subjects
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

        // Step 4: Allocate Students to Rooms for Each Subject
        let allocatedRooms = new Set();
        for (let subject of subjectDocs) {
            const allocationResult = await RoomAllocator.allocateStudentsToRooms(
                newExam._id,
                totalStudents,
                rooms,
                subject.date,
                subject.startTime,
                subject.endTime
            );

            if (!allocationResult.success) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json(allocationResult);
            }

            allocationResult.allocations.forEach(allocation => allocatedRooms.add(allocation.roomId.toString()));
        }

        // Step 5: Update Exam with Subject IDs and Allocated Room IDs
        newExam.subjects = subjectDocs.map(sub => sub._id);
        newExam.rooms = Array.from(allocatedRooms); // Only store allocated rooms
        await newExam.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            message: "Exam created successfully!",
            exam: newExam
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error creating exam:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
