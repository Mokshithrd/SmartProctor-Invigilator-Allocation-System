
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchAdmins = createAsyncThunk("admin/fetchAdmins", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get("https://smartproctor-mokshith.onrender.com/admin", { withCredentials: true });
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    admins: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdmins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdmins.fulfilled, (state, action) => {
        state.loading = false;
        state.admins = action.payload;
      })
      .addCase(fetchAdmins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default adminSlice.reducer;
