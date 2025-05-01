import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function FacultyDashboard({ user }) {
  const [stats, setStats] = useState({
    upcomingExams: 0,
    allocatedRooms: 0,
  });

  const handleLogout = async () => {
    await axios.post("http://localhost:4000/auth/logout", { withCredentials: true });
    window.location.href = "/login";
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get("http://localhost:4000/faculty/dashboard", {
          withCredentials: true,
         
        });
        console.log(res);

        if (res.data.success) {
          setStats({
            upcomingExams: res.data.data.upcomingExams,
            allocatedRooms: res.data.data.allocatedRooms,
          });
        }
      } catch (error) {
        console.error("Error fetching faculty dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 overflow-y-auto">
      <main className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Faculty Dashboard</h2>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow">
            <p className="text-sm text-gray-500 capitalize">Upcoming Exams</p>
            <p className="text-3xl font-bold text-gray-900">{stats.upcomingExams}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <p className="text-sm text-gray-500 capitalize">Allocated Rooms</p>
            <p className="text-3xl font-bold text-gray-900">{stats.allocatedRooms}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
