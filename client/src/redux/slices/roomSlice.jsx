// src/redux/slices/roomSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = "https://smartproctor-mokshith.onrender.com/room";

export const fetchRooms = createAsyncThunk("rooms/fetchRooms", async () => {
  const res = await axios.get(`${API}/all`, { withCredentials: true });
  return res.data.data;
});

export const addRoom = createAsyncThunk("rooms/addRoom", async (room) => {
  const res = await axios.post(`${API}/add`, room, { withCredentials: true });
  return res.data.data;
});

export const deleteRoom = createAsyncThunk("rooms/deleteRoom", async (id) => {
  await axios.delete(`${API}/delete/${id}`, { withCredentials: true });
  return id;
});

export const updateRoom = createAsyncThunk("rooms/updateRoom", async ({ id, room }) => {
  const res = await axios.put(`${API}/update/${id}`, room, { withCredentials: true });
  return res.data.data;
});

const roomSlice = createSlice({
  name: "rooms",
  initialState: {
    rooms: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.rooms = action.payload;
        state.status = "succeeded";
      })
      .addCase(addRoom.fulfilled, (state, action) => {
        state.rooms.push(action.payload);
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.rooms = state.rooms.filter(room => room._id !== action.payload);
      })
      .addCase(updateRoom.fulfilled, (state, action) => {
        const index = state.rooms.findIndex(r => r._id === action.payload._id);
        state.rooms[index] = action.payload;
      });
  },
});

export default roomSlice.reducer;
