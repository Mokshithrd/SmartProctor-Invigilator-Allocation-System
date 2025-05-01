import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ViewExams = () => {
  const [exams, setExams] = useState({
    upcoming: [],
    inProgress: [],
    completed: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchExams = async () => {
    try {
      const res = await axios.get("http://localhost:4000/exams", {
        withCredentials: true
      });
      console.log(res.data);

      if (res.data.success) {
        setExams({
          upcoming: res.data.upcoming || [],
          inProgress: res.data.inProgress || [],
          completed: res.data.completed || []
        });
      } else {
        console.error("Failed to fetch exams:", res.data.message);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching exams:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleDelete = async (examId) => {
    try {
      const res = await axios.delete(`http://localhost:4000/exams/delete/${examId}`, {
        withCredentials: true
      });
  
      if (res.data.success) {
        alert("Exam deleted!");
        fetchExams(); // Refresh the list
      } else {
        alert("Delete failed: " + res.data.message);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Something went wrong.");
    }
  };
  

  const renderExams = (list, label) => (
    <>
      <h2 className="text-xl font-semibold mt-4">{label}</h2>
      {list.length === 0 ? (
        <p className="text-gray-500">No exams in this category.</p>
      ) : (
        <ul className="space-y-2">
          {list.map((exam, idx) => (
            <li key={idx} className="p-4 border rounded-lg shadow-sm">
              <p className="font-bold">{exam.name}</p>
              <p>Semester: {exam.semester}</p>
              <p>Year: {exam.year}</p>
              <p>Total Students: {exam.totalStudents}</p>
              <p>Rooms Used: {exam.roomsUsed}</p>
              <p>Faculty Allotted: {exam.uniqueFacultyCount}</p>
              <p>
  Subjects:
  <ul className="list-disc list-inside ml-4">
    {exam.subjects.map((subj, idx) => (
      <li key={idx}>
        {subj.name} ({subj.subjectCode})
      </li>
    ))}
  </ul>
</p>


              <div className="flex gap-4 mt-2">
              <button
  className="px-3 py-1 bg-blue-500 text-white rounded"
  onClick={() => navigate(`/exams/${exam._id}`)} // ✅ Correct object
>
  View
</button>

      <button
        className="px-3 py-1 bg-red-500 text-white rounded"
        onClick={() => handleDelete(exam._id)} // 👈 Uses updated DELETE route
      >
        Delete
      </button> 
    </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );

  if (loading) return <p>Loading exams...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Exams Overview</h1>
      {renderExams(exams.upcoming, "Upcoming Exams")}
      {renderExams(exams.inProgress, "Ongoing Exams")}
      {renderExams(exams.completed, "Completed Exams")}
    </div>
  );
};

export default ViewExams;
