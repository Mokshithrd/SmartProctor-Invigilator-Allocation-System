import axios from "axios";
import { useEffect, useState } from "react";
import Chart from "../components/Chart";

export default function AdminDashboard({ user }) {
  const [stats, setStats] = useState({
    exams: 0,
    faculty: 0,
    students: 0,
    rooms: 0,
  });

  const handleLogout = async () => {
    await axios.post("http://localhost:4000/auth/logout", {
      withCredentials: true,
    });
    window.location.href = "/login";
  };

  useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      const res = await axios.get("http://localhost:4000/admin/dashboard", {
        withCredentials: true,
      });

      if (res.data.success) {
        setStats({
          totalFaculty: res.data.data.totalFaculty,
          totalRooms: res.data.data.totalRooms,
          totalExams: res.data.data.totalExams,
          totalStudents: res.data.data.totalStudents,
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  fetchDashboardData();
}, []);

  return (
    <div className="min-h-screen bg-gray-100 overflow-y-auto">
      <main className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Object.entries(stats).map(([label, value]) => (
            <div key={label} className="bg-white rounded-xl p-6 shadow">
              <p className="text-sm text-gray-500 capitalize">
                {label.replace("_", " ")}
              </p>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Overview</h3>
          <Chart data={stats} />
        </div>
      </main>
    </div>
  );
}
