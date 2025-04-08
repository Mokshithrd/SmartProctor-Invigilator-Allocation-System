const Room = require("../models/Room");
const RoomAllocation = require("../models/RoomAllocation");
const moment = require("moment-timezone");

exports.checkRoomAvailability = async (selectedRoomIds, examDate, startTime, endTime, totalStudents) => {
    try {
        const date = moment.tz(examDate, "YYYY-MM-DD", "Asia/Kolkata").startOf("day").toDate();
        const formattedStart = moment(startTime, ["h:mm A", "HH:mm"]).format("HH:mm");
        const formattedEnd = moment(endTime, ["h:mm A", "HH:mm"]).format("HH:mm");
        // console.log("▶ Exam Date (Raw):", examDate);
        // console.log("▶ Parsed Local Date:", moment.tz(examDate, "Asia/Kolkata").format());
        // console.log("▶ Stored Date (UTC):", date);


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

        // console.log("Total available seats:", totalAvailable);
        // console.log("Total students to allocate:", totalStudents);

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

exports.allocateStudentsToRooms = async (examId, subjectId, totalStudents, selectedRoomIds, examDate, startTime, endTime, session) => {
    try {
        const date = moment.tz(examDate, "YYYY-MM-DD", "Asia/Kolkata").startOf("day").toDate();
        const formattedStart = moment(startTime, ["h:mm A", "HH:mm"]).format("HH:mm");
        const formattedEnd = moment(endTime, ["h:mm A", "HH:mm"]).format("HH:mm");
        // console.log("▶ Exam Date (Raw):", examDate);
        // console.log("▶ Parsed Local Date:", moment.tz(examDate, "Asia/Kolkata").format());
        // console.log("▶ Stored Date (UTC):", date);

        let allocations = [];
        let studentIndex = 1;

        // Step 1: Find existing allocations (partially used)
        const existingAllocations = await RoomAllocation.find({
            roomId: { $in: selectedRoomIds },
            date,
            startTime: formattedStart,
            endTime: formattedEnd
        });

        const usedRoomIds = existingAllocations.map(a => a.roomId.toString());
        const roomUsageMap = {};

        existingAllocations.forEach(a => {
            const roomId = a.roomId.toString();
            const assigned = a.students.length;
            roomUsageMap[roomId] = (roomUsageMap[roomId] || 0) + assigned;
            // console.log("roomUsageMap[roomId] = ",roomUsageMap[roomId]);
        });

        const allRooms = await Room.find({ _id: { $in: selectedRoomIds } });
        const sortedRooms = allRooms.sort((a, b) => b.capacity - a.capacity);

        for (let room of sortedRooms) {
            const roomIdStr = room._id.toString();
            let availableSeats;

            if (usedRoomIds.includes(roomIdStr)) {
                availableSeats = room.capacity - (roomUsageMap[roomIdStr] || 0);
            } else {
                availableSeats = room.capacity;
            }

            if (availableSeats <= 0) continue;

            const assignCount = Math.min(totalStudents, availableSeats);
            if (assignCount === 0) continue;

            const students = Array.from({ length: assignCount }, (_, i) => `Student ${studentIndex + i}`);

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
            if (totalStudents <= 0) break;
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
