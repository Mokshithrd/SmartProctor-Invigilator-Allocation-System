import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function FacultyDetails() {
  const { id } = useParams();
  const [faculty, setFaculty] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:4000/faculty/${id}`, { withCredentials: true })
      .then(res => setFaculty(res.data.data))
      .catch(err => console.error("Error fetching faculty:", err));
  }, [id]);

  if (!faculty) return <div className="ml-64 p-6">Loading...</div>;

  return (
    <div className="ml-64 p-6">
      <h1 className="text-2xl font-bold mb-4">Faculty Details</h1>
      <div className="border rounded p-4 shadow">
        <h2 className="text-xl font-semibold">{faculty.name}</h2>
        <p>Email: {faculty.email}</p>
        <p>Designation: {faculty.designation}</p>
        <Link to={`/faculty/allocations/${id}`} className="text-blue-600 underline mt-2 block">
          View Allocation History
        </Link>
      </div>
    </div>
  );
}
