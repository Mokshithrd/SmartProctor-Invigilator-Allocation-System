// components/RequireAuth.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import toast from "react-hot-toast";

const RequireAuth = ({ user, allowedRoles, children }) => {
  const location = useLocation();

  useEffect(() => {
    if (user && !allowedRoles.includes(user.role)) {
      toast.error("Access Denied: Unauthorized role");
    }
  }, [user, allowedRoles]);

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return allowedRoles.includes(user.role) ? children : <Navigate to="/login" replace />;
};

export default RequireAuth;
