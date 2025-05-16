// src/components/ProtectedRouteForLogin.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux'; // Import useSelector
import { selectUser, selectAuthLoading, selectIsAuthenticated } from "../redux/authSlice";

const ProtectedRouteForLogin = ({ children }) => {
  const user = useSelector(selectUser);
  const loading = useSelector(selectAuthLoading);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (loading === 'pending') {
    return null; // Don't decide until auth status is known
  }

  if (isAuthenticated) {
    // If user is logged in, redirect them to their respective dashboard
    if (user?.role?.toLowerCase() === 'admin') {
      return <Navigate to="/dashboard/admin" replace />;
    } else if (user?.role?.toLowerCase() === 'faculty') {
      return <Navigate to="/dashboard/faculty" replace />;
    }
    // Default redirect if role is unknown or not explicitly handled
    return <Navigate to="/" replace />;
  }

  return children; // User is not logged in, allow them to see the login page
};

export default ProtectedRouteForLogin;