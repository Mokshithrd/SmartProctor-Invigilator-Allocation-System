const Room = require("../models/Room");
const RoomAllocation = require("../models/RoomAllocation");
const moment = require("moment-timezone");

exports.checkRoomAvailability = async (selectedRoomIds, examDate, startTime, endTime, totalStudents) => {
    try {
        const date = moment.tz(examDate, "YYYY-MM-DD", "Asia/Kolkata").startOf("day").toDate();
        const formattedStart = moment(startTime, ["h:mm A", "HH:mm"]).format("HH:mm");
        const formattedEnd = moment(endTime, ["h:mm A", "HH:mm"]).format("HH:mm");

        // Fetch selected rooms
        const selectedRooms = await Room.find({ _id: { $in: selectedRoomIds } });

        // Fetch existing allocations for the same date/time
        const existingAllocations = await RoomAllocation.find({
            roomId: { $in: selectedRoomIds },
            date,
            $or: [
                { startTime: { $lt: formattedEnd }, endTime: { $gt: formattedStart } }
            ]
        });

        const usedCapacityMap = {};
        existingAllocations.forEach(alloc => {
            const roomIdStr = alloc.roomId.toString();
            usedCapacityMap[roomIdStr] = (usedCapacityMap[roomIdStr] || 0) + alloc.students.length;
        });

        // Calculate total available capacity
        let totalAvailable = 0;

        for (let room of selectedRooms) {
            const roomIdStr = room._id.toString();
            const used = usedCapacityMap[roomIdStr] || 0;
            const remaining = Math.max(0, room.capacity - used);
            totalAvailable += remaining;
        }

        if (totalAvailable < totalStudents) {
            return {
                success: false,
                message: `Insufficient total capacity for selected rooms on ${examDate} between ${startTime} and ${endTime}. Available: ${totalAvailable}, Required: ${totalStudents}`
            };
        }

        return {
            success: true,
            availableSeats: totalAvailable,
            message: `Sufficient capacity available for selected rooms.`
        };

    } catch (err) {
        console.error("Room availability check error:", err);
        return { success: false, message: "Internal Server Error" };
    }
};

exports.allocateStudentsToRooms = async (examId, subjectId, totalStudents, selectedRoomIds, examDate, startTime, endTime, semester, session) => {
    try {
        const date = moment.tz(examDate, "YYYY-MM-DD", "Asia/Kolkata").startOf("day").toDate();
        const formattedStart = moment(startTime, ["h:mm A", "HH:mm"]).format("HH:mm");
        const formattedEnd = moment(endTime, ["h:mm A", "HH:mm"]).format("HH:mm");

        // Check if there are existing allocations for these rooms at this time
        const existingAllocations = await RoomAllocation.find({
            roomId: { $in: selectedRoomIds },
            date,
            $or: [
                { startTime: { $lt: formattedEnd }, endTime: { $gt: formattedStart } }
            ]
        });

        if (existingAllocations.length > 0) {
            return {
                success: false,
                message: `Rooms already allocated for this date and time. Please select different rooms or timings.`
            };
        }

        let allocations = [];
        let studentIndex = 1;

        const allRooms = await Room.find({ _id: { $in: selectedRoomIds } });
        const sortedRooms = allRooms.sort((a, b) => b.capacity - a.capacity);

        for (let room of sortedRooms) {
            if (totalStudents <= 0) break;

            const assignCount = Math.min(totalStudents, room.capacity);
            if (assignCount === 0) continue;

            // Use consistent student naming format: "Sem{semester}-Student{index}"
            const students = Array.from(
                { length: assignCount }, 
                (_, i) => `Sem${semester}-Student${studentIndex + i}`
            );

            const newAllocation = new RoomAllocation({
                examId,
                subjectId,
                roomId: room._id,
                roomNumber: room.roomNumber,
                students,
                date,
                startTime: formattedStart,
                endTime: formattedEnd
            });

            await newAllocation.save({ session });
            allocations.push(newAllocation);

            studentIndex += assignCount;
            totalStudents -= assignCount;
        }

        if (totalStudents > 0) {
            return {
                success: false,
                message: `Insufficient capacity for students at ${examDate} ${startTime} - ${endTime}.`
            };
        }

        return {
            success: true,
            message: "Room allocation successful",
            allocations
        };
    } catch (err) {
        console.error("Allocation error:", err);
        return { success: false, message: "Internal Server Error" };
    }
};

/**
 * Allocate multiple semesters' students to rooms
 * @param {Array} semesterData - Array of objects with examId, subjectId, totalStudents, semester
 * @param {Array} selectedRoomIds - Array of room IDs to allocate
 * @param {String} examDate - Date of the exam
 * @param {String} startTime - Start time of the exam
 * @param {String} endTime - End time of the exam
 * @param {Object} session - Mongoose session for transaction
 * @returns {Object} - Result of allocation
 */
