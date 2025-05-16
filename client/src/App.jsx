import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useDispatch, useSelector, Provider } from "react-redux";
import store  from './redux/Store';
// Import auth thunk and selectors
import { fetchAuthStatus, loginUser, logoutUser, selectUser, selectAuthLoading, selectIsAuthenticated } from "./redux/authSlice";

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
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedRouteForLogin from "./components/ProtectedRouteForLogin";
import ExamList from "./components/ExamList";

// Main App component (wraps routes and general layout)
function AppContent() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const loading = useSelector(selectAuthLoading);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation(); // Use useLocation

  useEffect(() => {
    if (loading === 'idle') {
      dispatch(fetchAuthStatus());
    }
  }, [dispatch, loading]);

  // Global loading indicator
  if (loading === 'pending') {
    return (
      <div className="flex justify-center items-center h-screen text-2xl font-semibold text-blue-600">
        Authenticating...
      </div>
    );
  }

  const isLoginPage = location.pathname === "/login"; // Use location.pathname

  return (
    <div className="min-h-screen flex bg-gray-100 overflow-hidden">
      {!isLoginPage && isAuthenticated && (
        <div className="hidden md:block">
          <Sidebar user={user} />
        </div>
      )}

      <div className={`flex flex-col flex-1 ${!isLoginPage && isAuthenticated ? "md:ml-64" : ""}`}>
        {!isLoginPage && isAuthenticated && (
          <div className="md:hidden">
            <Navbar user={user} />
          </div>
        )}

        <main className="p-6 overflow-y-auto flex-1">
          <Routes>
            {/* Public/Unprotected Routes */}
            <Route path="/login" element={<ProtectedRouteForLogin><Login /></ProtectedRouteForLogin>} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected Routes - Admin */}
            <Route
              path="/dashboard/admin"
              element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard user={user} /></ProtectedRoute>}
            />
            <Route
              path="/admin/update-profile"
              element={<ProtectedRoute allowedRoles={["admin"]}><UpdateAdminProfile /></ProtectedRoute>}
            />
            <Route
              path="/rooms"
              element={<ProtectedRoute allowedRoles={["admin"]}><RoomList /></ProtectedRoute>}
            />
            <Route
              path="/rooms/add"
              element={<ProtectedRoute allowedRoles={["admin"]}><AddRoom /></ProtectedRoute>}
            />
            <Route
              path="/faculty"
              element={<ProtectedRoute allowedRoles={["admin"]}><FacultyList /></ProtectedRoute>}
            />
            <Route
              path="/faculty/add"
              element={<ProtectedRoute allowedRoles={["admin"]}><AddFaculty /></ProtectedRoute>}
            />
            <Route
              path="/faculty/:id"
              element={<ProtectedRoute allowedRoles={["admin"]}><FacultyDetails /></ProtectedRoute>}
            />
            <Route
              path="/faculty/allocations/:id"
              element={<ProtectedRoute allowedRoles={["admin"]}><FacultyAllocations /></ProtectedRoute>}
            />
            <Route
              path="/exams/create"
              element={<ProtectedRoute allowedRoles={["admin"]}><CreateExam /></ProtectedRoute>}
            />

            {/* Protected Routes - Faculty */}
            <Route
              path="/dashboard/faculty"
              element={<ProtectedRoute allowedRoles={["faculty"]}><FacultyDashboard user={user} /></ProtectedRoute>}
            />

            {/* Protected Routes - Admin & Faculty */}
            <Route
              path="/dashboard/student"
              element={<ProtectedRoute allowedRoles={["admin", "faculty"]}><StudentDashboard user={user} /></ProtectedRoute>}
            />
            <Route
              path="/exams"
              element={<ProtectedRoute allowedRoles={["admin", "faculty"]}><ViewExams user={user} /></ProtectedRoute>}
            />
            <Route
              path="/exams/:id"
              element={<ProtectedRoute allowedRoles={["admin", "faculty"]}><ExamDetail /></ProtectedRoute>}
            />
            <Route
              path="/exams/upcoming"
              element={<ProtectedRoute allowedRoles={["admin", "faculty"]}><ExamList type="upcoming" /></ProtectedRoute>}
            />
            <Route
              path="/exams/ongoing"
              element={<ProtectedRoute allowedRoles={["admin", "faculty"]}><ExamList type="inProgress" /></ProtectedRoute>}
            />
            <Route
              path="/exams/completed"
              element={<ProtectedRoute allowedRoles={["admin", "faculty"]}><ExamList type="completed" /></ProtectedRoute>}
            />

            {/* Catch-all route */}
            <Route
              path="*"
              element={
                isAuthenticated ? (
                  user?.role?.toLowerCase() === "admin" ? (
                    <Navigate to="/dashboard/admin" replace />
                  ) : user?.role?.toLowerCase() === "faculty" ? (
                    <Navigate to="/dashboard/faculty" replace />
                  ) : (
                    <Navigate to="/" replace />
                  )
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

// Main App component where Redux Provider is used
function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Provider store={store}>
        <AppContent />
      </Provider>
    </Router>
  );
}

export default App;
