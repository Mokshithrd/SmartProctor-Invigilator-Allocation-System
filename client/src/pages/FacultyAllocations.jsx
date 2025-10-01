import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function FacultyAllocations() {
  const { id } = useParams();
  const [allocData, setAllocData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllocations();
  }, [id]);

  const fetchAllocations = () => {
    setLoading(true);
    axios.get(`http://smartproctor-mokshith.onrender.com/faculty/allocations/${id}`, { withCredentials: true })
      .then(res => {
        setAllocData(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching allocations:", err);
        setError("Failed to load faculty allocations. Please try again.");
        setLoading(false);
      });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStatusClass = (date, startTime) => {
    if (!date || !startTime) return "bg-gray-100 text-gray-600";
    
    const examDateTime = new Date(`${date} ${startTime}`);
    const now = new Date();
    
    if (examDateTime < now) {
      return "bg-green-100 text-green-800 border-green-200";
    } else if (examDateTime.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    } else {
      return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getStatusText = (date, startTime) => {
    if (!date || !startTime) return "Not Scheduled";
    
    const examDateTime = new Date(`${date} ${startTime}`);
    const now = new Date();
    
    if (examDateTime < now) {
      return "Completed";
    } else if (examDateTime.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return "Upcoming (< 24h)";
    } else {
      return "Scheduled";
    }
  };

  if (loading) {
    return (
      <div className="ml-64 p-6 flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Loading faculty allocations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ml-64 p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
          <div className="mt-3">
            <button 
              onClick={fetchAllocations}
              className="bg-red-100 hover:bg-red-200 text-red-700 font-medium py-1 px-3 rounded transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!allocData) return null;

  return (
    <div className="ml-64 p-6 max-w-6xl">
      {/* Back button */}
      <button 
        onClick={() => navigate(-1)} 
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition font-medium"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Back to Faculty List
      </button>

      {/* Faculty header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-700 mr-4">
            {allocData.facultyName?.charAt(0).toUpperCase() || "F"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{allocData.facultyName}</h1>
            <p className="text-gray-600">{allocData.designation}</p>
            <div className="mt-1 flex items-center">
              <span className="text-sm bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
                {allocData.allocations.length} {allocData.allocations.length === 1 ? 'Allocation' : 'Allocations'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Allocations list */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Exam Allocations</h2>
        
        {allocData.allocations.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No allocations found</h3>
            <p className="mt-1 text-sm text-gray-500">This faculty member has not been allocated any exam duties yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allocData.allocations.map((allocation, index) => {
              const statusClass = getStatusClass(allocation.date, allocation.startTime);
              const statusText = getStatusText(allocation.date, allocation.startTime);
              
              return (
                <div key={index} className={`border rounded-lg overflow-hidden shadow-sm ${statusClass}`}>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg">{allocation.examName}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                        {statusText}
                      </span>
                    </div>
                    
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        <p className="text-sm">{allocation.subjectName}</p>
                      </div>
                      
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                        <p className="text-sm">Room {allocation.roomNumber}</p>
                      </div>
                      
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <p className="text-sm">{formatDate(allocation.date)}</p>
                      </div>
                      
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p className="text-sm">{allocation.startTime} - {allocation.endTime}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
