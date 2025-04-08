const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require("cors");
const PORT = process.env.PORT || 4000;

require('dotenv').config();

const dbConnect = require("./config/db");
dbConnect();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3000", // Change to frontend URL
    credentials: true,
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