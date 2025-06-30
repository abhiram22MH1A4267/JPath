// const fs = require("fs");
// const fsp = require("fs").promises;
// const path = require("path");
// const sharp = require("sharp");
// const { execFile } = require("child_process");
// const util = require("util");


// const execFilePromise = util.promisify(execFile);

// const publicDir = path.join(__dirname, "..", "public");



const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFilePromise = promisify(execFile);


// const uploadsDir = path.join(__dirname, "uploads");


const {JobCategory} = require('../Model/SchemasJob');
const { use } = require("../app");

// Controller to get all job categories
const getAllJobCategories = async (req, res) => {
  // console.log("getAllJobCategories")
  try {
    const categories = await JobCategory.find({}, 'categoryName').lean();
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching job categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller to get all job roles for a selected job category
const getJobRolesByCategory = async (req, res) => {
  // console.log("getJobRolesByCategory")

  try {
    const { categoryName } = req.body;
    const category = await JobCategory.findOne(
      { categoryName },
      { jobRoles: 1, _id: 0 }
    ).lean();

    if (!category) {
      return res.status(404).json({ error: 'Job category not found' });
    }

    const roles = category.jobRoles.map((role) => ({
      roleName: role.roleName,
    }));

    res.status(200).json(roles);
  } catch (error) {
    console.error('Error fetching job roles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller to get full job role details for selected category and role
// const getJobDetails = async (req, res) => {
//   console.log("getJobDetails")

//   try {
//     const { categoryName, roleName } = req.body;

//     const results = await JobCategory.aggregate([
//       { $match: { categoryName } },
//       {
//         $project: {
//           jobRoles: {
//             $filter: {
//               input: '$jobRoles',
//               as: 'role',
//               cond: { $eq: ['$$role.roleName', roleName] },
//             },
//           },
//           _id: 0,
//           categoryName: 1,
//         },
//       },
//     ]);

//     if (!results.length || !results[0].jobRoles.length) {
//       return res.status(404).json({ error: 'Job role not found' });
//     }

//     res.status(200).json(results[0].jobRoles[0]);
//   } catch (error) {
//     console.error('Error fetching job details:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

const getJobDetails = async (req, res) => {
  // console.log("getJobDetails called");

  try {
    const { categoryName, roleName } = req.body;

    // console.log("Request body:", { categoryName, roleName });

    const results = await JobCategory.aggregate([
      { $match: { categoryName } },
      {
        $project: {
          jobRoles: {
            $filter: {
              input: '$jobRoles',
              as: 'role',
              cond: { $eq: ['$$role.roleName', roleName] },
            },
          },
          _id: 0,
          categoryName: 1,
        },
      },
    ]);

    if (!results.length || !results[0].jobRoles.length) {
      console.log("Job role not found in category:", categoryName);
      return res.status(404).json({ error: 'Job role not found' });
    }

    // Convert details to plain JS object to avoid Mongo prototype issues
    const details = JSON.parse(JSON.stringify(results[0].jobRoles[0]));

    const technicalSkills = details.requiredSkills?.technical || [];
    const nonTechnicalSkills = details.requiredSkills?.nontechnical || [];

    const mergedSkills = [...technicalSkills, ...nonTechnicalSkills];

    // Create final response object
    const response = {
      roleName: details.roleName,
      description: details.description,
      experience: details.experience,
      salary: details.salary,
      companyNames: details.companyNames,
      requiredSkills: details.requiredSkills,
      mergedSkills,
    };

    // console.log("Sending response:", response);

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching job details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};




const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'your_super_secret_key'; 
// const GEMINI_API_KEY = 'AIzaSyCw6PZUaid0pu0HU28HvWZ5E_zeH8Oean8';


const ChatBot = async (req, res) => {

  const { message } = req.body;
  // Force Gemini to respond in specific language sections
  const systemPrompt = `
  Don't use * ** or \` for bold or code. Just plain text.

You are a professional Job Search Assistant. Your sole purpose is to provide information about job roles, skills, and career paths.

You must never answer personal questions about yourself. If a user asks who you are, if you are a bot, or any other personal question, you must respond with the following polite refusal and nothing more.

---
*Your ONLY allowed response to personal questions:*
"I am a Job Assistant designed to help with career information. Let's keep the focus on your job search."
---

*Example 1: Correct Usage*
User: "What skills do I need to be a data scientist?"
Your Response: "To be a data scientist, you typically need strong skills in Python or R, statistics, machine learning, and data visualization tools like Tableau."

*Example 2: Handling a Personal Question*
User: "Who made you?"
Your Response: "I am a Job Assistant designed to help with career information. Let's keep the focus on your job search."

*Example 3: Handling a Personal Question*
User: "Are you a human?"
Your Response: "I am a Job Assistant designed to help with career information. Let's keep the focus on your job search."
---

Answer all job-related questions helpfully and professionally.
`;
  // console.log(message);
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `${systemPrompt}\n\nUser: ${message}` }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't respond.";
    console.log("data:",data,"reply:",reply); 
    res.json({ reply });

    // const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't respond.";

    // // Normalize line breaks and trim
    // const lines = reply.replace(/\r\n/g, '\n').split('\n').map(line => line.trim());

    // // Remove known headers and empty lines
    // const infoLines = lines.filter(line => {
    //   const lower = line.toLowerCase();
    //   return line !== '' &&
    //     !lower.startsWith('reply:') &&
    //     lower !== 'language..' &&
    //     lower !== 'language:' &&
    //     lower !== 'english';
    // });

    // // Join back as a single string
    // const answer = infoLines.join(' ');

    // // console.log("reply:",reply);
    // // console.log("answer:",answer);

    // // Return only the message
    // res.json({ answer });


  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reach Gemini API' });
  }
};


// const verifyCertificate = async (req, res) => {
//   try {
//     if (!req.file)
//       return res.status(400).json({ error: 'No file uploaded' });

//     let { path: imgPath, mimetype } = req.file;
//     if (mimetype === 'application/pdf') {
//       await convert(imgPath, {
//         format: 'png',
//         out_dir: '/tmp',
//         out_prefix: req.file.filename,
//         page: 1,                         // only first page
//       });
//       imgPath  = `/tmp/${req.file.filename}-1.png`;
//       mimetype = 'image/png';
//     }

//     const base64 = (await fs.readFile(imgPath)).toString('base64');
//     const prompt = 'Give me the user name and the certificate skill name.';

//     const geminiBody = {
//       contents: [
//         {
//           parts: [
//             { text: prompt },
//             {
//               inlineData: {
//                 mimeType: mimetype,
//                 data: base64,
//               },
//             },
//           ],
//         },
//       ],
//       generationConfig: { temperature: 0.2 },
//     };

//     /* 4️⃣  call Gemini ---------------------------------------------------- */
//     const response = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
//       {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(geminiBody),
//       }
//     );

//     const gJson  = await response.json();
//     const reply =
//       gJson.candidates?.[0]?.content?.parts?.[0]?.text ||
//       'No answer from Gemini.';

//     return res.json({ reply });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: 'Gemini request failed' });
//   } finally {
//     /* 🧹  always clean temp files ---------------------------------------- */
//     if (req.file?.path) fs.unlink(req.file.path).catch(() => {});
//   }
// }

//  const verifyCertificate = async (req, res) => {
//   console.log("verifyCertificate");
//   try {
//     /* ------------------------------------------------------------------ */
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }

//     let { path: imgPath, mimetype } = req.file;

//     // ⬇ convert first page of a PDF to PNG
//     // if (mimetype === "application/pdf") {
//     //   const outBase  = `/tmp/${req.file.filename}-1`;
//     //   const outPath  = `${outBase}.png`;

//     //   // Create a converter tied to THIS pdf file
//     //   const convert = fromPath(imgPath, {
//     //     density: 150,             // 150-dpi render
//     //     savePath: "/tmp",
//     //     saveFilename: `${req.file.filename}-1`,
//     //     format: "png",
//     //   });

//     //   // Render page 1
//     //   await convert(1);

//     //   // (Optional) optimise or resize the PNG with sharp
//     //   await sharp(outPath).png().toFile(outPath);  // keeps same size

//     //   imgPath  = outPath;
//     //   mimetype = "image/png";
//     // }
//     if (mimetype === "application/pdf") {
//       const outName = `${req.file.filename}-1`;
//       const outPath = path.join(publicDir, `${outName}.png`);
    
//       // make sure the folder exists
//       await fsp.mkdir(publicDir, { recursive: true });
    
//       const convert = fromPath(imgPath, {
//         density      : 150,
//         savePath     : publicDir,             // ★ public, not tmp
//         saveFilename : outName,
//         format       : "png",
//         engine       : "imagemagick",
//         command      : "magick",
//       });
    
//       await convert(1);                       // first page → PNG
//       await sharp(outPath).png().toFile(outPath);  // optional optimiser
    
//       imgPath  = outPath;                     // Gemini will read this PNG
//       mimetype = "image/png";
//     }
    

//     /* 2️⃣  Encode file → base-64 ----------------------------------- */
//     const base64 = await fsp.readFile(imgPath, "base64");

//     /* 3️⃣  Call Gemini --------------------------------------------- */
//     const geminiBody = {
//       contents: [
//         {
//           parts: [
//             { text: "Give me the user name and the certificate skill name." },
//             { inlineData: { mimeType: mimetype, data: base64 } },
//           ],
//         },
//       ],
//       generationConfig: { temperature: 0.2 },
//     };

//     const gRes = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(geminiBody),
//       }
//     );

//     const gJson  = await gRes.json();
//     const reply =
//       gJson?.candidates?.[0]?.content?.parts?.[0]?.text ??
//       "No answer from Gemini.";

//     return res.json({ reply });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: "Gemini request failed" });
//   } finally {
//     /* 4️⃣  Always clean temp files --------------------------------- */
//     try { if (req.file?.path)             await fsp.unlink(req.file.path); } catch (_) {}

//     const pngPath = `/tmp/${req.file?.filename}-1.png`;
//     if (fs.existsSync(pngPath)) {
//       try { await fsp.unlink(pngPath); } catch (_) {}
//     }
//   }
// };


// const verifyCertificate = async (req, res) => {
//   console.log("verifyCertificate");

//   try {
//     // 1️⃣  no file? → 400
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     let { path: imgPath, mimetype } = req.file;

//     // 2️⃣  if PDF → render 1st page to PNG in public/certs/
//     if (mimetype === "application/pdf") {
//       const outName = `${req.file.filename}-1`;
//       const outPath = path.join(publicDir, `${outName}.png`);

//       // ensure folder exists
//       await fsp.mkdir(publicDir, { recursive: true });

//       // pdf2pic uses ImageMagick 7 ("magick") as backend
//       const convert = fromPath(imgPath, {
//         density      : 120,          // dpi; lower if you need smaller files
//         savePath     : publicDir,
//         saveFilename : outName,
//         format       : "png",
//         engine       : "imagemagick",
//         command      : "magick",
//       });

//       await convert(1);              // first page
//       // optional: optimise / shrink; tune quality or resize if needed
//       await sharp(outPath)
//         .png()                       // keep as PNG (or .jpeg({ quality: 70 }))
//         .toFile(outPath);

//       imgPath  = outPath;
//       mimetype = "image/png";
//     }

//     // 3️⃣  read file → base-64
//     const base64 = await fsp.readFile(imgPath, "base64");

//     // 4️⃣  Gemini API
//     const geminiBody = {
//       contents: [
//         {
//           parts: [
//             {
//               text:
//                 "Give me the user name and the certificate skill name.",
//             },
//             { inlineData: { mimeType: mimetype, data: base64 } },
//           ],
//         },
//       ],
//       generationConfig: { temperature: 0.2 },
//     };

//     const gRes  = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
//       {
//         method : "POST",
//         headers: { "Content-Type": "application/json" },
//         body   : JSON.stringify(geminiBody),
//       }
//     );

//     const gJson  = await gRes.json();
//     const reply  =
//       gJson?.candidates?.[0]?.content?.parts?.[0]?.text ??
//       "No answer from Gemini.";

//     // (optional) send back preview URL for debugging
//     const previewUrl =
//       imgPath.startsWith(publicDir)
//         ? `/certs/${path.basename(imgPath)}`
//         : null;

//     return res.json({ reply, previewUrl });     // 200
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: "Gemini request failed" });
//   } finally {
//     // 5️⃣  cleanup — original upload
//     try {
//       if (req.file?.path) await fsp.unlink(req.file.path);
//     } catch (_) {}

//     // cleanup — rendered PNG
//     try {
//       if (imgPath && fs.existsSync(imgPath)) await fsp.unlink(imgPath);
//     } catch (_) {}
//   }
// };

// const verifyCertificate = async (req, res) => {
//   console.log("verifyCertificate");

//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     let { path: imgPath, mimetype, filename } = req.file;

//     // Convert PDF to PNG (only page 1)
//     if (mimetype === "application/pdf") {
//       const outName = `${filename}-1`;
//       const outPath = path.join(publicDir, `${outName}.png`);

//       // Ensure the public directory exists
//       await fsp.mkdir(publicDir, { recursive: true });

//       const convert = fromPath(imgPath, {
//         density: 150,
//         savePath: publicDir,
//         saveFilename: outName,
//         format: "png",
//         engine: "imagemagick",
//         command: "magick",
//       });

//       await convert(1); // Convert page 1
//       await sharp(outPath).png().toFile(outPath); // Optional optimization

//       imgPath = outPath;
//       mimetype = "image/png";
//     }

//     // Encode image as base64
//     const base64 = await fsp.readFile(imgPath, "base64");

//     // Call Gemini API
//     const geminiBody = {
//       contents: [
//         {
//           parts: [
//             { text: "Give me the user name and the certificate skill name." },
//             {
//               inlineData: {
//                 mimeType: mimetype,
//                 data: base64,
//               },
//             },
//           ],
//         },
//       ],
//       generationConfig: { temperature: 0.2 },
//     };

//     const gRes = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(geminiBody),
//       }
//     );

//     const gJson = await gRes.json();
//     const reply =
//       gJson?.candidates?.[0]?.content?.parts?.[0]?.text ??
//       "No answer from Gemini.";

//     return res.json({ reply });
//   } catch (err) {
//     console.error("❌ verifyCertificate error:", err);
//     return res.status(500).json({ error: "Gemini request failed" });
//   } finally {
//     // Clean temp files
//     try {
//       if (req.file?.path) await fsp.unlink(req.file.path);
//     } catch (_) {}

//     try {
//       const pngPath = path.join(publicDir, `${req.file?.filename}-1.png`);
//       if (fs.existsSync(pngPath)) {
//         await fsp.unlink(pngPath);
//       }
//     } catch (_) {}
//   }
// };

// const verifyCertificate = async (req, res) => {
//   console.log("verifyCertificate");

//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     let { path: filePath, mimetype, filename } = req.file;

//     if (mimetype === "application/pdf") {
//       const outName = `${filename}-1.png`;
//       const outPath = path.join(publicDir, outName);

//       await fsp.mkdir(publicDir, { recursive: true });

//       // Use ImageMagick directly via command line
//       const args = [
//         "-density", "150",
//         filePath + "[0]", // First page of PDF
//         "-quality", "90",
//         outPath,
//       ];

//       await execFilePromise("magick", args);

//       // Optional optimization with sharp
//       await sharp(outPath).png().toFile(outPath);

//       filePath = outPath;
//       mimetype = "image/png";
//     }

//     const base64 = await fsp.readFile(filePath, "base64");

//     const geminiBody = {
//       contents: [
//         {
//           parts: [
//             { text: "Give me the user name and the certificate skill name." },
//             {
//               inlineData: {
//                 mimeType: mimetype,
//                 data: base64,
//               },
//             },
//           ],
//         },
//       ],
//       generationConfig: { temperature: 0.2 },
//     };

//     const gRes = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(geminiBody),
//       }
//     );

//     const gJson = await gRes.json();
//     const reply =
//       gJson?.candidates?.[0]?.content?.parts?.[0]?.text ??
//       "No answer from Gemini.";
//     // console.log("reply:", reply);

//     const userMatch = reply.match(/\*\*User Name:\*\*\s*(.+)/i);
// const skillMatch = reply.match(/\*\*Certificate Skill Name:\*\*\s*(.+)/i);
//     const data  = {
//       userName: userMatch ? userMatch[1] : null,
//       skillName: skillMatch ? skillMatch[1] : null,
//     };
//     console.log(data);
//     return res.json({ data });
//   } catch (err) {
//     console.error("❌ verifyCertificate error:", err);
//     return res.status(500).json({ error: "Gemini request failed" });
//   } finally {
//     try {
//       if (req.file?.path) await fsp.unlink(req.file.path);
//     } catch (_) {}

//     try {
//       const outPath = path.join(publicDir, `${req.file?.filename}-1.png`);
//       if (fs.existsSync(outPath)) {
//         await fsp.unlink(outPath);
//       }
//     } catch (_) {}
//   }
// };

// Add these imports at the top of your file



const verifyCertificate = async (req, res) => {
  console.log("verifyCertificate controller hit.");

  try {
    // NOTE: 'certificateFile' must match the key used in the route's multer middleware
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded. Please select a certificate file." });
    }

    const { path: filePath, mimetype } = req.file;

    // if (mimetype === "application/pdf") {
    //   console.log("Converting PDF to PNG...");
    //   const outName = `${path.basename(originalFilePath, ".pdf")}-1.png`;
    //   convertedPdfPath = path.join(path.dirname(originalFilePath), outName);

    //   const args = [
    //     "-density", "150",
    //     `${originalFilePath}[0]`,
    //     "-quality", "90",
    //     "-background", "white",
    //     "-alpha", "remove",
    //     convertedPdfPath,
    //   ];

    //   await execFilePromise("magick", args);
    //   console.log(`PDF converted successfully to: ${convertedPdfPath}`);

    //   originalFilePath = convertedPdfPath;
    //   mimetype = "image/png";
    // }

    const base64 = await fsp.readFile(filePath, "base64");

    const prompt = `
      Analyze this certificate image. Extract the following information and provide it in a valid JSON format with ONLY the specified keys:
      1. "userName": The full name of the person who received the certificate.
      2. "skillName": The name of the skill, course, or achievement the certificate is for.
      
      Example JSON output:
      {
        "userName": "Jane Doe",
        "skillName": "Advanced JavaScript"
      }
    `;

    const geminiBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimetype,
                data: base64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    };

    const gRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiBody),
      }
    );

    if (!gRes.ok) {
        const errorBody = await gRes.json();
        console.error("Gemini API Error:", errorBody);
        throw new Error(`Gemini API request failed: ${errorBody.error?.message || gRes.statusText}`);
    }
    
    const gJson = await gRes.json();
    const replyText = gJson?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!replyText) {
        console.log("No valid text reply from Gemini:", gJson);
        return res.status(500).json({ message: "Could not get a valid response from the AI service." });
    }

    console.log("Gemini Raw Reply:", replyText);
    const data = JSON.parse(replyText);

    console.log("Parsed Data:", data);
    // CHANGE: Return the data object directly.
    // The client will receive { userName: "...", skillName: "..." }
    return res.status(200).json(data);

  } catch (err) {
    console.error("❌ verifyCertificate error:", err);
    if (err.code === 'ENOENT') {
        return res.status(500).json({ message: "Server error: ImageMagick 'magick' command not found. Please ensure it's installed on the server and in the system's PATH." });
    }
    return res.status(500).json({ message: err.message || "An internal server error occurred." });

  } finally {
    try {
      if (req.file?.path) {
        await fsp.unlink(req.file.path);
        console.log("Cleaned up local temp file:", req.file.path);
      }
    } catch (cleanupErr) {
        console.error("Error during file cleanup:", cleanupErr);
    }
  }
};






// module.exports = {
//   getAllJobCategories,
//   getJobRolesByCategory,
//   getJobDetails,
// };




module.exports = {
  getAllJobCategories,
  getJobRolesByCategory,
  getJobDetails,
  ChatBot,

  verifyCertificate
};