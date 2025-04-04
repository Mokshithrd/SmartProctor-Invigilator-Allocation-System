const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.auth = async (req, res, next) => {
    try {
        console.log("Cookies received:", req.cookies); // Debugging

        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        console.log(token);
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token missing, Please Login In'
            });
        }

        //verify the token
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            // console.log(decode);
            req.user = decode;
            next();
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: 'Token is invaild'
            });
        }
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Something went wrong while verifying the token'
        });
    }
}

exports.isFaculty = (req, res, next) => {
    try {
        if (req.user.role !== "Faculty") {
            return res.status(401).json({
                success: false,
                message: 'This Route is for Faculty and restricted to others, Please login as Faculty',
            });
        }
        next();
    } catch (err) {
        return res.status(403).json({
            success: false,
            message: 'User role is missing',
        });
    }
}

exports.isAdmin = (req, res, next) => {
    try {
        if (req.user.role !== "Admin") {
            return res.status(403).json({
                success: false,
                message: 'This Route is for Admin and restricted to others, Please login as Admin',
            });
        }
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'User role is missing',
        });
    }
}



// Access token in HttpOnly cookie (secure, automatic authentication).
// Access token in memory (Redux/Context API) for API requests.

// Example in React (Best Practice)
//   import { useState } from "react";

//   const [accessToken, setAccessToken] = useState(null);

//   Fetch token from backend (via cookies)
//   fetch("/api/auth", { credentials: "include" })
//     .then((res) => res.json())
//     .then((data) => setAccessToken(data.token));

//   fetch("http://localhost:5000/protected-route", {
//     method: "GET",
//     headers: {
//       "Authorization": `Bearer ${accessToken}`
//     },
//     credentials: "include"
//   })
//   .then(response => response.json())
//   .then(data => console.log(data));
