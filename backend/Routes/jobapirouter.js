// Routes/jobapirouter.js
const express = require('express');
const Route = express.Router();

// FIX: Make sure this path and filename exactly match your file structure.
// Based on your screenshot, the file is 'jobapis.js'.
const jobapicontroller1 = require("../Controllers/jobapis.js");

Route.get("/getArbeitnowJobs", jobapicontroller1.getArbeitnowJobs);
Route.get("/getRemoteOKJobs", jobapicontroller1.getRemoteOKJobs);

module.exports = Route;