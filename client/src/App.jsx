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

// Components
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ExamPage from "./pages/ExamPage";
import RequireAuth from "./components/RequireAuth";
import ExamList from "./components/ExamList";
import RoomPage from "./pages/RoomPage";

function AppWrapper() {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:4000/auth/me", {
        withCredentials: true,
      }) // Adjust if needed
      .then((res) => setUser(res.data.data))
      .catch(() => setUser(null));
  }, []);

  const isLoginPage = location.pathname === "/login";

  return (
    <div className="min-h-screen flex bg-gray-100 overflow-hidden">
      {/* Sidebar for large screens */}
      {!isLoginPage && (
        <div className="hidden md:block">
          <Sidebar user={user} />
        </div>
      )}

      {/* Main content area */}
      <div className={`flex flex-col flex-1 ${!isLoginPage ? "md:ml-64" : ""}`}>
        {!isLoginPage && (
          <div className="md:hidden">
            <Navbar user={user} />
          </div>
        )}

        <main className="p-6 overflow-y-auto flex-1">
          <Routes>
            <Route path="/login" element={<Login setUser={setUser} />} />

            <Route
              path="/dashboard/admin"
              element={
                <RequireAuth user={user} allowedRoles={["Admin"]}>
                  <AdminDashboard user={user} />
                </RequireAuth>
              }
            />

            <Route
              path="/dashboard/student"
              element={
                <RequireAuth
                  user={user}
                  allowedRoles={["Admin", "Faculty", "Student"]}
                >
                  <StudentDashboard user={user} />
                </RequireAuth>
              }
            />

            <Route path="/exams" element={<ExamPage />} />
            <Route
              path="/exams/upcoming"
              element={<ExamList type="upcoming" />}
            />
            <Route
              path="/exams/ongoing"
              element={<ExamList type="inProgress" />}
            />
            <Route
              path="/exams/completed"
              element={<ExamList type="completed" />}
            />

              <Route path="/rooms" element={<RoomPage />}/>
            <Route
              path="*"
              element={
                <Navigate
                  to={user ? `/dashboard/${user.role.toLowerCase()}` : "/login"}
                />
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
