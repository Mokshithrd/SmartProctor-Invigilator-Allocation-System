import { FaHome, FaCalendarAlt, FaUserGraduate, FaBuilding, FaChevronDown } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Sidebar({ user }) {
  const { pathname } = useLocation();
  const [examsOpen, setExamsOpen] = useState(false);
  const [facultyOpen, setFacultyOpen] = useState(false);
  const [roomsOpen, setRoomsOpen] = useState(false); // 👈 new for room dropdown

  return (
    <aside className="w-64 bg-white shadow-md border-r min-h-screen fixed hidden md:block">
      <div className="p-6 text-2xl font-bold text-blue-600">
        ExamFlow
        <p className="text-sm text-gray-500 mt-1 font-normal">Welcome, {user?user.name : user?.role}</p>
      </div>
      <nav className="space-y-1 px-4 mt-4">
        {/* Dashboard */}
        <Link
          to="/dashboard/admin"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium ${pathname.startsWith("/dashboard/admin")
            ? "bg-blue-100 text-blue-600"
            : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"}`}
        >
          <FaHome /> Dashboard
        </Link>

        {/* Exams Dropdown */}
        <button
          onClick={() => setExamsOpen(!examsOpen)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium ${pathname.startsWith("/exams")
            ? "bg-blue-100 text-blue-600"
            : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"}`}
        >
          <span className="flex items-center gap-3">
            <FaCalendarAlt /> Exams
          </span>
          <FaChevronDown className={`transform transition-transform ${examsOpen ? "rotate-180" : ""}`} />
        </button>
        {examsOpen && (
          <div className="ml-6 mt-1 space-y-1">
            <Link to="/exams" className="block text-sm text-gray-700 hover:text-blue-600">View Exams</Link>
            <Link to="/exams/create" className="block text-sm text-gray-700 hover:text-blue-600">Create Exam</Link>
          </div>
        )}

        {/* Faculty Dropdown */}
        <button
          onClick={() => setFacultyOpen(!facultyOpen)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium ${pathname.startsWith("/faculty")
            ? "bg-blue-100 text-blue-600"
            : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"}`}
        >
          <span className="flex items-center gap-3">
            <FaUserGraduate /> Faculty
          </span>
          <FaChevronDown className={`transform transition-transform ${facultyOpen ? "rotate-180" : ""}`} />
        </button>
        {facultyOpen && (
          <div className="ml-6 mt-1 space-y-1">
            <Link to="/faculty" className="block text-sm text-gray-700 hover:text-blue-600">View Faculty</Link>
            <Link to="/faculty/add" className="block text-sm text-gray-700 hover:text-blue-600">Add Faculty</Link>
          </div>
        )}

        {/* Rooms Dropdown */}
        <button
          onClick={() => setRoomsOpen(!roomsOpen)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium ${pathname.startsWith("/rooms")
            ? "bg-blue-100 text-blue-600"
            : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"}`}
        >
          <span className="flex items-center gap-3">
            <FaBuilding /> Rooms
          </span>
          <FaChevronDown className={`transform transition-transform ${roomsOpen ? "rotate-180" : ""}`} />
        </button>
        {roomsOpen && (
          <div className="ml-6 mt-1 space-y-1">
            <Link to="/rooms" className="block text-sm text-gray-700 hover:text-blue-600">View Rooms</Link>
            <Link to="/rooms/add" className="block text-sm text-gray-700 hover:text-blue-600">Add Room</Link>
          </div>
        )}
      </nav>
    </aside>
  );
}
