import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function FacultyList() {
  const [faculties, setFaculties] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = () => {
    axios.get("http://localhost:4000/faculty/all", { withCredentials: true })
      .then(res => setFaculties(res.data.data))
      .catch(err => console.error("Error fetching faculties:", err));
  };

  const confirmDelete = (id) => {
    setDeletingId(id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:4000/faculty/${deletingId}`, { withCredentials: true });
      setFaculties(prev => prev.filter(f => f._id !== deletingId));
      setShowModal(false);
      setDeletingId(null);
    } catch (err) {
      console.error("Error deleting faculty:", err);
      alert("Something went wrong while deleting.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ml-64 p-6">
      <h1 className="text-2xl font-bold mb-4">All Faculties</h1>
      <div className="space-y-4">
        {faculties.map(f => (
          <div
            key={f._id}
            className="border rounded p-4 shadow hover:bg-gray-50 transition relative"
          >
            <div onClick={() => navigate(`/faculty/${f._id}`)} className="cursor-pointer">
              <h2 className="text-lg font-semibold">{f.name}</h2>
              <p>Email: {f.email}</p>
              <p>Designation: {f.designation}</p>
              <p>Allocations: {f.allocatedRooms.length}</p>
            </div>
            <div className="mt-2">
              <button
                onClick={() => confirmDelete(f._id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl w-80">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p className="mb-4 text-sm text-gray-700">
              Are you sure you want to delete this faculty?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
