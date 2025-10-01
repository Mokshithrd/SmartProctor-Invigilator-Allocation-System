import axios from "axios";
import { useEffect, useState } from "react";
import Chart from "../components/Chart";
import { Link } from "react-router-dom";
import { 
  FaUserTie, 
  FaBuilding, 
  FaCalendarAlt, 
  FaUserGraduate, 
  FaSignOutAlt, 
  FaUserEdit,
  FaChartLine,
  FaSpinner
} from "react-icons/fa";

export default function Dashboard({ user }) {
  const [stats, setStats] = useState({
    totalExams: 0,
    totalFaculty: 0,
    totalStudents: 0,
    totalRooms: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    
    await axios.post("https://smartproctor-mokshith.onrender.com/auth/logout", {
      withCredentials: true,
    });
   
    window.location.href = "/login";
  };

  useEffect(() => {
    if (user?.role === "Admin") {
      const fetchDashboardData = async () => {
        setLoading(true);
        try {
          const res = await axios.get("https://smartproctor-mokshith.onrender.com/admin/dashboard", {
            withCredentials: true,
          });

          if (res.data.success) {
            setStats({
              totalFaculty: res.data.data.totalFaculty,
              totalRooms: res.data.data.totalRooms,
              totalExams: res.data.data.totalExams,
              totalStudents: res.data.data.totalStudents,
            });
            setError(null);
          }
        } catch (error) {
          console.log("Error fetching admin dashboard data:", error);
          setError("Failed to load dashboard data. Please try again.");
        } finally {
          setLoading(false);
        }
      };

      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user?.role]);

  if (!user) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center bg-gray-50">
        <div className="flex flex-col items-center p-8">
          <FaSpinner className="animate-spin text-blue-600 text-4xl mb-4" />
          <p className="text-gray-600 font-medium">Loading user information...</p>
        </div>
      </div>
    );
  }

  const renderStatsCard = (icon, label, value, color) => (
    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 capitalize mb-1">
            {label}
          </p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (user.role === "Admin") {
    return (
      <div className="min-h-screen bg-gray-50 overflow-y-auto ml-71">
        <main className="p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h2>
            <p className="text-gray-600">Welcome back! Here's an overview of your system.</p>
          </div>

          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
              <FaChartLine className="text-blue-600" /> Overview
            </h3>
            <div className="flex gap-3">
              <Link
                to="/admin/update-profile"
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2 shadow-sm"
              >
                <FaUserEdit /> Update Profile
              </Link>
              {/* <button
                onClick={handleLogout}
                className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors duration-200 flex items-center gap-2 shadow-sm"
              >
                <FaSignOutAlt /> Logout
              </button> */}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <FaSpinner className="animate-spin text-blue-600 text-xl mr-2" />
              <span className="text-gray-600">Loading dashboard data...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-8">
              {error}
            </div>
          ) : (
            <>
              {/* Stats cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {renderStatsCard(
                  <FaUserTie className="text-xl text-blue-600" />,
                  "Total Faculty",
                  stats.totalFaculty,
                  "bg-blue-100"
                )}
                {renderStatsCard(
                  <FaBuilding className="text-xl text-green-600" />,
                  "Total Rooms",
                  stats.totalRooms,
                  "bg-green-100"
                )}
                {renderStatsCard(
                  <FaCalendarAlt className="text-xl text-purple-600" />,
                  "Total Exams",
                  stats.totalExams,
                  "bg-purple-100"
                )}
                {renderStatsCard(
                  <FaUserGraduate className="text-xl text-orange-600" />,
                  "Total Students",
                  stats.totalStudents,
                  "bg-orange-100"
                )}
              </div>

              {/* Quick Actions */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link 
                    to="/exams/create" 
                    className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 flex items-center gap-3"
                  >
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FaCalendarAlt className="text-purple-600" />
                    </div>
                    <span className="font-medium">Create New Exam</span>
                  </Link>
                  <Link 
                    to="/faculty/add" 
                    className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 flex items-center gap-3"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FaUserTie className="text-blue-600" />
                    </div>
                    <span className="font-medium">Add New Faculty</span>
                  </Link>
                  <Link 
                    to="/rooms/add" 
                    className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 flex items-center gap-3"
                  >
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FaBuilding className="text-green-600" />
                    </div>
                    <span className="font-medium">Add New Room</span>
                  </Link>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">System Statistics</h3>
                <div className="h-80">
                  <Chart data={stats} />
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    );
  } else if (user.role === "Faculty") {
    return (
      <div className="min-h-screen bg-gray-50 overflow-y-auto ml-72">
        <main className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Faculty Dashboard</h2>
              <p className="text-gray-600">Welcome back, {user.name}!</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors duration-200 flex items-center gap-2 shadow-sm"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{user.name}</h3>
                <p className="text-gray-600">Faculty Member</p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-4">
              <p className="text-blue-800">
                Here you can view your exam allocations and other related information.
              </p>
            </div>
          </div>

          {/* Upcoming Exams Section */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <FaCalendarAlt className="text-purple-600" />
              Upcoming Exam Duties
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-gray-600">No upcoming exam duties found.</p>
            </div>
          </div>
        </main>
      </div>
    );
  } else {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-red-100 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Unauthorized Access</h1>
          <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
          <Link to="/" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }
}
