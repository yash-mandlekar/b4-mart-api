const mongoose = require('mongoose');
// var mongourl = "mongodb://localhost/b4mart"
var mongourl = process.env.MONGODBURL

mongoose.connect(mongourl)
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

