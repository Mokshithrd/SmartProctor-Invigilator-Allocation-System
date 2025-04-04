import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Login from "./pages/Login";
import FacultyDashboard from "./pages/FacultyDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:4000/dashboard/faculty")  // Adjust based on user role
      .then(res => setUser(res.data.data))
      .catch(() => setUser(null));
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/dashboard/faculty" element={user?.role === "Faculty" ? <FacultyDashboard user={user} /> : <Navigate to="/login" />} />
        <Route path="/dashboard/admin" element={user?.role === "Admin" ? <AdminDashboard user={user} /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={user ? `/dashboard/${user.role.toLowerCase()}` : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
