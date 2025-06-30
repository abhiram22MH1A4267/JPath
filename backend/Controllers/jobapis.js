// Controllers/jobapis.js
const axios = require('axios');

// No need for the 'https' module if you are only using axios
// const https = require("https"); 

const getArbeitnowJobs = async (req, res) => {
  try {
    const response = await axios.get('https://www.arbeitnow.com/api/job-board-api');
    res.status(200).json(response.data.data);
  } catch (err) {
    console.error("Error fetching Arbeitnow jobs:", err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch Arbeitnow jobs' });
  }
};

// const getRemoteOKJobs = async (req, res) => {
//   try {
//     console.log("Fetching RemoteOK jobs...");
//     const response = await axios.get('https://remoteok.com/api', {
//       headers: { 'User-Agent': 'Mozilla/5.0' }
//     });
//     const jobs = response.data.slice(1);
//     res.status(200).json(jobs);
//   } catch (error) {
//     console.error("Error fetching RemoteOK jobs:", error.message);
//     res.status(500).json({ success: false, error: "Failed to fetch RemoteOK jobs" });
//   }
// };

const getRemoteOKJobs = async (req, res) => {
  try {
    console.log("Fetching RemoteOK jobs...");
    const response = await axios.get('https://remoteok.com/api', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    // Remove metadata entry at index 0 and get job list
    const jobs = response.data.slice(1);

    // Sort by date (newest first) using epoch
    const sortedJobs = jobs
      .filter(job => job.epoch) // make sure job has an epoch field
      .sort((a, b) => b.epoch - a.epoch)
      .slice(0, 10); // get only the 5 latest jobs

    res.status(200).json(sortedJobs);
  } catch (error) {
    console.error("Error fetching RemoteOK jobs:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch RemoteOK jobs" });
  }
};

module.exports = { getArbeitnowJobs, getRemoteOKJobs  };