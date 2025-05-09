import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Users, Book, Home, ChevronRight, Trash2, Eye, AlertTriangle } from "lucide-react";

const ViewExams = () => {
  const [exams, setExams] = useState({
    upcoming: [],
    inProgress: [],
    completed: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const navigate = useNavigate();

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:4000/exams", {
        withCredentials: true
      });

      if (res.data.success) {
        setExams({
          upcoming: res.data.upcoming || [],
          inProgress: res.data.inProgress || [],
          completed: res.data.completed || []
        });
      } else {
        displayNotification("Failed to fetch exams: " + res.data.message, "error");
      }
    } catch (err) {
      console.error("Error fetching exams:", err);
      displayNotification("Connection error. Please try again later.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);
  
  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const displayNotification = (message, type) => {
    setNotification({ message, type });
    setShowNotification(true);
  };

  const handleDelete = async (examId, examName) => {
    try {
      const confirmDelete = window.confirm(`Are you sure you want to delete "${examName}"?`);
      if (!confirmDelete) return;
      
      const res = await axios.delete(`http://localhost:4000/exams/delete/${examId}`, {
        withCredentials: true
      });
  
      if (res.data.success) {
        displayNotification("Exam deleted successfully!", "success");
        fetchExams();
      } else {
        displayNotification("Delete failed: " + res.data.message, "error");
      }
    } catch (err) {
      console.error("Delete error:", err);
      displayNotification("Something went wrong while deleting.", "error");
    }
  };
  
  const renderExamCard = (exam) => {
    // Define status colors based on category
    const statusColors = {
      upcoming: "bg-emerald-50 text-emerald-700 border-emerald-200",
      inProgress: "bg-amber-50 text-amber-700 border-amber-200",
      completed: "bg-blue-50 text-blue-700 border-blue-200"
    };
    
    const statusText = {
      upcoming: "Upcoming",
      inProgress: "In Progress",
      completed: "Completed"
    };
    
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-indigo-100 group">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <Book size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">{exam.name}</h3>
            </div>
            <div className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[activeTab]} border`}>
              {statusText[activeTab]}
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              <Calendar className="h-3 w-3 mr-1" />
              {exam.semester} Semester
            </span>
            <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              <Clock className="h-3 w-3 mr-1" />
              {exam.year}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4 text-gray-600">
            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-indigo-50 hover:border-indigo-100 transition-colors group">
              <div className="text-indigo-500 mb-1">
                <Users size={18} />
              </div>
              <span className="text-xs text-gray-500 mb-1">Students</span>
              <span className="font-bold text-lg text-indigo-600">{exam.totalStudents}</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-indigo-50 hover:border-indigo-100 transition-colors">
              <div className="text-indigo-500 mb-1">
                <Home size={18} />
              </div>
              <span className="text-xs text-gray-500 mb-1">Rooms</span>
              <span className="font-bold text-lg text-indigo-600">{exam.roomsUsed}</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-indigo-50 hover:border-indigo-100 transition-colors">
              <div className="text-indigo-500 mb-1">
                <Users size={18} />
              </div>
              <span className="text-xs text-gray-500 mb-1">Faculty</span>
              <span className="font-bold text-lg text-indigo-600">{exam.uniqueFacultyCount}</span>
            </div>
          </div>
          
          <div className="mt-5">
            <h4 className="font-medium text-gray-700 mb-2 flex items-center">
              <Book size={16} className="mr-2 text-indigo-500" />
              Subjects
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
              {exam.subjects.map((subj, idx) => (
                <div 
                  key={idx}
                  className="text-sm px-3 py-2 bg-gray-50 rounded-lg flex justify-between items-center hover:bg-indigo-50 transition-colors border border-gray-100 hover:border-indigo-100"
                >
                  <span className="font-medium">{subj.name}</span>
                  <span className="text-xs py-1 px-2 bg-white rounded-md text-gray-500 border border-gray-100">{subj.subjectCode}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
            <button
              className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
              onClick={() => navigate(`/exams/${exam._id}`)}
            >
              <Eye size={16} className="mr-2" />
              View Details
            </button>
            <button
              className="px-4 py-2.5 bg-white border border-red-400 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 flex items-center justify-center hover:border-red-500"
              onClick={() => handleDelete(exam._id, exam.name)}
            >
              <Trash2 size={16} className="mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    const currentExams = exams[activeTab] || [];
    
    if (currentExams.length === 0) {
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center shadow-inner">
          <div className="bg-white h-24 w-24 rounded-full flex items-center justify-center mx-auto shadow-md">
            <AlertTriangle size={40} className="text-gray-400" />
          </div>
          <h3 className="mt-6 text-lg font-medium text-gray-700">No {activeTab} exams found</h3>
          <p className="mt-2 text-gray-500 max-w-md mx-auto">When exams are added to this category, they will appear here.</p>
          <button 
            className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors inline-flex items-center"
            onClick={() => navigate('/exams/create')}
          >
            <span className="mr-2">+</span> Create New Exam
          </button>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {currentExams.map((exam, idx) => (
          <div key={idx} className="transform transition-all duration-300 hover:-translate-y-1">
            {renderExamCard(exam)}
          </div>
        ))}
      </div>
    );
  };

  const renderTabButton = (tab, label, count) => (
    <button 
      className={`relative px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
        activeTab === tab 
          ? "bg-white text-indigo-700 shadow-sm border border-indigo-100" 
          : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
      }`}
      onClick={() => setActiveTab(tab)}
    >
      {label}
      <span className={`ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
        activeTab === tab 
          ? "bg-indigo-100 text-indigo-800" 
          : "bg-gray-200 text-gray-700"
      }`}>
        {count}
      </span>
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-white">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-4 w-4 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-4 w-4 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-4 w-4 bg-indigo-600 rounded-full animate-bounce"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading your exams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white p-6">
      {/* Toast Notification */}
      <div 
        className={`fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg transition-all duration-300 transform ${
          showNotification 
            ? "translate-x-0 opacity-100" 
            : "translate-x-10 opacity-0 pointer-events-none"
        } ${
          notification.type === "success" 
            ? "bg-green-50 border-green-500 text-green-700" 
            : "bg-red-50 border-red-500 text-red-700"
        }`}
      >
        <div className="flex items-center">
          <div className={`p-2 rounded-full ${
            notification.type === "success" ? "bg-green-100" : "bg-red-100"
          } mr-3`}>
            {notification.type === "success" ? (
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <p>{notification.message}</p>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="bg-indigo-100 text-indigo-700 p-2 rounded-lg mr-3">
                  <Book size={20} />
                </span>
                Exams Dashboard
              </h1>
              <p className="text-gray-500 mt-1">Manage and monitor your examination schedules</p>
            </div>
            <button 
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center"
              onClick={() => navigate('/exams/create')}
            >
              <span className="mr-2">+</span> Create New Exam
            </button>
          </div>
          
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="inline-flex bg-gray-100 p-1 rounded-xl shadow-inner">
              {renderTabButton("upcoming", "Upcoming", exams.upcoming.length)}
              {renderTabButton("inProgress", "In Progress", exams.inProgress.length)}
              {renderTabButton("completed", "Completed", exams.completed.length)}
            </div>
            
            <div className="flex gap-2">
              <button 
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700 flex items-center"
                onClick={() => fetchExams()}
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
          
          <div className="mt-6 transition-all duration-300">
            {renderTabContent()}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <ChevronRight size={18} className="text-indigo-500 mr-2" />
            Quick Stats
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center">
              <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                <Calendar size={20} className="text-indigo-700" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Upcoming Exams</p>
                <p className="text-xl font-bold text-indigo-700">{exams.upcoming.length}</p>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-center">
              <div className="bg-amber-100 p-3 rounded-lg mr-4">
                <Clock size={20} className="text-amber-700" />
              </div>
              <div>
                <p className="text-xs text-gray-500">In Progress</p>
                <p className="text-xl font-bold text-amber-700">{exams.inProgress.length}</p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <Book size={20} className="text-blue-700" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Completed</p>
                <p className="text-xl font-bold text-blue-700">{exams.completed.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewExams;