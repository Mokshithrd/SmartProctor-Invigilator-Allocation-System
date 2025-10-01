import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function FacultyList() {
  const [faculties, setFaculties] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = () => {
    setIsLoading(true);
    axios.get("https://smartproctor-mokshith.onrender.com/faculty/all", { withCredentials: true })
      .then(res => {
        setFaculties(res.data.data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching faculties:", err);
        setIsLoading(false);
      });
  };

  const confirmDelete = (id, e) => {
    e.stopPropagation();
    setDeletingId(id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`https://smartproctor-mokshith.onrender.com/faculty/${deletingId}`, { withCredentials: true });
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

  const filteredFaculties = faculties.filter(faculty =>
    faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faculty.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faculty.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRandomColor = (id) => {
    const colors = ["bg-blue-100", "bg-purple-100", "bg-green-100", "bg-yellow-100", "bg-pink-100", "bg-indigo-100"];
    const index = id.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="ml-71 p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Faculty Directory</h1>
        <button 
          onClick={() => navigate('/faculty/add')} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition transform hover:scale-105 shadow-md flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Add New Faculty
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search faculties by name, email or designation..."
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredFaculties.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No faculty members found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search or add new faculty members.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFaculties.map(faculty => (
            <div
              key={faculty._id}
              onClick={() => navigate(`/faculty/${faculty._id}`)}
              className="border rounded-xl shadow-md hover:shadow-lg transition duration-300 overflow-hidden cursor-pointer bg-white transform hover:-translate-y-1"
            >
              <div className={`${getRandomColor(faculty._id)} p-4`}>
                <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center text-xl font-bold text-gray-700 mb-2 mx-auto shadow-sm">
                  {faculty.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-lg font-semibold text-center text-gray-800">{faculty.name}</h2>
                <p className="text-sm text-center text-gray-600">{faculty.designation}</p>
              </div>
              
              <div className="p-4">
                <div className="flex items-center mb-2">
                  <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <p className="text-sm text-gray-600 truncate">{faculty.email}</p>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                  <p className="text-sm text-gray-600">
                    {faculty.allocatedRooms?.length || 0} {faculty.allocatedRooms?.length === 1 ? 'Room' : 'Rooms'} Allocated
                  </p>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={(e) => confirmDelete(faculty._id, e)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium transition flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl w-96 max-w-md">
            <div className="text-center mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mt-2">Confirm Deletion</h3>
            </div>
            
            <p className="mb-5 text-sm text-gray-600">
              Are you sure you want to delete this faculty member? This action cannot be undone and all associated data will be permanently removed.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition focus:outline-none focus:ring-2 focus:ring-gray-300"
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
