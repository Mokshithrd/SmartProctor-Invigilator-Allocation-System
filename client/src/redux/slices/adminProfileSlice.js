import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const updateAdminProfile = createAsyncThunk("admin/updateProfile", async (formData, { rejectWithValue }) => {
  try {
    const res = await axios.put("http://smartproctor-mokshith.onrender.com/admin/update", formData, { withCredentials: true });
    return res.data.message;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to update profile");
  }
});

const adminProfileSlice = createSlice({
  name: "adminProfile",
  initialState: {
    loading: false,
    successMessage: "",
    error: "",
  },
  reducers: {
    clearMessages: (state) => {
      state.successMessage = "";
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateAdminProfile.pending, (state) => {
        state.loading = true;
        state.error = "";
        state.successMessage = "";
      })
      .addCase(updateAdminProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload;
      })
      .addCase(updateAdminProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessages } = adminProfileSlice.actions;
export default adminProfileSlice.reducer;
