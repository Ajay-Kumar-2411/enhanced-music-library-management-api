const mongoose = require("mongoose");

const MONGODB_URL = process.env.MONGODB_URL;

exports.connect = () => {
    // Connect to MongoDB
    mongoose.connect(MONGODB_URL).then(
        console.log("Database connected successfully!")
    ).catch((err) => {
        console.log("Database connection failed!");
        console.log(err);
        process.exit(1);
    })
}