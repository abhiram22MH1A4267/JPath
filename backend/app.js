
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const mongoose = require('mongoose')
const bodyParser =require('body-parser');
const cors =require('cors');
require('dotenv').config();//Data Safe
var app = express();

const JobPathRoute = require("./Routes/RouterJop");
const jobapisout = require("./Routes/jobapirouter");

mongoose.connect("mongodb+srv://kushalkommireddy:F8sXTUGM97geJP84@jpath.0gteqvs.mongodb.net/")
.then(result=>{console.log("MongoDB connected successfully")})
.catch(err=>{console.log(err)})

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(cors())
app.use(bodyParser.json())

app.use("/job",JobPathRoute);
app.use("/jobapisout",jobapisout);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.listen(9000,function(){
  console.log("Server Started at 9000");
})


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

module.exports = app;