const Allocation = require("../models/Allocation");
const RoomAllocation = require("../models/RoomAllocation");
const User = require("../models/User");
const moment = require("moment-timezone");

function isTimeOverlap(slot1, slot2) {
    return (
        moment(slot1.startTime, "HH:mm").isBefore(moment(slot2.endTime, "HH:mm")) &&
        moment(slot2.startTime, "HH:mm").isBefore(moment(slot1.endTime, "HH:mm"))
    );
}

function getDesignationPercentageLimit(totalRooms) {
    return {
        assistantMin: Math.floor(totalRooms * 0.4),
        assistantMax: Math.ceil(totalRooms * 0.5),
        associateMin: Math.floor(totalRooms * 0.2),
        associateMax: Math.ceil(totalRooms * 0.35),
        professorMin: 0,
        professorMax: Math.ceil(totalRooms * 0.15),
    };
}

exports.allocateFacultyToRooms = async (examId, facultyIds, session) => {
    try {
        const roomAllocations = await RoomAllocation.find({ examId }).session(session);
        if (roomAllocations.length === 0) {
            return { success: false, message: "No rooms have been allocated to students." };
        }

        const roomTimeSlots = roomAllocations.map(room => ({
            roomId: room.roomId.toString(),
            roomNumber: room.roomNumber,
            subjectId: room.subjectId,
            date: room.date,
            startTime: room.startTime,
            endTime: room.endTime
        }));

        console.log("roomTimeSlots = \n", roomTimeSlots);

        const facultyList = await User.find({
            _id: { $in: facultyIds },
            role: "Faculty",
            available: true
        });

        console.log("facultyList = \n", facultyList);

        if (facultyList.length === 0) {
            return { success: false, message: "No available faculty members." };
        }

        const assignedFaculty = [];
        const reusableFaculty = [];
        const previousAllocationsMap = new Map();

        // Step 1: Reuse faculty from previous exact room/date/time matches
        for (let slot of roomTimeSlots) {
            const existing = await Allocation.findOne({
                roomId: slot.roomId,
                date: slot.date,
                startTime: slot.startTime,
                endTime: slot.endTime
            }).session(session);

            console.log("existing = \n", existing);

            if (existing) {
                assignedFaculty.push({
                    examId,
                    subjectId: slot.subjectId,
                    roomId: slot.roomId,
                    facultyId: existing.facultyId,
                    facultyName: existing.facultyName,
                    date: slot.date,
                    startTime: slot.startTime,
                    endTime: slot.endTime
                });

                reusableFaculty.push(existing.facultyId.toString());
                previousAllocationsMap.set(slot.roomId + slot.startTime + slot.endTime, existing.facultyId.toString());
            }
        }

        console.log("reusableFaculty = \n", reusableFaculty);
        console.log("previousAllocationsMap = \n", previousAllocationsMap);

        const remainingSlots = roomTimeSlots.filter(slot =>
            !previousAllocationsMap.has(slot.roomId + slot.startTime + slot.endTime)
        );

        console.log("remainingSlots = \n", remainingSlots);

        const designationGroups = {
            assistant: [],
            associate: [],
            professor: []
        };

        for (const faculty of facultyList) {
            if (reusableFaculty.includes(faculty._id.toString())) continue;
            if (faculty.designation === "Assistant Professor") designationGroups.assistant.push(faculty);
            else if (faculty.designation === "Associate Professor") designationGroups.associate.push(faculty);
            else if (faculty.designation === "Professor") designationGroups.professor.push(faculty);
        }

        console.log("designationGroups = \n", designationGroups);

        const totalRemaining = remainingSlots.length;
        console.log("totalRemaining = \n", totalRemaining);

        const limits = getDesignationPercentageLimit(totalRemaining);
        console.log("limits = \n", limits);

        // Step 1: Gather eligible faculty per designation and attach their previousAllocations
        function sortAndShuffleFaculty(facultyArray) {
            return facultyArray
                .sort((a, b) => a.previousAllocations - b.previousAllocations)
                .reduce((acc, curr, idx, arr) => {
                    if (idx === 0 || curr.previousAllocations !== arr[idx - 1].previousAllocations) {
                        acc.push([curr]);
                    } else {
                        acc[acc.length - 1].push(curr);
                    }
                    return acc;
                }, [])
                .flatMap(group => {
                    // Shuffle each group with equal previousAllocations
                    for (let i = group.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [group[i], group[j]] = [group[j], group[i]];
                    }
                    return group;
                });
        }

        // Step 2: Apply designation limits and sort+shuffle inside those
        let sortedFacultyPool = [
            ...sortAndShuffleFaculty(designationGroups.assistant).slice(0, limits.assistantMax),
            ...sortAndShuffleFaculty(designationGroups.associate).slice(0, limits.associateMax),
            ...sortAndShuffleFaculty(designationGroups.professor).slice(0, limits.professorMax)
        ];

        console.log("sortedFacultyPool (prioritized & shuffled) = \n", sortedFacultyPool.map(f => ({
            name: f.name,
            previousAllocations: f.previousAllocations,
            designation: f.designation
        })));


        // Final selected unique faculty for one-time assignment
        const selectedFaculty = sortedFacultyPool.slice(0, totalRemaining);
        console.log("🧠 Selected Faculty (unique allocation first):", selectedFaculty.map(f => f.name));

        const shortage = selectedFaculty.length < totalRemaining;
        console.log("shortage = \n", shortage);

        const facultySlotMap = {};
        const usedFaculty = new Set();

        for (let slot of remainingSlots) {
            let allocated = false;

            // Step 1: Try unique faculty first
            for (let faculty of selectedFaculty) {
                const fId = faculty._id.toString();
                if (usedFaculty.has(fId)) continue;

                assignedFaculty.push({
                    examId,
                    subjectId: slot.subjectId,
                    roomId: slot.roomId,
                    facultyId: faculty._id,
                    facultyName: faculty.name,
                    date: slot.date,
                    startTime: slot.startTime,
                    endTime: slot.endTime
                });

                facultySlotMap[fId] = [slot];
                usedFaculty.add(fId);
                allocated = true;
                break;
            }

            // Step 2: If not allocated and shortage, allow reuse if no time conflict
            if (!allocated && shortage) {
                for (let faculty of facultyList) {
                    const fId = faculty._id.toString();
                    const existingSlots = facultySlotMap[fId] || [];

                    const overlap = existingSlots.some(existing =>
                        existing.date.getTime() === slot.date.getTime() && isTimeOverlap(existing, slot)
                    );

                    if (!overlap) {
                        assignedFaculty.push({
                            examId,
                            subjectId: slot.subjectId,
                            roomId: slot.roomId,
                            facultyId: faculty._id,
                            facultyName: faculty.name,
                            date: slot.date,
                            startTime: slot.startTime,
                            endTime: slot.endTime
                        });

                        facultySlotMap[fId] = [...existingSlots, slot];
                        usedFaculty.add(fId);
                        allocated = true;
                        break;
                    }
                }
            }

            if (!allocated) {
                return {
                    success: false,
                    message: `Not enough faculty available for room ${slot.roomNumber} at ${slot.startTime} on ${slot.date.toDateString()}.`
                };
            }
        }

        await Allocation.insertMany(assignedFaculty, { session });

        const allocationCountByFaculty = {};
        for (let alloc of assignedFaculty) {
            const fId = alloc.facultyId.toString();

            if (reusableFaculty.includes(fId)) continue;

            allocationCountByFaculty[fId] = (allocationCountByFaculty[fId] || 0) + 1;
        }

        const updateOps = Object.entries(allocationCountByFaculty).map(([facultyId, count]) =>
            User.updateOne({ _id: facultyId }, { $inc: { previousAllocations: count } }, { session })
        );

        await Promise.all(updateOps);

        return {
            success: true,
            message: "Faculty allocation successful",
            allocations: assignedFaculty
        };

    } catch (err) {
        console.error("❌ Faculty allocation error:", err);
        return { success: false, message: "Internal Server Error" };
    }
};
