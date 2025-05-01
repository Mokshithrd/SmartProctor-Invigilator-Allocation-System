import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ allowedRoles }) {
  const { user } = useSelector((state) => state.user);

  if (!user) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Logged in but wrong role
    return <Navigate to="/unauthorized" replace />;
  }

  // All good, show the requested page
  return <Outlet />;
}