exports.allocateMultiSemesterToRooms = async (semesterData, selectedRoomIds, examDate, startTime, endTime, session) => {
    try {
        const date = moment.tz(examDate, "YYYY-MM-DD", "Asia/Kolkata").startOf("day").toDate();
        const formattedStart = moment(startTime, ["h:mm A", "HH:mm"]).format("HH:mm");
        const formattedEnd = moment(endTime, ["h:mm A", "HH:mm"]).format("HH:mm");

        // Check if there are existing allocations for these rooms at this time
        const existingAllocations = await RoomAllocation.find({
            roomId: { $in: selectedRoomIds },
            date,
            $or: [
                { startTime: { $lt: formattedEnd }, endTime: { $gt: formattedStart } }
            ]
        });

        if (existingAllocations.length > 0) {
            return {
                success: false,
                message: `Rooms already allocated for this date and time. Please select different rooms or timings.`
            };
        }

        // We expect exactly 2 semesters in the semesterData
        if (semesterData.length !== 2) {
            return {
                success: false,
                message: "Multi-semester allocation requires exactly 2 semesters."
            };
        }

        const sem1 = semesterData[0];
        const sem2 = semesterData[1];

        // Track remaining students to allocate
        let remainingSem1Students = sem1.totalStudents;
        let remainingSem2Students = sem2.totalStudents;
        let totalStudents = remainingSem1Students + remainingSem2Students;

        // Track student indices for each semester
        let sem1StudentIndex = 1;
        let sem2StudentIndex = 1;

        // Fetch all rooms and sort by capacity
        const allRooms = await Room.find({ _id: { $in: selectedRoomIds } });
        const sortedRooms = allRooms.sort((a, b) => b.capacity - a.capacity);

        let allocations = [];

        // First, distribute students evenly across rooms
        for (let room of sortedRooms) {
            if (remainingSem1Students <= 0 && remainingSem2Students <= 0) break;

            const roomCapacity = room.capacity;
            let sem1StudentsInRoom = 0;
            let sem2StudentsInRoom = 0;

            // Balanced allocation logic - divide room capacity equally
            if (remainingSem1Students > 0 && remainingSem2Students > 0) {
                // Try to allocate half of the room to each semester
                const halfCapacity = Math.floor(roomCapacity / 2);
                
                // Initially allocate half of room capacity to each semester
                sem1StudentsInRoom = Math.min(halfCapacity, remainingSem1Students);
                sem2StudentsInRoom = Math.min(halfCapacity, remainingSem2Students);
                
                // If one semester doesn't need its full half, give remaining space to the other
                const unusedCapacity = roomCapacity - (sem1StudentsInRoom + sem2StudentsInRoom);
                
                if (unusedCapacity > 0) {
                    if (remainingSem1Students > sem1StudentsInRoom) {
                        const additionalSem1 = Math.min(unusedCapacity, remainingSem1Students - sem1StudentsInRoom);
                        sem1StudentsInRoom += additionalSem1;
                    }
                    
                    // After giving to sem1, if there's still space and sem2 needs it
                    const stillUnused = roomCapacity - (sem1StudentsInRoom + sem2StudentsInRoom);
                    if (stillUnused > 0 && remainingSem2Students > sem2StudentsInRoom) {
                        const additionalSem2 = Math.min(stillUnused, remainingSem2Students - sem2StudentsInRoom);
                        sem2StudentsInRoom += additionalSem2;
                    }
                }
            } else if (remainingSem1Students > 0) {
                // Only semester 1 students left
                sem1StudentsInRoom = Math.min(roomCapacity, remainingSem1Students);
            } else {
                // Only semester 2 students left
                sem2StudentsInRoom = Math.min(roomCapacity, remainingSem2Students);
            }

            // Create a combined allocation for both semesters in the same room
            const combinedStudents = [];
            const subjectIds = [];
            
            // Add semester 1 students
            if (sem1StudentsInRoom > 0) {
                const sem1Students = Array.from(
                    { length: sem1StudentsInRoom }, 
                    (_, i) => `Sem${sem1.semester}-Student${sem1StudentIndex + i}`
                );
                combinedStudents.push(...sem1Students);
                subjectIds.push(sem1.subjectId);
                
                sem1StudentIndex += sem1StudentsInRoom;
                remainingSem1Students -= sem1StudentsInRoom;
            }
            
            // Add semester 2 students
            if (sem2StudentsInRoom > 0) {
                const sem2Students = Array.from(
                    { length: sem2StudentsInRoom }, 
                    (_, i) => `Sem${sem2.semester}-Student${sem2StudentIndex + i}`
                );
                combinedStudents.push(...sem2Students);
                subjectIds.push(sem2.subjectId);
                
                sem2StudentIndex += sem2StudentsInRoom;
                remainingSem2Students -= sem2StudentsInRoom;
            }
            
            // Create a single allocation with both semester subjects and students
            if (combinedStudents.length > 0) {
                const newAllocation = new RoomAllocation({
                    examId: sem1.examId, // Both have the same examId
                    subjectIds: subjectIds, // Store array of subject IDs
                    roomId: room._id,
                    roomNumber: room.roomNumber,
                    students: combinedStudents,
                    date,
                    startTime: formattedStart,
                    endTime: formattedEnd
                });
                
                await newAllocation.save({ session });
                allocations.push(newAllocation);
            }
        }

        // Check if all students were allocated
        if (remainingSem1Students > 0 || remainingSem2Students > 0) {
            return {
                success: false,
                message: `Insufficient capacity. Unable to allocate ${remainingSem1Students + remainingSem2Students} students.`
            };
        }

        return {
            success: true,
            message: "Multi-semester room allocation successful",
            allocations
        };
    } catch (err) {
        console.error("Multi-semester allocation error:", err);
        return { success: false, message: "Internal Server Error" };
    }
};