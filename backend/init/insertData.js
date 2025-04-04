const bcrypt = require('bcrypt');
const User = require('../models/User');
const mongoose = require('mongoose');
require('dotenv').config();

const insert = () => {

    const users = [
        { name: "Admin1", email: "admin1@example.com", password: "Admin1@123", role: "Admin", designation: "Associate Professor" },
        { name: "Admin2", email: "admin2@example.com", password: "Admin2@123", role: "Admin", designation: "Assistant Professor" },

        { name: "Faculty1", email: "faculty1@example.com", password: "Faculty1@123", role: "Faculty", designation: "Associate Professor" },
        { name: "Faculty2", email: "faculty2@example.com", password: "Faculty2@123", role: "Faculty", designation: "Associate Professor" },
        { name: "Faculty3", email: "faculty3@example.com", password: "Faculty3@123", role: "Faculty", designation: "Associate Professor" },
        { name: "Faculty4", email: "faculty4@example.com", password: "Faculty4@123", role: "Faculty", designation: "Associate Professor" },
        { name: "Faculty5", email: "faculty5@example.com", password: "Faculty5@123", role: "Faculty", designation: "Associate Professor" },
        { name: "Faculty6", email: "faculty6@example.com", password: "Faculty6@123", role: "Faculty", designation: "Associate Professor" },

        { name: "Faculty7", email: "faculty7@example.com", password: "Faculty7@123", role: "Faculty", designation: "Assistant Professor" },
        { name: "Faculty8", email: "faculty8@example.com", password: "Faculty8@123", role: "Faculty", designation: "Assistant Professor" },
        { name: "Faculty9", email: "faculty9@example.com", password: "Faculty9@123", role: "Faculty", designation: "Assistant Professor" },
        { name: "Faculty10", email: "faculty10@example.com", password: "Faculty10@123", role: "Faculty", designation: "Assistant Professor" },
        { name: "Faculty11", email: "faculty11@example.com", password: "Faculty11@123", role: "Faculty", designation: "Assistant Professor" },
        { name: "Faculty12", email: "faculty12@example.com", password: "Faculty12@123", role: "Faculty", designation: "Assistant Professor" },
        { name: "Faculty13", email: "faculty13@example.com", password: "Faculty13@123", role: "Faculty", designation: "Assistant Professor" },
        { name: "Faculty14", email: "faculty14@example.com", password: "Faculty14@123", role: "Faculty", designation: "Assistant Professor" },
        { name: "Faculty15", email: "faculty15@example.com", password: "Faculty15@123", role: "Faculty", designation: "Assistant Professor" },
        { name: "Faculty16", email: "faculty16@example.com", password: "Faculty16@123", role: "Faculty", designation: "Assistant Professor" },
        { name: "Faculty17", email: "faculty17@example.com", password: "Faculty17@123", role: "Faculty", designation: "Assistant Professor" },
        { name: "Faculty18", email: "faculty18@example.com", password: "Faculty18@123", role: "Faculty", designation: "Assistant Professor" },
        { name: "Faculty19", email: "faculty19@example.com", password: "Faculty19@123", role: "Faculty", designation: "Assistant Professor" },
        { name: "Faculty20", email: "faculty20@example.com", password: "Faculty20@123", role: "Faculty", designation: "Assistant Professor" },
        { name: "Faculty21", email: "faculty21@example.com", password: "Faculty21@123", role: "Faculty", designation: "Assistant Professor" },
        { name: "Faculty22", email: "faculty22@example.com", password: "Faculty22@123", role: "Faculty", designation: "Assistant Professor" },
        { name: "Faculty23", email: "faculty23@example.com", password: "Faculty23@123", role: "Faculty", designation: "Assistant Professor" },
        { name: "Faculty24", email: "faculty24@example.com", password: "Faculty24@123", role: "Faculty", designation: "Assistant Professor" },
        { name: "Faculty25", email: "faculty25@example.com", password: "Faculty25@123", role: "Faculty", designation: "Assistant Professor" },
        { name: "Faculty26", email: "faculty26@example.com", password: "Faculty26@123", role: "Faculty", designation: "Assistant Professor" },
        { name: "Faculty27", email: "faculty27@example.com", password: "Faculty27@123", role: "Faculty", designation: "Assistant Professor" },
        { name: "Faculty28", email: "faculty28@example.com", password: "Faculty28@123", role: "Faculty", designation: "Assistant Professor" }
    ];

    async function createUsers() {
        for (let user of users) {
            const hashedPassword = await bcrypt.hash(user.password, 10);

            await User.create({
                name: user.name,
                email: user.email,
                password: hashedPassword,
                role: user.role,
                designation: user.designation
            });
        }
        console.log("Users created successfully!");
        mongoose.disconnect();
    }

    createUsers();
}

module.exports = insert;