
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchAllFaculties = createAsyncThunk(
  "faculty/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("http://smartproctor-mokshith.onrender.com/faculty", {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const facultySlice = createSlice({
  name: "faculty",
  initialState: {
    faculties: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFaculties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllFaculties.fulfilled, (state, action) => {
        state.loading = false;
        state.faculties = action.payload;
      })
      .addCase(fetchAllFaculties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default facultySlice.reducer;
