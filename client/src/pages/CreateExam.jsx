import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

const CreateExamForm = () => {
  const [examName, setExamName] = useState('');
  const [semester, setSemester] = useState('');
  const [year, setYear] = useState('');
  const [totalStudents, setTotalStudents] = useState('');
  const [rooms, setRooms] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [subjects, setSubjects] = useState([
    { name: '', subjectCode: '', date: '', startTime: '', endTime: '' },
  ]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState([]);

  // Fetch available rooms and faculties (mock data, adjust API endpoint)
  useEffect(() => {
    const fetchRoomsAndFaculty = async () => {
      try {
        const roomsResponse = await axios.get('http://localhost:4000/rooms/all');
        const facultyResponse = await axios.get('http://localhost:4000//faculty/all');
        setRooms(roomsResponse.data);
        setFaculty(facultyResponse.data);
      } catch (err) {
        console.error('Error fetching rooms and faculty:', err);
      }
    };

    fetchRoomsAndFaculty();
  }, []);

  const handleSubjectChange = (index, e) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index][e.target.name] = e.target.value;
    setSubjects(updatedSubjects);
  };

  const handleAddSubject = () => {
    setSubjects([
      ...subjects,
      { name: '', subjectCode: '', date: '', startTime: '', endTime: '' },
    ]);
  };

  const handleRoomChange = (roomId) => {
    setSelectedRooms((prevSelectedRooms) =>
      prevSelectedRooms.includes(roomId)
        ? prevSelectedRooms.filter((id) => id !== roomId)
        : [...prevSelectedRooms, roomId]
    );
  };

  const handleFacultyChange = (facultyId) => {
    setSelectedFaculty((prevSelectedFaculty) =>
      prevSelectedFaculty.includes(facultyId)
        ? prevSelectedFaculty.filter((id) => id !== facultyId)
        : [...prevSelectedFaculty, facultyId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const examData = {
      name: examName,
      semester,
      year,
      totalStudents,
      rooms: selectedRooms,
      faculty: selectedFaculty,
      subjects,
    };

    try {
      const response = await axios.post('http://localhost:4000/exams/createExam', examData);
      if (response.data.success) {
        alert('Exam created successfully!');
      } else {
        alert(response.data.message);
      }
    } catch (err) {
      console.error('Error creating exam:', err);
      alert('Error creating exam');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Create Exam</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Exam Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Exam Name"
            className="input"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Semester"
            className="input"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Year"
            className="input"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Total Students"
            className="input"
            value={totalStudents}
            onChange={(e) => setTotalStudents(e.target.value)}
            required
          />
        </div>

        {/* Subject Information */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Subjects</h3>
          {subjects.map((subject, index) => (
            <div key={index} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Subject Name"
                  name="name"
                  value={subject.name}
                  onChange={(e) => handleSubjectChange(index, e)}
                  className="input"
                  required
                />
                <input
                  type="text"
                  placeholder="Subject Code"
                  name="subjectCode"
                  value={subject.subjectCode}
                  onChange={(e) => handleSubjectChange(index, e)}
                  className="input"
                  required
                />
                <input
                  type="date"
                  placeholder="Date"
                  name="date"
                  value={subject.date}
                  onChange={(e) => handleSubjectChange(index, e)}
                  className="input"
                  required
                />
                <input
                  type="time"
                  placeholder="Start Time"
                  name="startTime"
                  value={subject.startTime}
                  onChange={(e) => handleSubjectChange(index, e)}
                  className="input"
                  required
                />
                <input
                  type="time"
                  placeholder="End Time"
                  name="endTime"
                  value={subject.endTime}
                  onChange={(e) => handleSubjectChange(index, e)}
                  className="input"
                  required
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddSubject}
            className="text-blue-500 mt-2"
          >
            + Add Another Subject
          </button>
        </div>

        {/* Room Selection */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Select Rooms</h3>
          {rooms.map((room) => (
            <div key={room._id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={room._id}
                onChange={() => handleRoomChange(room._id)}
                checked={selectedRooms.includes(room._id)}
              />
              <label htmlFor={room._id} className="text-sm">
                {room.roomNumber} (Capacity: {room.capacity})
              </label>
            </div>
          ))}
        </div>

        {/* Faculty Selection */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Select Faculty</h3>
          {faculty.map((fac) => (
            <div key={fac._id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={fac._id}
                onChange={() => handleFacultyChange(fac._id)}
                checked={selectedFaculty.includes(fac._id)}
              />
              <label htmlFor={fac._id} className="text-sm">
                {fac.name} ({fac.email})
              </label>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded mt-4"
        >
          Create Exam
        </button>
      </form>
    </div>
  );
};

export default CreateExamForm;
