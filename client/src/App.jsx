import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { Toaster } from "react-hot-toast";

// Pages
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UpdateAdminProfile from "./pages/UpdateAdminProfile";
import ExamDetail from "./pages/ExamDetail";
import FacultyList from "./pages/FacultyList";
import AddFaculty from "./pages/AddFaculty";
import FacultyAllocations from "./pages/FacultyAllocations";
import FacultyDashboard from "./pages/FacultyDashboard";
import RoomList from "./pages/RoomList";
import ViewExams from "./pages/ViewExams";
import CreateExam from "./pages/CreateExam";
import FacultyDetails from "./pages/FacultyDetails";
import AddRoom from "./pages/AddRoom";
import Unauthorized from "./pages/Unauthorized";

// Components
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import RequireAuth from "./components/RequireAuth"; // ✅ already good
import ExamList from "./components/ExamList";
import ProtectedRoute from "./components/ProtectedRoute"; // ✅
import ProtectedRouteForLogin from "./components/ProtectedRouteForLogin"; // (If you want login protected if already logged in)

function AppWrapper() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 🚀 added loading state

  useEffect(() => {
    axios
      .get("http://localhost:4000/auth/me", { withCredentials: true })
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false)); // 🚀 set loading false
  }, []);

  const isLoginPage = location.pathname === "/login";

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-2xl">Loading...</div>; // 👀 while checking auth
  }

  return (
    <div className="min-h-screen flex bg-gray-100 overflow-hidden">
      {!isLoginPage && user && (
        <div className="hidden md:block">
          <Sidebar user={user} />
        </div>
      )}

      <div className={`flex flex-col flex-1 ${!isLoginPage && user ? "md:ml-64" : ""}`}>
        {!isLoginPage && user && (
          <div className="md:hidden">
            <Navbar user={user} />
          </div>
        )}

        <main className="p-6 overflow-y-auto flex-1">
          <Routes>

            {/* Public Routes */}
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AdminDashboard user={user} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/faculty"
              element={
                <ProtectedRoute allowedRoles={["Faculty"]}>
                  <FacultyDashboard user={user} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/student"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Faculty"]}>
                  <StudentDashboard user={user} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/update-profile"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <UpdateAdminProfile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/exams"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Faculty"]}>
                  <ViewExams />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exams/:id"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Faculty"]}>
                  <ExamDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exams/create"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <CreateExam />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exams/upcoming"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Faculty"]}>
                  <ExamList type="upcoming" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exams/ongoing"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Faculty"]}>
                  <ExamList type="inProgress" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exams/completed"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Faculty"]}>
                  <ExamList type="completed" />
                </ProtectedRoute>
              }
            />

            <Route
              path="/rooms"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <RoomList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rooms/add"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AddRoom />
                </ProtectedRoute>
              }
            />

            <Route
              path="/faculty"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <FacultyList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/add"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AddFaculty />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/:id"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <FacultyDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/allocations/:id"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <FacultyAllocations />
                </ProtectedRoute>
              }
            />

            {/* Default fallback - Navigate based on role or login */}
            <Route
              path="*"
              element={
                user ? (
                  <Navigate to={`/dashboard/${user.role.toLowerCase()}`} replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <AppWrapper />
    </Router>
  );
}

export default App;
