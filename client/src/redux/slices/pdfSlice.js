
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchPDFs = createAsyncThunk("pdf/fetchPDFs", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get("http://smartproctor-mokshith.onrender.com/pdf", { withCredentials: true });
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

const pdfSlice = createSlice({
  name: "pdf",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPDFs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPDFs.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPDFs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default pdfSlice.reducer;
