const puppeteer = require("puppeteer");
const Exam = require("../models/Exam");
const RoomAllocation = require("../models/RoomAllocation");
const Allocation = require("../models/Allocation");
const moment = require("moment");
const mongoose = require("mongoose");

// Utility for converting time to 12-hour format
function convertTo12Hour(timeStr) {
    const [hour, minute] = timeStr.split(":");
    const h = parseInt(hour, 10);
    const suffix = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${minute} ${suffix}`;
}

exports.exportStudentAllotmentPDF = async (req, res) => {
    const { examId } = req.params;

    // Validate the examId
    if (!mongoose.Types.ObjectId.isValid(examId)) {
        return res.status(400).json({ success: false, message: "Invalid examId" });
    }

    try {
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ success: false, message: "Exam not found" });
        }

        const roomAllocations = await RoomAllocation.find({ examId }).populate("roomId");

        const seenRooms = new Set();
        const studentRoomAllotments = [];

        roomAllocations.forEach((alloc) => {
            const room = alloc.roomId;

            if (room && !seenRooms.has(room._id)) {
                seenRooms.add(room._id);

                const rollNumbers = alloc.students
                    .map((s) => {
                        const match = s.match(/\d+/); // Extract numeric part
                        return match ? parseInt(match[0], 10) : null;
                    })
                    .filter(n => n !== null)
                    .sort((a, b) => a - b);

                const studentRangeStart = rollNumbers[0] || 0;
                const studentRangeEnd = rollNumbers[rollNumbers.length - 1] || 0;

                studentRoomAllotments.push({
                    studentRange: `${studentRangeStart} - ${studentRangeEnd}`,
                    rangeStart: studentRangeStart, // for sorting
                    count: rollNumbers.length,
                    room: room ? {
                        building: room.building,
                        roomNumber: room.roomNumber,
                        floor: room.floor,
                    } : {}
                });
            }
        });

        studentRoomAllotments.sort((a, b) => a.rangeStart - b.rangeStart);

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid black; padding: 8px; text-align: center; }
                th { background-color: #f0f0f0; }
            </style>
        </head>
        <body>
            <h2>Student Room Allotments - ${exam.name}</h2>
            <table>
                <thead>
                    <tr>
                        <th>Student Range</th>
                        <th>Count</th>
                        <th>Room Details</th>
                    </tr>
                </thead>
                <tbody>
                    ${studentRoomAllotments.map(r => `
                    <tr>
                        <td>${r.studentRange}</td>
                        <td>${r.count}</td>
                        <td>${r.room.building}, ${r.room.roomNumber}, ${r.room.floor}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
        `;

        const browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: "A4" });
        await browser.close();

        res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=student_allotments_${exam.name}.pdf`,
            'Content-Length': pdfBuffer.length
        });
        res.end(pdfBuffer);

    } catch (err) {
        console.error("Error generating student allotment PDF:", err);
        res.status(500).json({ success: false, message: "Failed to generate PDF" });
    }
};

exports.exportFacultyAllotmentPDF = async (req, res) => {
    const { examId } = req.params;

    // Validate the examId
    if (!mongoose.Types.ObjectId.isValid(examId)) {
        return res.status(400).json({ success: false, message: "Invalid examId" });
    }

    try {
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ success: false, message: "Exam not found" });
        }

        const allocations = await Allocation.find({ examId })
            .populate("facultyId", "name")
            .populate("roomId", "roomNumber building floor");

        // Updated sorting logic to fix invalid sort() argument error
        const facultyRoomAllotments = allocations.map((a) => {
            const room = a.roomId;
            return {
                facultyName: a.facultyId ? a.facultyId.name : "Unknown Faculty",
                date: moment(a.date).format("YYYY-MM-DD"),
                time: `${convertTo12Hour(a.startTime)} - ${convertTo12Hour(a.endTime)}`,
                room: room ? {
                    building: room.building,
                    roomNumber: room.roomNumber,
                    floor: room.floor,
                } : {}
            };
        });

        // Sorting by date and time correctly
        facultyRoomAllotments.sort((a, b) => {
            const dateTimeA = new Date(`${a.date}T${a.time.split(" - ")[0]}`);
            const dateTimeB = new Date(`${b.date}T${b.time.split(" - ")[0]}`);
            return dateTimeA - dateTimeB;
        });

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid black; padding: 8px; text-align: center; }
                th { background-color: #f0f0f0; }
            </style>
        </head>
        <body>
            <h2>Faculty Room Allotments - ${exam.name}</h2>
            <table>
                <thead>
                    <tr>
                        <th>Faculty Name</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Room Details</th>
                    </tr>
                </thead>
                <tbody>
                    ${facultyRoomAllotments.map(r => `
                    <tr>
                        <td>${r.facultyName}</td>
                        <td>${r.date}</td>
                        <td>${r.time}</td>
                        <td>${r.room.building}, ${r.room.roomNumber}, ${r.room.floor}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
        `;

        const browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: "A4" });
        console.log("PDF buffer size:", pdfBuffer.length);
        await browser.close();

        res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=faculty_allotments_${exam.name}.pdf`,
            'Content-Length': pdfBuffer.length
        });
        res.end(pdfBuffer);

    } catch (err) {
        console.error("Error generating faculty allotment PDF:", err);
        res.status(500).json({ success: false, message: "Failed to generate PDF" });
    }
};
