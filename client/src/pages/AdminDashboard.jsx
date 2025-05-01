import axios from "axios";
import { useEffect, useState } from "react";
import Chart from "../components/Chart";
import { Link } from "react-router-dom";

export default function Dashboard({ user }) {
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
    if (user?.role === "Admin") {   // ✅ Corrected here
      const fetchDashboardData = async () => {
        try {
          const res = await axios.get("http://localhost:4000/admin/dashboard", {
            withCredentials: true,
          });
          console.log(res.data);

          if (res.data.success) {
            setStats({
              totalFaculty: res.data.data.totalFaculty,
              totalRooms: res.data.data.totalRooms,
              totalExams: res.data.data.totalExams,
              totalStudents: res.data.data.totalStudents,
            });
          }
        } catch (error) {
          console.error("Error fetching admin dashboard data:", error);
        }
      };

      fetchDashboardData();
    }
  }, [user?.role]);

  if (!user) return <div className="ml-64 p-6">Loading...</div>;

  if (user.role === "Admin") {  // ✅ Corrected here
    return (
      <div className="min-h-screen bg-gray-100 overflow-y-auto ml-64">
        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h2>
            <div className="flex gap-2">
              <Link
                to="/admin/update-profile"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Update Profile
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
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
  } else if (user.role === "Faculty") {  // ✅ Also fix Faculty spelling
    return (
      <div className="min-h-screen bg-gray-100 overflow-y-auto ml-64">
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

          <div className="bg-white rounded-xl p-6 shadow">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Welcome, {user.name}!</h3>
            <p className="text-gray-600">
              Here you can view your exam allocations and other related information.
            </p>
          </div>
        </main>
      </div>
    );
  } else {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <h1 className="text-2xl font-semibold text-red-500">Unauthorized Access</h1>
      </div>
    );
  }
}
