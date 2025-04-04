const mongoose = require('mongoose');
require('dotenv').config();

const dbConnect = () => {
    mongoose.connect(process.env.MONGO_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
    })
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err)=>{
        console.log("Error connecting DB");
        console.error(err);
        process.exit(1);
    })
}

module.exports = dbConnect;
