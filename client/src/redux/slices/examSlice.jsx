import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchAllExams = createAsyncThunk(
  "exams/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get("http://localhost:4000/exams", {
        withCredentials: true,
      });
      return {
        upcoming: res.data.upcoming || [],
        inProgress: res.data.inProgress || [],
        completed: res.data.completed || [],
      };
    } catch (err) {
      console.error("Error fetching exams:", err);
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);


const initialState = {
  loading: false,
  upcoming: [],
  inProgress: [],
  completed: [],
  error: null,
};

const examSlice = createSlice({
  name: "exams",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllExams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllExams.fulfilled, (state, action) => {
        const { upcoming, inProgress, completed } = action.payload;
        state.loading = false;
        state.upcoming = upcoming;
        state.inProgress = inProgress;
        state.completed = completed;
      })
      .addCase(fetchAllExams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch exams";
      });
  },
});


export default examSlice.reducer;
