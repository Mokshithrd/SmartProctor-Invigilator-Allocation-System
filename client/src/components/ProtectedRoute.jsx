// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux'; // Import useSelector
import { selectUser, selectAuthLoading, selectIsAuthenticated } from "../redux/authSlice"; // Import relevant selectors

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = useSelector(selectUser);
  const loading = useSelector(selectAuthLoading);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (loading === 'pending') {
    // While the initial authentication check is ongoing,
    // don't render anything, just return null.
    // The AppContent's global loading indicator handles the visual.
    return null;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, check if the user has one of the allowed roles
  const userRole = user?.role?.toLowerCase();
  const allowedRolesLower = allowedRoles.map(role => role.toLowerCase());

  if (userRole && allowedRolesLower.includes(userRole)) {
    return children; // User has permission, render the children
  } else {
    // User is authenticated but not authorized for this route
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }
};

export default ProtectedRoute;