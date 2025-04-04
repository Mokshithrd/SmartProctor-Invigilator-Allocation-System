const Room = require("../models/Room");
const RoomAllocation = require("../models/RoomAllocation");
const moment = require("moment");

// Function to check room availability before allocation
exports.checkRoomAvailability = async (selectedRoomIds, examDate, startTime, endTime) => {
    try {
        const formattedExamDate = moment(examDate, "YYYY-MM-DD").startOf("day").toISOString();
        const formattedStartTime = moment(startTime, ["h:mm A", "HH:mm"]).format("HH:mm");
        const formattedEndTime = moment(endTime, ["h:mm A", "HH:mm"]).format("HH:mm");

        // Check for existing allocations that overlap in the selected rooms
        const existingAllocations = await RoomAllocation.find({
            roomId: { $in: selectedRoomIds },
            date: formattedExamDate,
            $or: [
                { startTime: { $lt: formattedEndTime }, endTime: { $gt: formattedStartTime } }
            ]
        });

        if (existingAllocations.length > 0) {
            const conflictedRoom = existingAllocations[0].roomNumber;
            return {
                success: false,
                message: `Room ${conflictedRoom} is already allocated on ${examDate} between ${startTime} and ${endTime}.`
            };
        }

        return { success: true };
    } catch (err) {
        console.error("Error checking room availability:", err);
        return { success: false, message: "Internal Server Error" };
    }
};

exports.allocateStudentsToRooms = async (examId, totalStudents, selectedRoomIds, examDate, startTime, endTime) => {
    try {
        const selectedRooms = await Room.find({ _id: { $in: selectedRoomIds } });
        let studentIndex = 1;
        let allocations = [];

        const formattedExamDate = moment(examDate, "YYYY-MM-DD").startOf("day").toISOString();
        const formattedStartTime = moment(startTime, ["h:mm A", "HH:mm"]).format("HH:mm");
        const formattedEndTime = moment(endTime, ["h:mm A", "HH:mm"]).format("HH:mm");

        for (let room of selectedRooms) {
            const assignedCount = Math.min(room.totalBenches * 2, totalStudents);
            if (assignedCount === 0) break;

            const allocation = new RoomAllocation({
                examId,
                roomId: room._id,
                roomNumber: room.roomNumber,
                students: Array.from({ length: assignedCount }, (_, i) => `Student ${studentIndex + i}`),
                date: formattedExamDate,
                startTime: formattedStartTime,
                endTime: formattedEndTime
            });

            await allocation.save();
            allocations.push(allocation);

            studentIndex += assignedCount;
            totalStudents -= assignedCount;
            if (totalStudents <= 0) break;
        }

        return { success: true, message: "Rooms allocated successfully.", allocations };
    } catch (err) {
        console.error("Error in room allocation:", err);
        return { success: false, message: "Internal Server Error" };
    }
};
