
import adminReducer from './slices/adminSlice';
import { configureStore } from "@reduxjs/toolkit";
import examReducer from "./slices/examSlice";
import pdfReducer from './slices/pdfSlice';
import roomReducer from "./slices/roomSlice";
import adminProfileReducer from "./slices/adminProfileSlice"
import userReducer from "./slices/userSlice"; 
import authReducer from "./authSlice";

const store = configureStore({
  reducer: {
    admin: adminReducer,
    auth: authReducer,
    user: userReducer, 
    pdf: pdfReducer,
    exams: examReducer,
    rooms: roomReducer,
    adminProfile: adminProfileReducer,
  },
});

export default store;
