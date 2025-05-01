import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams hook
import axios from 'axios';

const ExamDetail = () => {
  const { id } = useParams(); // Destructure the id from useParams
  const [exam, setExam] = useState(null);

  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        const response = await axios.get(`/exams/${id}`);
        setExam(response.data.exam);
      } catch (error) {
        console.error('Error fetching exam details:', error);
      }
    };

    if (id) {
      fetchExamDetails();
    }
  }, [id]);

  // Function to handle PDF download for student room allotment
  const handleDownloadStudentPDF = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/pdf/student-room-pdf/${id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `student_allotments_${exam.name}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading student allotment PDF:', error);
    }
  };

  // Function to handle PDF download for faculty room allotment
  const handleDownloadFacultyPDF = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/pdf/faculty-room-pdf/${id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `faculty_allotments_${exam.name}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading faculty allotment PDF:', error);
    }
  };

  if (!exam) {
    return <div>Loading...</div>; // Show loading state while data is being fetched
  }

  const { rooms, faculty, subjects } = exam;

  return (
    <div>
      <h1>Exam Details</h1>
      <p><strong>Name:</strong> {exam.name}</p>
      <p><strong>Semester:</strong> {exam.semester}</p>

      <div>
        <h2>Rooms</h2>
        {rooms && rooms.length > 0 ? (
          <ul>
            {rooms.map(room => (
              <li key={room._id}>
                {room.building} - {room.floor} - {room.roomNumber}
              </li>
            ))}
          </ul>
        ) : (
          <p>No rooms available</p>
        )}
      </div>

      <div>
        <h2>Faculty</h2>
        {faculty && faculty.length > 0 ? (
          <ul>
            {faculty.map(facultyMember => (
              <li key={facultyMember._id}>
                {facultyMember.name} - {facultyMember.email}
              </li>
            ))}
          </ul>
        ) : (
          <p>No faculty assigned</p>
        )}
      </div>

      <div>
        <h2>Subjects</h2>
        {subjects && subjects.length > 0 ? (
          <ul>
            {subjects.map(subject => (
              <li key={subject._id}>
                {subject.name} ({subject.subjectCode}) - {subject.date} 
                {subject.startTime} - {subject.endTime}
              </li>
            ))}
          </ul>
        ) : (
          <p>No subjects available</p>
        )}
      </div>

      {/* Add buttons to download the PDFs */}
      <div>
        <button onClick={handleDownloadStudentPDF}>Download Student Room Allotment PDF</button>
        <button onClick={handleDownloadFacultyPDF}>Download Faculty Room Allotment PDF</button>
      </div>
    </div>
  );
};

export default ExamDetail;
