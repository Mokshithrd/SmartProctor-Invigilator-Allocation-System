import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Typography, Box, CircularProgress, Alert, Button, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab, Stack, Divider, } from '@mui/material';
import { Download, MailOutline } from '@mui/icons-material';

const ExamDetail = () => {
    const { id } = useParams();
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        const fetchExamDetails = async () => {
            try {
                const response = await axios.get(`https://smartproctor-mokshith.onrender.com/exams/${id}`, { withCredentials: true });
                setExam(response.data.exam);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching exam details:", err);
                setError("Failed to load exam details. Please try again later.");
                setLoading(false);
            }
        };
        fetchExamDetails();
    }, [id]);

    const handleDownloadPDF = async (type) => {
        try {
            const endpoint = type === 'faculty' ? `/pdf/faculty-room-pdf/${id}` : `/pdf/student-room-pdf/${id}`;

            const response = await axios.get(`https://smartproctor-mokshith.onrender.com${endpoint}`, {
                responseType: 'blob',
                withCredentials: true,
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${exam.name}_${type}_allocation.pdf`); // File name remains descriptive
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(`Error downloading ${type} PDF:`, err);
            alert(`Failed to download ${type} PDF. Please try again.`);
        }
    };

    const handleSendEmails = async () => {
        try {
            const confirmSend = window.confirm("Are you sure you want to send emails to all faculty?");
            if (!confirmSend) {
                return;
            }
            await axios.post(`https://smartproctor-mokshith.onrender.com/admin/send-emails/${id}`, {}, { withCredentials: true });
            alert("Emails sent successfully!");
        } catch (err) {
            console.error("Error sending emails:", err);
            alert("Failed to send emails. Please check server logs or try again.");
        }
    };

    const handleChangeTab = (event, newValue) => {
        setTabValue(newValue);
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!exam) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="info">No exam details found.</Alert>
            </Container>
        );
    }

    const TabPanel = (props) => {
        const { children, value, index, ...other } = props;
        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...other}
            >
                {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
            </div>
        );
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={4} sx={{ p: 4, borderRadius: '12px' }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', md: 'center' },
                        mb: 3,
                    }}
                >
                    <Typography
                        variant="h4"
                        component="h1"
                        gutterBottom
                        sx={{ fontWeight: 'bold', color: 'primary.dark', mb: { xs: 2, md: 0 } }}
                    >
                        Exam Details: {exam.name} ({exam.year})
                    </Typography>
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1.5}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}
                        width={{ xs: '100%', md: 'auto' }}
                        sx={{ mt: { xs: 2, md: 0 } }}
                    >
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<Download fontSize="small" />}
                            onClick={() => handleDownloadPDF('faculty')}
                            sx={{
                                backgroundColor: '#1976d2',
                                '&:hover': { backgroundColor: '#115293' },
                                color: 'white',
                                py: 0.8,
                                px: 2,
                                borderRadius: '6px',
                                fontSize: '0.85rem'
                            }}
                        >
                            Faculty PDF
                        </Button>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<Download fontSize="small" />}
                            onClick={() => handleDownloadPDF('student')}
                            sx={{
                                backgroundColor: '#388e3c',
                                '&:hover': { backgroundColor: '#2e7d32' },
                                color: 'white',
                                py: 0.8,
                                px: 2,
                                borderRadius: '6px',
                                fontSize: '0.85rem'
                            }}
                        >
                            Student PDF
                        </Button>
                    </Stack>
                </Box>

                <Divider sx={{ mb: 4 }} />

                <Grid container spacing={3} mb={4}>
                    <Grid item xs={12} md={6}>
                        <Paper variant="outlined" sx={{ p: 3, borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: '600', color: 'text.secondary' }}>Basic Information</Typography>
                            <Typography sx={{ mb: 0.5 }}><strong>Name:</strong> {exam.name}</Typography>
                            <Typography><strong>Year:</strong> {exam.year}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Paper variant="outlined" sx={{ p: 3, borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: '600', color: 'text.secondary' }}>Semesters & Total Students</Typography>
                            {exam.semesters.map((s, index) => (
                                <Typography key={index} sx={{ mb: index === exam.semesters.length - 1 ? 0 : 0.5 }}>
                                    <strong>Semester {s.semester}:</strong> {s.totalStudents} Students
                                </Typography>
                            ))}
                        </Paper>
                    </Grid>
                </Grid>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleChangeTab}
                        aria-label="exam details tabs"
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: '600',
                            },
                        }}
                    >
                        <Tab label="Rooms" />
                        <Tab label="Faculty Allocations" />
                        {Object.keys(exam.subjectsBySemester).map((sem) => (
                            <Tab key={`subject-tab-${sem}`} label={`Subjects (Sem ${sem})`} />
                        ))}
                        {Object.keys(exam.studentAllocationsBySemester).map((sem) => (
                            <Tab key={`student-tab-${sem}`} label={`Student Allocations (Sem ${sem})`} />
                        ))}
                    </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: '600', color: 'text.primary' }}>Allocated Rooms</Typography>
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '8px', overflow: 'hidden' }}>
                        <Table size="small">
                            <TableHead sx={{ bgcolor: 'primary.main' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Room Number</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Building</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Floor</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Capacity</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {exam.rooms.map((room) => (
                                    <TableRow key={room._id} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } }}>
                                        <TableCell>{room.roomNumber}</TableCell>
                                        <TableCell>{room.building}</TableCell>
                                        <TableCell>{room.floor}</TableCell>
                                        <TableCell>{room.capacity}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: '600', color: 'text.primary' }}>
                        Faculty Room Allotment Matrix
                    </Typography>

                    {(() => {
                        const timetableDetails = {};
                        const allDates = new Set();
                        const allTimes = new Set();
                        const allFaculty = new Set();

                        exam.facultyAllocations.forEach(({ facultyName, date, time, roomDetails }) => {
                            allDates.add(date);
                            allTimes.add(time);
                            allFaculty.add(facultyName);

                            if (!timetableDetails[facultyName]) timetableDetails[facultyName] = {};
                            if (!timetableDetails[facultyName][date]) timetableDetails[facultyName][date] = {};
                            timetableDetails[facultyName][date][time] = roomDetails;
                        });

                        const sortedDates = Array.from(allDates).sort();
                        const sortedTimes = Array.from(allTimes).sort();
                        const sortedFaculty = Array.from(allFaculty).sort();

                        return (
                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '8px', overflow: 'auto', mt: 2 }}>
                                <Table size="small">
                                    <TableHead sx={{ bgcolor: 'primary.main' }}>
                                        <TableRow>
                                            <TableCell
                                                rowSpan={2}
                                                sx={{ fontWeight: 'bold', color: 'white', width: 180, border: '1px solid #ccc', textAlign: 'center' }}
                                            >
                                                Staff Name
                                            </TableCell>
                                            {sortedDates.map(date => (
                                                <TableCell
                                                    key={date}
                                                    colSpan={sortedTimes.length}
                                                    align="center"
                                                    sx={{ fontWeight: 'bold', color: 'white', border: '1px solid #ccc' }}
                                                >
                                                    {date}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                        <TableRow>
                                            {sortedDates.map(() =>
                                                sortedTimes.map(time => (
                                                    <TableCell
                                                        key={time + Math.random()}
                                                        align="center"
                                                        sx={{ fontWeight: 'bold', color: 'white', fontSize: '11px' , border: '1px solid #ccc'}}
                                                    >
                                                        {time}
                                                    </TableCell>
                                                ))
                                            )}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {sortedFaculty.map(faculty => (
                                            <TableRow key={faculty}>
                                                <TableCell sx={{ fontWeight: 'bold', border: '1px solid #ccc',textAlign: 'center'  }}>{faculty}</TableCell>
                                                {sortedDates.map(date =>
                                                    sortedTimes.map(time => {
                                                        const roomInfo = timetableDetails?.[faculty]?.[date]?.[time] || "";
                                                        return (
                                                            <TableCell key={`${faculty}-${date}-${time}`} align="center" sx={{ border: '1px solid #ccc' }}>
                                                                {roomInfo}
                                                            </TableCell>
                                                        );
                                                    })
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        );
                    })()}



                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                        <Button
                            variant="contained"
                            size="medium"
                            startIcon={<MailOutline />}
                            onClick={handleSendEmails}
                            sx={{
                                backgroundColor: '#fbc02d',
                                '&:hover': { backgroundColor: '#f9a825' },
                                color: '#333',
                                py: 1,
                                px: 3,
                                borderRadius: '6px',
                                fontSize: '0.9rem',
                                fontWeight: 'bold'
                            }}
                        >
                            Send Allocation Emails to Faculty
                        </Button>
                    </Box>
                </TabPanel>

                {Object.keys(exam.subjectsBySemester).map((sem, index) => (
                    <TabPanel key={`subject-panel-${sem}`} value={tabValue} index={index + 2}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: '600', color: 'text.primary' }}>Subjects for Semester {sem}</Typography>
                        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '8px', overflow: 'hidden' }}>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: 'primary.main' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Subject Name</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Code</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Time</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {exam.subjectsBySemester[sem].map((subject, subIndex) => (
                                        <TableRow key={subIndex} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } }}>
                                            <TableCell>{subject.name}</TableCell>
                                            <TableCell>{subject.subjectCode}</TableCell>
                                            <TableCell>{subject.date}</TableCell>
                                            <TableCell>{subject.time}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </TabPanel>
                ))}

                {Object.keys(exam.studentAllocationsBySemester).map((sem, index) => (
                    <TabPanel key={`student-panel-${sem}`} value={tabValue} index={index + 2 + Object.keys(exam.subjectsBySemester).length}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: '600', color: 'text.primary' }}>Student Allocations for Semester {sem}</Typography>
                        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '8px', overflow: 'hidden' }}>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: 'primary.main' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Student Roll No. Range</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Count</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Room Details</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {exam.studentAllocationsBySemester[sem].map((allocation, stdIndex) => (
                                        <TableRow key={stdIndex} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } }}>
                                            <TableCell>{allocation.studentRange}</TableCell>
                                            <TableCell>{allocation.count}</TableCell>
                                            <TableCell>{allocation.roomDetails}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </TabPanel>
                ))}
            </Paper>
        </Container>
    );
};

export default ExamDetail;
