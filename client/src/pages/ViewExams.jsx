import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import moment from "moment"; // Using moment for consistent date/time formatting

// Helper function to format date
function formatDate(dateStr) {
  const date = moment(dateStr);
  return date.isValid() ? date.format("MMM D, YYYY") : "Invalid Date";
}

const ViewExams = () => {
  const [examsData, setExamsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming"); // State for active tab

  const navigate = useNavigate();

  // Function to fetch exams data from the backend
  const fetchExams = () => {
    setLoading(true);
    setError(null);
    axios
      .get("https://smartproctor-mokshith.onrender.com/exams/", { withCredentials: true })
      .then((response) => {
        if (!response.data.success) {
          throw new Error("Failed to load exams");
        }
        setExamsData(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching exams:", err); // Log error for debugging
        setError(err.response?.data?.message || err.message || "Error fetching exams");
        setLoading(false);
      });
  };

  // Effect hook to fetch exams on component mount
  useEffect(() => {
    fetchExams();
  }, []); // Empty dependency array means this runs once on mount

  // Handle refresh action
  const handleRefresh = () => {
    fetchExams(); // Re-fetch exams data
  };

  // Handle delete exam action
  const handleDelete = (examId) => {
    if (!window.confirm("Are you sure you want to delete this exam? This action cannot be undone.")) {
      return; // User cancelled deletion
    }
    axios
      .delete(`https://smartproctor-mokshith.onrender.com/exams/delete/${examId}`, { withCredentials: true })
      .then(() => {
        alert("Exam deleted successfully!");
        fetchExams(); // Refresh the list after successful deletion
      })
      .catch((err) => {
        alert(err.response?.data?.message || err.message || "Failed to delete exam.");
      });
  };

  // Handle navigation to exam details page
  const handleViewDetails = (examId) => {
    navigate(`/exams/${examId}`); // Navigate to a dynamic route for exam details
  };

  // Render function for an individual exam card
  const renderExamCard = (exam) => (
    <div
      key={exam._id}
      // Styling for the card: subtle shadow, light border, rounded corners
      className="bg-white border border-gray-200 rounded-lg shadow-md p-5 pb-4 mb-6 transition-all duration-200 ease-in-out hover:shadow-lg"
    >
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        {exam.name} (<span className="text-blue-600">{exam.year}</span>)
      </h3>
      <p className="text-gray-600 text-base mb-1">
        <span className="font-semibold text-gray-700">Start Date:</span> {formatDate(exam.examStartDate)}
      </p>
      <p className="text-gray-700 text-base mb-1">
        <span className="font-semibold text-gray-700">Rooms Allotted:</span> {exam.totalRoomsUsed || 0}
      </p>
      <p className="text-gray-700 text-base mb-4">
        <span className="font-semibold text-gray-700">Faculty Allotted:</span> {exam.uniqueFacultyCount || 0}
      </p>

      {/* Action buttons at the bottom of the card */}
      <div className="flex justify-end space-x-2 mt-4 border-t pt-3 border-gray-100">
        <button
          onClick={() => handleViewDetails(exam._id)}
          // Smaller buttons matching the UI design
          className="px-3 py-1.5 text-sm bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition duration-200 ease-in-out shadow-sm"
        >
          View Details
        </button>
        <button
          onClick={() => handleDelete(exam._id)}
          // Smaller buttons matching the UI design
          className="px-3 py-1.5 text-sm bg-red-600 text-white font-medium rounded hover:bg-red-700 transition duration-200 ease-in-out shadow-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );

  // --- Main Component Render Logic ---

  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-blue-600 text-lg font-semibold flex items-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading exams...
        </div>
      </div>
    );
  }

  // Show error message if fetching fails
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-red-100">
        <div className="text-red-700 text-lg font-semibold p-4 border border-red-400 rounded-md shadow-sm">
          Error: {error}
        </div>
      </div>
    );
  }

  // Determine if there are any exams to display across all categories
  const hasExams = examsData && (examsData.upcoming.length || examsData.inProgress.length || examsData.completed.length);

  // Show a message if no exams are found
  if (!hasExams) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-xl my-8 text-center border border-gray-200">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6">Exam Schedules</h1>
        <p className="text-gray-600 text-lg">No exam schedules found. Start by creating a new exam!</p>
        <button
          onClick={handleRefresh}
          className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-200 ease-in-out shadow-md"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    // Main content area layout and background to match the overall website UI
    <div className="flex-1 p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8">Exam Schedules</h1>

      <div className="flex justify-between items-center mb-8">
        {/* Tab navigation */}
        <div className="flex border-b border-gray-300">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`py-3 px-6 text-lg font-semibold rounded-t-lg transition-all duration-300 ease-in-out
              ${activeTab === "upcoming"
                ? "bg-white text-blue-600 border-b-2 border-blue-600" // Active tab style
                : "text-gray-700 hover:text-blue-600 hover:bg-gray-100" // Inactive tab style
              }`}
          >
            Upcoming Exams
          </button>
          <button
            onClick={() => setActiveTab("inProgress")}
            className={`py-3 px-6 text-lg font-semibold rounded-t-lg transition-all duration-300 ease-in-out
              ${activeTab === "inProgress"
                ? "bg-white text-blue-600 border-b-2 border-blue-600" // Active tab style
                : "text-gray-700 hover:text-blue-600 hover:bg-gray-100" // Inactive tab style
              }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`py-3 px-6 text-lg font-semibold rounded-t-lg transition-all duration-300 ease-in-out
              ${activeTab === "completed"
                ? "bg-white text-blue-600 border-b-2 border-blue-600" // Active tab style
                : "text-gray-700 hover:text-blue-600 hover:bg-gray-100" // Inactive tab style
              }`}
          >
            Completed Exams
          </button>
        </div>
        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-100 text-blue-600 font-semibold rounded-md hover:bg-blue-200 transition duration-200 ease-in-out shadow-sm flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004 12v1a8 8 0 0015.356 2M20 20v-5h-.581m0 0a8.003 8.003 0 01-15.357-2L4 12l.001-.001C5.378 7.309 9.497 4 14 4h1"></path></svg>
          Refresh
        </button>
      </div>

      {/* Content based on active tab */}
      <div className="py-4">
        {activeTab === "upcoming" && examsData.upcoming && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {examsData.upcoming.length > 0 ? (
              examsData.upcoming.map(renderExamCard)
            ) : (
              <p className="col-span-full text-center text-gray-600 text-lg italic py-10">No upcoming exams scheduled.</p>
            )}
          </div>
        )}

        {activeTab === "inProgress" && examsData.inProgress && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {examsData.inProgress.length > 0 ? (
              examsData.inProgress.map(renderExamCard)
            ) : (
              <p className="col-span-full text-center text-gray-600 text-lg italic py-10">No exams currently in progress.</p>
            )}
          </div>
        )}

        {activeTab === "completed" && examsData.completed && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {examsData.completed.length > 0 ? (
              examsData.completed.map(renderExamCard)
            ) : (
              <p className="col-span-full text-center text-gray-600 text-lg italic py-10">No completed exams to display.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewExams;
