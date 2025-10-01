// src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast'; // Assuming you use react-hot-toast

// Async Thunk for initial authentication check (on app load/refresh)
export const fetchAuthStatus = createAsyncThunk(
  'auth/fetchAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("https://smartproctor-mokshith.onrender.com/auth/me", { withCredentials: true });
      if (response.data.success) {
        return response.data.user; // Return user object on success
      } else {
        // If backend explicitly says not successful, reject
        return rejectWithValue(response.data.message || 'Authentication check failed.');
      }
    } catch (error) {
      // Handle network errors or non-2xx responses (like 401 Unauthorized)
      console.log('Error fetching auth status:', error);
      // For security, do not return sensitive error details directly to user for 401/403
      return rejectWithValue(error.response?.data?.message || 'Failed to authenticate session.');
    }
  }
);

// Async Thunk for user login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post("https://smartproctor-mokshith.onrender.com/auth/login", credentials, { withCredentials: true });
      if (response.data.success) {
        toast.success("Login successful!");
        return response.data.user; // Return user object on success
      } else {
        toast.error(response.data.message || "Login failed. Please check credentials.");
        return rejectWithValue(response.data.message || 'Login failed.');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred during login.";
      console.log('Login error:', error);
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk for user logout
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await axios.post("https://smartproctor-mokshith.onrender.com/auth/logout", {}, { withCredentials: true });
      toast.success("Logged out successfully!");
      return true; // Indicate successful logout
    } catch (error) {
      console.log('Logout error:', error);
      toast.error(error.response?.data?.message || "Logout failed. Please try again.");
      return rejectWithValue(error.response?.data?.message || 'Logout failed.');
    }
  }
);


const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: 'idle', // 'idle' | 'pending' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    // Reducer to manually clear user (e.g., if you need to force a logout from somewhere)
    clearUser: (state) => {
      state.user = null;
      state.loading = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchAuthStatus thunk
      .addCase(fetchAuthStatus.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchAuthStatus.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.user = action.payload; // Payload is the user object
      })
      .addCase(fetchAuthStatus.rejected, (state, action) => {
        state.loading = 'failed';
        state.user = null; // Ensure user is null on failure
        state.error = action.payload || 'Failed to authenticate.';
      })
      // Handle loginUser thunk
      .addCase(loginUser.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = 'failed';
        state.user = null;
        state.error = action.payload || 'Login failed.';
      })
      // Handle logoutUser thunk
      .addCase(logoutUser.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = 'succeeded';
        state.user = null; // Clear user on successful logout
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = 'failed';
        // Even if logout fails, we might want to clear the user locally
        // depending on whether the backend session is truly gone or not.
        // For simplicity, we'll clear it here.
        state.user = null;
        state.error = action.payload || 'Logout failed.';
      });
  },
});

export const { clearUser } = authSlice.actions;

// Selectors for convenience
export const selectUser = (state) => state.auth.user;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectIsAuthenticated = (state) => !!state.auth.user;
export const selectIsAdmin = (state) => state.auth.user?.role?.toLowerCase() === 'admin';
export const selectIsFaculty = (state) => state.auth.user?.role?.toLowerCase() === 'faculty';

export default authSlice.reducer;
