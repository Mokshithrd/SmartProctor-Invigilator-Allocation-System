import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  FaHome, 
  FaCalendarAlt, 
  FaUserGraduate, 
  FaBuilding, 
  FaChevronDown,
  FaSignOutAlt,
  FaChartBar
} from 'react-icons/fa';

export default function Sidebar({ user }) {
  const { pathname } = useLocation();
  const [examsOpen, setExamsOpen] = useState(false);
  const [facultyOpen, setFacultyOpen] = useState(false);
  const [roomsOpen, setRoomsOpen] = useState(false);

  const handleLogout = async () => {
      await axios.post("http://localhost:4000/auth/logout", {
        withCredentials: true,
      });
     
      window.location.href = "/login";
    };
  
  // Auto-expand dropdown based on current path
  useEffect(() => {
    if (pathname.startsWith('/exams')) setExamsOpen(true);
    if (pathname.startsWith('/faculty')) setFacultyOpen(true);
    if (pathname.startsWith('/rooms')) setRoomsOpen(true);
  }, [pathname]);

  // Determine if a nav item is active
  const isActive = (path) => pathname.startsWith(path);

  // Sidebar dropdown component for reusability
  const DropdownMenu = ({ icon, title, isOpen, setIsOpen, path, children }) => (
    <div className="mb-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
          isActive(path)
            ? "bg-blue-100 text-blue-600 shadow-sm"
            : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
        }`}
      >
        <span className="flex items-center gap-3">
          {icon} <span className="font-medium">{title}</span>
        </span>
        <FaChevronDown 
          className={`transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
          size={14} 
        />
      </button>
      
      {isOpen && (
        <div className="ml-9 mt-2 space-y-1 overflow-hidden transition-all duration-300 ease-in-out">
          {children}
        </div>
      )}
    </div>
  );

  // Menu item component for reusability
  const MenuItem = ({ to, icon, title }) => (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
        pathname === to
          ? "bg-blue-100 text-blue-600 shadow-sm"
          : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
      }`}
    >
      {icon} <span className="font-medium">{title}</span>
    </Link>
  );

  // Submenu item component
  const SubMenuItem = ({ to, title }) => (
    <Link 
      to={to} 
      className={`block py-2 pl-3 text-sm rounded-lg transition-all duration-200 ${
        pathname === to
          ? "text-blue-600 font-medium bg-blue-50"
          : "text-gray-600 hover:text-blue-600 hover:bg-blue-50/50"
      }`}
    >
      {title}
    </Link>
  );

  return (
    <aside className="w-72 bg-white shadow-lg border-r min-h-screen fixed hidden md:block overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-2 rounded-lg mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              ExamFlow
            </h1>
          </div>
        </div>
        
        {user && (
          <div className="flex items-center p-3 bg-gray-50 rounded-xl mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.name || "User"}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role || "Admin"}</p>
            </div>
          </div>
        )}
      </div>
      
      <nav className="space-y-1 px-4 pb-6">
        {/* Dashboard */}
        <MenuItem 
          to="/dashboard/admin" 
          icon={<FaHome className="text-lg" />} 
          title="Dashboard" 
        />

        {/* Faculty Dashboard - NEW ITEM */}
        <MenuItem 
          to="/dashboard" 
          icon={<FaChartBar className="text-lg" />} 
          title="Faculty Dashboard" 
        />

        {/* Exams Dropdown */}
        <DropdownMenu
          icon={<FaCalendarAlt className="text-lg" />}
          title="Exams"
          isOpen={examsOpen}
          setIsOpen={setExamsOpen}
          path="/exams"
        >
          <SubMenuItem to="/exams" title="View Exams" />
          <SubMenuItem to="/exams/create" title="Create Exam" />
        </DropdownMenu>

        {/* Faculty Dropdown */}
        <DropdownMenu
          icon={<FaUserGraduate className="text-lg" />}
          title="Faculty"
          isOpen={facultyOpen}
          setIsOpen={setFacultyOpen}
          path="/faculty"
        >
          <SubMenuItem to="/faculty" title="View Faculty" />
          <SubMenuItem to="/faculty/add" title="Add Faculty" />
        </DropdownMenu>

        {/* Rooms Dropdown */}
        <DropdownMenu
          icon={<FaBuilding className="text-lg" />}
          title="Rooms"
          isOpen={roomsOpen}
          setIsOpen={setRoomsOpen}
          path="/rooms"
        >
          <SubMenuItem to="/rooms" title="View Rooms" />
          <SubMenuItem to="/rooms/add" title="Add Room" />
        </DropdownMenu>
        
        {/* Sign Out - Added for completeness */}
        <div className="pt-6 mt-6 border-t border-gray-200"  onClick={handleLogout}>
          <Link
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-50 transition-all duration-200"
          >
            <FaSignOutAlt /> <span>Sign Out</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}