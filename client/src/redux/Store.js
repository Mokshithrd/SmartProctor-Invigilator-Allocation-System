
import { configureStore } from "@reduxjs/toolkit";
import examReducer from "./slices/examSlice";
import roomReducer from "./slices/roomSlice";

const store = configureStore({
  reducer: {
    exams: examReducer,
    rooms: roomReducer,
  },
});

export default store;
