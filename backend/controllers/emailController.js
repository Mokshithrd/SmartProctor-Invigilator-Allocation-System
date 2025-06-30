const Allocation = require("../models/Allocation");
const User = require("../models/User");
const Exam = require("../models/Exam");
const Room = require("../models/Room");
const sendEmail = require("../utils/sendEmail");

// Format time to 12-hour clock
const formatTime12Hour = (timeStr) => {
    const [hour, minute] = timeStr.split(":");
    const date = new Date();
    date.setHours(hour, minute);
    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
};

// Delay function to pause between emails
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

exports.sendFacultyEmailsForExam = async (req, res) => {
    const { examId } = req.params;

    try {
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ success: false, message: "Exam not found" });
        }

        const allocations = await Allocation.find({ examId })
            .populate("facultyId", "name email")
            .populate("roomId", "roomNumber building floor");

        // Group allocations by faculty email
        const facultyMap = {};

        allocations.forEach(allocation => {
            const email = allocation.facultyId.email;
            const name = allocation.facultyId.name;

            if (!facultyMap[email]) {
                facultyMap[email] = {
                    name,
                    allocations: []
                };
            }

            facultyMap[email].allocations.push({
                date: allocation.date,
                startTime: allocation.startTime,
                endTime: allocation.endTime,
                room: allocation.roomId,
            });
        });

        // Send email to each faculty with delay
        for (const [email, { name, allocations }] of Object.entries(facultyMap)) {
            let text = `Hello ${name},\n\nYou have been assigned for the exam "${exam.name}" (Semester: ${exam.sem}).\n\nHere are your invigilation details:\n\n`;

            allocations.forEach((a, i) => {
                const formattedStart = formatTime12Hour(a.startTime);
                const formattedEnd = formatTime12Hour(a.endTime);

                text += `${i + 1}. Date: ${a.date.toDateString()}\n   Time: ${formattedStart} - ${formattedEnd}\n   Room: ${a.room.building}, ${a.room.roomNumber}, ${a.room.floor}\n\n`;
            });

            text += "Please be present at your assigned room 10 minutes before the scheduled time.\n\nRegards,\nExam Cell";

            await sendEmail(email, `Invigilation Details for ${exam.name}`, text);

            // Wait 1.5 seconds to avoid Google rate limiting
            await delay(30);
        }

        return res.status(200).json({ success: true, message: "Emails sent successfully" });
    } catch (error) {
        console.error("Error sending faculty emails:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
