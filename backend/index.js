const express = require('express');
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 4000;

require('dotenv').config();

const dbConnect = require("./config/db");
dbConnect();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
  "http://localhost:3000", 
  "https://smartproctor-invigilator-allocation-3xcm.onrender.com"
];

const allowedOrigins = [
  "http://localhost:3000", 
  "https://smartproctor-invigilator-allocation-3xcm.onrender.com"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS not allowed for this origin: " + origin), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));



const userRoute = require("./routes/userRoute");
const facultyRoute = require("./routes/facultyRoute")
const adminRoute = require("./routes/adminRoutes");
const roomRoutes = require('./routes/roomRoutes');

// const subjectRoute = require('./routes/subjectRoutes');
const examRoutes = require("./routes/examRoutes");
const pdfRoutes = require('./routes/pdfRoutes');
// const insert = require("./init/insertData");
// insert();

app.use("/auth",userRoute);
app.use("/admin", adminRoute);
app.use("/faculty", facultyRoute);
app.use("/room", roomRoutes);

// app.use("/subject",subjectRoute);
app.use("/exams", examRoutes);
app.use("/pdf", pdfRoutes);


app.get("/",(req,res)=>{
    res.send("Home route");
});

app.listen(PORT ,()=>{
    console.log(`App listening to port ${PORT}`);
});
