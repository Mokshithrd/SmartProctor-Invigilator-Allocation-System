import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function FacultyAllocations() {
  const { id } = useParams();
  const [allocData, setAllocData] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:4000/faculty/allocations/${id}`, { withCredentials: true })
      .then(res => setAllocData(res.data.data))
      .catch(err => console.error("Error fetching allocations:", err));
  }, [id]);

  if (!allocData) return <div className="ml-64 p-6">Loading...</div>;

  return (
    <div className="ml-64 p-6">
      <h1 className="text-2xl font-bold mb-4">Faculty Allocations</h1>
      <h2 className="text-lg font-semibold">{allocData.facultyName}</h2>
      <p>Designation: {allocData.designation}</p>

      <div className="mt-4 space-y-3">
        {allocData.allocations.length === 0 ? (
          <p>No allocations found.</p>
        ) : (
          allocData.allocations.map((a, i) => (
            <div key={i} className="border p-3 rounded shadow-sm">
              <p><strong>Exam:</strong> {a.examName}</p>
              <p><strong>Subject:</strong> {a.subjectName}</p>
              <p><strong>Room:</strong> {a.roomNumber}</p>
              <p><strong>Date:</strong> {a.date}</p>
              <p><strong>Time:</strong> {a.startTime} - {a.endTime}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
