import { useState, useEffect } from "react";
import {
  Calendar,
  ClipboardList,
  MapPin,
  Bell,
  User,
  ChevronRight,
} from "lucide-react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function FacultyDashboard() {
  const [stats, setStats] = useState({
    upcomingCount: 0,
    todayCount: 0,
  });
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    role: "faculty",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [todayExams, setTodayExams] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await axios.get("/faculty/dashboard", config);

        if (response.data && response.data.success) {
          const { present, upcoming } = response.data;

          setTodayExams(present || []);
          setUpcomingExams(upcoming || []);

          setStats({
            todayCount: present?.length || 0,
            upcomingCount: upcoming?.length || 0,
          });

          // Generate notifications
          const newNotifications = [
            ...(present?.slice(0, 2).map((exam, index) => ({
              id: `today-${index}`,
              message: `Today's exam: ${exam.examName} at ${exam.startTime}`,
              time: "1 hour ago",
              isRead: false,
            })) || []),
            ...(upcoming?.slice(0, 2).map((exam, index) => ({
              id: `upcoming-${index}`,
              message: `Upcoming exam: ${exam.examName} on ${exam.date}`,
              time: "2 hours ago",
              isRead: false,
            })) || []),
          ];
          setNotifications(newNotifications);

          // Fetch user profile
          const userResponse = await axios.get("/auth/profile", config);
          if (userResponse.data && userResponse.data.success) {
            setUserData({
              name: userResponse.data.data.name || "Faculty User",
              email: userResponse.data.data.email || "",
              role: userResponse.data.data.role || "faculty",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [navigate]);

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const formatRoomInfo = (room) => {
    if (!room) return "Not assigned";
    return `${room.building}, Room ${room.number}, Floor ${room.floor}`;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-800">
                Faculty Dashboard
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-full hover:bg-gray-100 relative"
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-10 border">
                    <div className="flex justify-between items-center px-4 py-2 border-b">
                      <h3 className="font-medium">Notifications</h3>
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Mark all as read
                      </button>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 border-b last:border-0 ${
                              notification.isRead ? "" : "bg-blue-50"
                            }`}
                          >
                            <p className="text-sm text-gray-800">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notification.time}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500">
                          No new notifications
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {/* User avatar - mobile only */}
              <div className="md:hidden relative">
                <button className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  <User className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 mb-6 text-white shadow-lg">
                <h2 className="text-2xl font-bold mb-2">
                  Welcome back, {userData.name}
                </h2>
                <p className="opacity-90">
                  Here's your exam supervision overview.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <ClipboardList className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h3 className="ml-3 text-lg font-semibold text-gray-800">
                      Today's Exams
                    </h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.todayCount}
                  </p>
                  <Link
                    to="/exams?filter=today"
                    className="mt-4 flex items-center text-sm text-emerald-600 hover:text-emerald-800 font-medium"
                  >
                    View details <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="ml-3 text-lg font-semibold text-gray-800">
                      Upcoming Exams
                    </h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.upcomingCount}
                  </p>
                  <Link
                    to="/exams"
                    className="mt-4 flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View details <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>

              {/* Today's Exams Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Today's Exams
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Exam Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Room
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {todayExams.length > 0 ? (
                        todayExams.map((exam, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {exam.examName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {`${exam.startTime} - ${exam.endTime}`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatRoomInfo(exam.room)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <Link
                                to={`/exams/${index}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View Details
                              </Link>
                              <span className="mx-2 text-gray-300">|</span>
                              <Link
                                to={`/attendance?exam=${index}`}
                                className="text-green-600 hover:text-green-900"
                              >
                                Submit Attendance
                              </Link>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="4"
                            className="px-6 py-4 text-center text-sm text-gray-500"
                          >
                            No exams scheduled for today
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Upcoming Exams Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Upcoming Exams
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Exam Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Room
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {upcomingExams.length > 0 ? (
                        upcomingExams.slice(0, 5).map((exam, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {exam.examName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {exam.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {`${exam.startTime} - ${exam.endTime}`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatRoomInfo(exam.room)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <Link
                                to={`/exams`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View Details
                              </Link>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-6 py-4 text-center text-sm text-gray-500"
                          >
                            No upcoming exams found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {upcomingExams.length > 5 && (
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <Link
                      to="/exams"
                      className="text-sm text-blue-600 hover:text-blue-900 font-medium flex items-center"
                    >
                      View all exams{" "}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Quick Actions
                  </h3>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
                  <Link
                    to="/exams"
                    className="flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-3 px-4 rounded-lg transition-all"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    View Exam Schedule
                  </Link>
                  <Link
                    to="/attendance"
                    className="flex items-center justify-center bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium py-3 px-4 rounded-lg transition-all"
                  >
                    <ClipboardList className="h-5 w-5 mr-2" />
                    Submit Attendance
                  </Link>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

