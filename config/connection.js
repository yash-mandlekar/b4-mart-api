const mongoose = require('mongoose');
// var mongourl = "mongodb://localhost/b4mart"
var mongourl = process.env.MONGODBURL || "mongodb+srv://abcd:abcd@cluster0.wb9t7.mongodb.net/"

mongoose.connect(mongourl)
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

