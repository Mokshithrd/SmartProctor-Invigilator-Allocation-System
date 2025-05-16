// src/pages/Login.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, selectAuthLoading } from "../redux/authSlice"; // Import relevant thunk and selector

const Login = () => {
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading); // Get loading state from Redux
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Dispatch the loginUser thunk
    await dispatch(loginUser({ email, password }));
    // Navigation is now handled inside the loginUser thunk based on role
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg max-w-md w-full">
        <h3 className="text-2xl font-bold text-center text-blue-600">Login to ExamFlow</h3>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="mt-4">
            <label className="block" htmlFor="email">Email</label>
            <input 
              type="email" 
              placeholder="Email"
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mt-4">
            <label className="block" htmlFor="password">Password</label>
            <input 
              type="password" 
              placeholder="Password"
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-baseline justify-between mt-4">
            <button
              type="submit"
              className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-900"
              disabled={loading === 'pending'} // Disable button when loading
            >
              {loading === 'pending' ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;