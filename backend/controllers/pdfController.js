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

    // Utility for ordinal suffix
    function getFloorSuffix(floor) {
        const j = floor % 10, k = floor % 100;
        if (j === 1 && k !== 11) return `${floor}st`;
        if (j === 2 && k !== 12) return `${floor}nd`;
        if (j === 3 && k !== 13) return `${floor}rd`;
        return `${floor}th`;
    }

    try {
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ success: false, message: "Exam not found" });
        }

        const roomAllocations = await RoomAllocation.find({ examId })
            .populate("roomId")
            .lean();

        // Group students by semester
        const studentAllocationsBySemester = {};
        const processedRooms = new Map();

        // Process all room allocations
        for (const alloc of roomAllocations) {
            const room = alloc.roomId;
            if (!room) continue;

            // Process students grouped by semester
            const studentsBySemester = {};

            alloc.students.forEach(studentId => {
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
                const roomKey = `${room._id}-${semester}`;

                // Skip if we've already processed this room for this semester
                if (processedRooms.has(roomKey)) {
                    continue;
                }

                processedRooms.set(roomKey, true);

                if (semesterStudents.length === 0) continue;

                // Sort students numerically
                const sortedStudents = [...semesterStudents].sort((a, b) => a - b);

                const rangeStart = sortedStudents[0];
                const rangeEnd = sortedStudents[sortedStudents.length - 1];

                studentAllocationsBySemester[semester].push({
                    studentRange: `${rangeStart} - ${rangeEnd}`,
                    rangeStart: rangeStart,
                    count: sortedStudents.length,
                    room: {
                        building: room.building,
                        roomNumber: room.roomNumber,
                        floor: getFloorSuffix(room.floor)
                    }
                });
            }
        }

        // Sort each semester's allocations by range start
        Object.keys(studentAllocationsBySemester).forEach(semester => {
            studentAllocationsBySemester[semester].sort((a, b) => a.rangeStart - b.rangeStart);
        });

        // Create a complete HTML with all semesters
        let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                }
                h2 {
                    text-align: center;
                    margin-bottom: 20px;
                }
                h3 {
                    text-align: center;
                    margin-top: 30px;
                    margin-bottom: 10px;
                }
                table {
                    border-collapse: collapse;
                    width: 100%;
                    margin-top: 10px;
                    margin-bottom: 20px;
                }
                th, td {
                    border: 1px solid #333;
                    padding: 10px;
                    text-align: center;
                    font-size: 14px;
                }
                th {
                    background-color: #f0f0f0;
                }
                tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                .page-break {
                    page-break-after: always;
                }
            </style>
        </head>
        <body>`;

        // Sort semesters numerically
        const sortedSemesters = Object.keys(studentAllocationsBySemester)
            .map(Number)
            .sort((a, b) => a - b);

        // Add each semester's table with page breaks between them
        sortedSemesters.forEach((semester, index) => {
            const allocations = studentAllocationsBySemester[semester];

            htmlContent += `
            <div${index > 0 ? ' class="page-break"' : ''}>
                <h2>Student Room Allotments - ${exam.name}</h2>
                <h3>Semester ${semester}</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Student Range</th>
                            <th>Count</th>
                            <th>Room Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${allocations.map(r => `
                        <tr>
                            <td>${r.studentRange}</td>
                            <td>${r.count}</td>
                            <td>${r.room.building}, Room ${r.room.roomNumber}, ${r.room.floor} Floor</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>`;
        });

        htmlContent += `
        </body>
        </html>`;

        const browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true
        });
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

function getFloorSuffix(floor) {
    const j = floor % 10, k = floor % 100;
    if (j === 1 && k !== 11) return `${floor}st`;
    if (j === 2 && k !== 12) return `${floor}nd`;
    if (j === 3 && k !== 13) return `${floor}rd`;
    return `${floor}th`;
}

exports.exportFacultyAllotmentPDF = async (req, res) => {
    const { examId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(examId)) {
        return res.status(400).json({ success: false, message: "Invalid examId" });
    }

    try {
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ success: false, message: "Exam not found" });
        }

        const allocations = await Allocation.find({ examId })
            .populate("facultyId", "name designation")
            .populate("roomId", "roomNumber building floor");

        // Preprocess into a matrix structure: { date: { time: { facultyName: true } } }
        const timetable = {};
        const allTimes = new Set();
        const allFaculty = new Set();
        const timetableDetails = {};

        allocations.forEach(a => {
            const faculty = a.facultyId;
            const facultyName = faculty ? faculty.name : "Unknown Faculty";
            allFaculty.add(facultyName);

            const date = moment(a.date).format("YYYY-MM-DD");
            const time = `${convertTo12Hour(a.startTime)} - ${convertTo12Hour(a.endTime)}`;
            const room = a.roomId
                ? `${a.roomId.building}, ${a.roomId.roomNumber}, ${getFloorSuffix(a.roomId.floor)} Floor`
                : "";

            // for star matrix
            if (!timetable[date]) timetable[date] = {};
            if (!timetable[date][time]) timetable[date][time] = {};
            timetable[date][time][facultyName] = true;

            // for room matrix
            if (!timetableDetails[date]) timetableDetails[date] = {};
            if (!timetableDetails[date][time]) timetableDetails[date][time] = {};
            timetableDetails[date][time][facultyName] = room;

            allTimes.add(time);
        });

        const sortedDates = Object.keys(timetable).sort();
        const sortedTimes = Array.from(allTimes).sort();
        const sortedFaculty = Array.from(allFaculty).sort();

        // Build HTML table
        let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
                h2 { text-align: center; margin-bottom: 10px; }
                h3 { margin-top: 40px; text-align: center; }
                table { border-collapse: collapse; width: 100%; margin-top: 10px; }
                th, td { border: 1px solid #000; padding: 5px; text-align: center; }
                th { background-color: #eee; }
                td.star { font-weight: bold; font-size: 14px; }
                .staff-name { width: 160px; text-align: center; padding-left: 8px; }
                .small-font { font-size: 10px; }
            </style>
        </head>
        <body>

            <h2>Faculty Duty Allotment - ${exam.name}</h2>

            <table class="small-font">
                <thead>
                    <tr>
                        <th class="staff-name" rowspan="2">Staff Name</th>
                        ${sortedDates.map(date => `<th colspan="${sortedTimes.length}">${date}</th>`).join('')}
                    </tr>
                    <tr>
                        ${sortedDates.map(() =>
                        sortedTimes.map(time => `<th>${time}</th>`).join('')
                        ).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${sortedFaculty.map(faculty => {
                            return `<tr>
                        <td class="staff-name">${faculty}</td>
                        ${sortedDates.map(date =>
                                sortedTimes.map(time => {
                                    const roomInfo = timetableDetails?.[date]?.[time]?.[faculty] || "";
                                    return `<td>${roomInfo}</td>`;
                                }).join('')
                            ).join('')}
                        </tr>`;
                        }).join('')}
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
        const pdfBuffer = await page.pdf({ format: "A4", landscape: true, printBackground: true });
        await browser.close();

        res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=faculty_matrix_${exam.name}.pdf`,
            'Content-Length': pdfBuffer.length
        });
        res.end(pdfBuffer);

    } catch (err) {
        console.error("Error generating faculty matrix PDF:", err);
        res.status(500).json({ success: false, message: "Failed to generate PDF" });
    }
};
