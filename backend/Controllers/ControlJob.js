const express = require("express");
const bodyParser=require("body-parser");
const nodemailer =require("nodemailer");
const jwt = require('jsonwebtoken');


const {SignUpDB} = require("../Model/SchemasJob");


const sampleControll= async(req,res)=>{
  console.log("It's working");
  return res.status(200).json("It's working");
}

const SignUP_controll = async(req,res)=>{
  console.log("SignUP_controll");

  try{
    let { Name, RollNo, Email, Password } = req.body;
    Email = Email.toLowerCase().trim();

    const RollNoIsThere = await SignUpDB.findOne({ RollNo: RollNo }); 
    if (RollNoIsThere) return res.status(200).json({ message: 'RollNo already exists' });

    const EmailNoIsThere = await SignUpDB.findOne({ Email: Email });
    if (EmailNoIsThere) return res.status(202).json({ message: 'Email already exists' });

    let New_User = new SignUpDB({ Name, RollNo, Email, Password });

    await New_User.save();
    return res.status(201).json("sign up successful");
  }catch (error) {
    return res.status(400).json({error });
  }
}

const LogIn_controll = async(req,res)=>{
   console.log("LogIn_controll");
  try{
    let { Email, Password } = req.body;
    Email = Email.toLowerCase().trim();

   const User = await SignUpDB.findOne({Email: Email});
   if(!User) return res.status(200).json({message:'Invalid Email'});

   const Password_Match = User.Password === Password;
   if(!Password_Match) return res.status(201).json({message:'Invalid Password'});

   return res.status(202).json({ message: 'Login successful', result : User });
   
  }catch(err){
   return res.status(400).json({err});
  }
}







const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

// const MailSender=(req,res)=>{ //api
const MailSender=(user,code)=>{ // function
  console.log("Mail_Controll",user.Email);

  const ReseverName = user.Name;
  const ReseverMail = user.Email;
  const RandomCode = code;
  // const SenderMail = req.body.mail;
  // const RandomCode = req.body.code;
  // const RandomCode = Math.floor(100000 + Math.random() * 900000).toString();
  const GMAIL_USER = process.env.GMAIL_USER || "your_email@example.com";
  const GMAIL_PASS = process.env.GMAIL_PASS || "Enter your_email_password_or_app_password";
  const Transporter=nodemailer.createTransport({
    service:"gmail",
    auth:{
      user:GMAIL_USER,
      pass:GMAIL_PASS
    }
   });
  const MailOption={
    from:GMAIL_USER,
    to:ReseverMail,
    subject:"Password Reset Verification Code",
    text:`Your verification code is: ${RandomCode}`,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background:#f6f9fc; border-radius:8px; color:#333;">
      <h2 style="color:#0078d4; text-align:center;">Password Reset Request</h2>
      <p>Hi ${ReseverName},</p>
      <p>We received a request to reset the password for your account associated with this email address.</p>
      <p><strong>Your verification code is:</strong></p>
      <p style="font-size: 28px; font-weight: bold; text-align: center; letter-spacing: 4px; color: #0078d4; margin: 20px 0;">
        ${RandomCode}
      </p>
      <p>Please enter this code in the app to verify your identity and proceed with resetting your password.</p>
      <p><em>If you did not request a password reset, please ignore this email or contact our support team immediately.</em></p>
      <hr style="border:none; border-top: 1px solid #ddd; margin: 30px 0;" />
      <p style="font-size: 14px; color: #888; text-align: center;">
        Thank you,<br/>
        The Support Team<br/>
        <a href="https://yourdomain.com" style="color:#0078d4; text-decoration:none;">yourdomain.com</a>
      </p>
    </div>
    `
  };
  Transporter.sendMail(MailOption,(err,info)=>{
    if(err)
      return res.status(500).json({ error: "Failed to send email",err })
    else
      return res.status(200).json({ message: "Email sent successfully", info })
  });
};


// Helper to generate 6-digit numeric code as a string
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Body: { email }
const ForgotPassword = async(req, res) =>{
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Valid email is required.' });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const user = await SignUpDB.findOne({ Email: normalizedEmail });
    if (!user) {
      // For security, respond the same to avoid revealing presence
      return res.status(404).json({ success: false, message: 'User not exists' });
    }

    const code = generateVerificationCode();
    console.log("king-kong",email,code);
    // Call your mail sender function
    await MailSender(user, code);

    // Create JWT payload with code and expiration
    const expiresInSeconds = 60 * 60; // 60 minutes
    const token = jwt.sign(
      {
        email: normalizedEmail,
        code,
      },
      JWT_SECRET,
      { expiresIn: expiresInSeconds }
    );

    // Return token to client; client sends this token back for validation
    return res.json({
      success: true,
      message: 'Verification code sent to email.',
      token,
    });
  } catch (error) {
    console.error('forgotPassword error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}



// Body: { token, code }
const ValidateCode =async(req, res) =>{
  try {
    const { token, code } = req.body;

    if (!token || typeof token !== 'string' || !code || typeof code !== 'string') {
      return res.status(400).json({ success: false, message: 'An error occurred. Please try again.' });//Token and code are required.
    }

    // Verify token and decode
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ success: false, message: 'An error occurred. Please try again.' });//Invalid or expired token.
    }

    if (decoded.code !== code) {
      return res.status(400).json({ success: false, message: 'Verification code does not match.' });
    }

    // Code matches and token valid
    return res.json({ success: true, message: 'Code validated successfully.' });
  } catch (error) {
    console.error('validateCode error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

// Body: { token, newPassword }

const ResetPassword = async(req, res) =>{
  try {
    const { token, newPassword } = req.body;
    if (!token || typeof token !== 'string' || !newPassword || typeof newPassword !== 'string') {
      return res.status(400).json({ success: false, message: 'Token and newPassword are required.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }

    // Find user with decoded email
    const normalizedEmail = decoded.email.toLowerCase().trim();
    const user = await SignUpDB.findOne({ Email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found.' });
    }

    // Hash new password
    // const hashedPassword = await bcrypt.hash(newPassword, 10);
    // user.passwordHash = hashedPassword;
    user.Password=newPassword;

    await user.save();

    return res.json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
    console.error('resetPassword error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}


const {JobCategory} = require('../Model/SchemasJob');

// Controller to get all job categories
const getAllJobCategories = async (req, res) => {
  console.log("getAllJobCategories")
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
  console.log("getJobRolesByCategory")

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

//     console.log(categoryName, roleName);

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
    
//     const details = results[0].jobRoles[0];

//     const technicalSkills = details.requiredSkills?.technical || [];
//     const nonTechnicalSkills = details.requiredSkills?.nonTechnical || [];

//     const mergedSkills = [...technicalSkills, ...nonTechnicalSkills];

//     const response = {
//       ...details,
//       mergedSkills: mergedSkills,
//     };

//     res.status(200).json(response);
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
      // console.log("Job role not found in category:", categoryName);
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
      mergedSkills, // ✅ Ensured to be included
    };

    // console.log("Sending response:", response);

    res.status(200).json(response);
  } catch (error) {
    // console.error('Error fetching job details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//This is for the Matchning Role in the Status Page
// const getAllSkills = async (req, res) => {
//   // console.log("getAllSkills");
//   try {
//     const results = await JobCategory.aggregate([
//       { $unwind: '$jobRoles' },
//       {
//         $addFields: {
//           'jobRoles.requiredSkills': {
//             $concatArrays: [
//               { $ifNull: ['$jobRoles.requiredSkills.technical', []] },
//               { $ifNull: ['$jobRoles.requiredSkills.nontechnical', []] }
//             ]
//           }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           categoryName: 1,
//           roleName: '$jobRoles.roleName',
//           description: '$jobRoles.description',
//           experience: '$jobRoles.experience',
//           salary: '$jobRoles.salary',
//           companyNames: '$jobRoles.companyNames',
//           requiredSkills: '$jobRoles.requiredSkills'
//         }
//       }
//     ]);
//     // console.log(results)
//     if (!results.length) {
//       return res.status(404).json({ error: 'No job roles found' });
//     }

//     res.status(200).json(results);
//   } catch (error) {
//     console.error('Error fetching job roles:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

const fetchAllRoles = async () => {
  return JobCategory.aggregate([
    { $unwind: '$jobRoles' },
    { $addFields: {
        'jobRoles.requiredSkills': {
          $concatArrays: [
            { $ifNull: ['$jobRoles.requiredSkills.technical', []] },
            { $ifNull: ['$jobRoles.requiredSkills.nontechnical', []] }
          ]
        }
      }
    },
    {
      $project: {
        _id: 0,
        categoryName: 1,
        roleName: '$jobRoles.roleName',
        description: '$jobRoles.description',
        experience: '$jobRoles.experience',
        salary: '$jobRoles.salary',
        companyNames: '$jobRoles.companyNames',
        requiredSkills: '$jobRoles.requiredSkills'
      }
    }
  ]);
};

// 2. ── Route A:  GET /api/skills  →  list every role ──────────────────────
const getAllSkills = async (req, res) => {
  try {
    const roles = await fetchAllRoles();
    if (!roles.length) return res.status(404).json({ error: 'No job roles found' });
    res.json(roles);
  } catch (err) {
    console.error('Error fetching job roles:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//This is for the extract of the Certificate to add to the user
const getAllRequiredSkills = async (req, res) => {
  // console.log("getRequiredSkills");
  try {
    const results = await JobCategory.aggregate([
      { $unwind: '$jobRoles' },
      {
        $addFields: {
          'jobRoles.requiredSkills': {
            $concatArrays: [
              { $ifNull: ['$jobRoles.requiredSkills.technical', []] },
              { $ifNull: ['$jobRoles.requiredSkills.nontechnical', []] }
            ]
          }
        }
      },
      {
        $project: {
          requiredSkills: '$jobRoles.requiredSkills'
        }
      }
    ]);

    if (!results.length) {
      return res.status(404).json({ error: 'No job roles found' });
    }

    // console.log(results);

    const skills = results.flatMap((role) => role.requiredSkills);
    const uniqueSkills = [...new Set(skills)];

    // console.log(uniqueSkills);

    res.status(200).json(uniqueSkills);
  } catch (error) {
    console.error('Error fetching job roles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

//Add the skills to the user

// const addSkillToUser = async (req, res) => {
//   try {
//     const { email, skillName } = req.body;
//     console.log("Request body:", email, skillName);
//     const user = await SignUpDB.findOne({ Email: email });
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }
//     // console.log(user);

// // keep only skills that are NOT in the user's existing list
// const newSkills = skillName.length > 1 ? skillName.filter(
//   s => !user.CertificationLinks.includes(s)
// ) : skillName;

// if (newSkills.length) {
//   // append them in one shot
//   user.CertificationLinks.push(...newSkills);
//   await user.save();

//   res.status(200).json({
//     message: `${newSkills.join(', ')} skill(s) added successfully`
//   });
// } else {
//   res.status(200).json({
//     message: 'No new skills to add'
//   });
// }
//   } catch (error) {
//     console.error('Error adding skill to user:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// }

const addSkillToUser = async (req, res) => {
  try {
    const { email, skillName } = req.body;

    if (!email || !skillName) {
      return res.status(400).json({ error: 'email and skillName are required' });
    }

    const incoming = (Array.isArray(skillName) ? skillName : [skillName])
      .map(s => String(s).trim())
      .filter(Boolean);                       // removes '', null, undefined

    if (incoming.length === 0) {
      return res.status(400).json({ error: 'skillName must contain at least one skill' });
    }

    const { matchedCount, modifiedCount } = await SignUpDB.updateOne(
      { Email: email },
      {
        $addToSet: { CertificationLinks: { $each: incoming } },
      }
    );

    if (matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      message: modifiedCount
        ? `${incoming.join(', ')} skill(s) added successfully`
        : `No new skills to add. ${incoming.join(', ')} already exists`,
    });
  } catch (err) {
    console.error('Error adding skill to user:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


const getUserSkills = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);
    const user = await SignUpDB.findOne({ Email: email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    console.log(user);
    res.status(200).json(user.CertificationLinks);
  }
  catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}



const DisplayUser = async (req, res) => {
  try {
    const { email } = req.body;
    // console.log(email);
    const users = await SignUpDB.findOne({ Email : email });

    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { _id, RollNo, Name, Email, Password, CertificationLinks } = req.body.data;

    console.log(_id, RollNo, Name, Email, Password, CertificationLinks);
    const updated = await SignUpDB.findOneAndUpdate(
      { _id },
      { RollNo, Name, Email, Password, CertificationLinks },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


const UpdateProfileImage = async (req, res) => {
  try {
    const { profileImage, Email } = req.body;
    // console.log(profileImage, email);
    const updated = await SignUpDB.findOneAndUpdate(
      { Email },
      { profileImage },
      { new: true }
    );
    console.log(updated);
    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "Profile image updated successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const SaveResume = async (req, res) => {
  try {
    const { uri, name, Email } = req.body;
    console.log(uri, name, Email);
    const updated = await SignUpDB.findOneAndUpdate(
      { Email },
      {
        Resume: {
          uri,
          name,
        },
      },
      { new: true }
    );
    console.log(updated);
    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "Resume saved successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const DeleteResume = async (req, res) => {
  try {
    const { Email } = req.body;
    console.log(Email);
    const updated = await SignUpDB.findOneAndUpdate(
      { Email },
      { Resume: { uri: "", name: "" } },
      { new: true }
    );
    console.log(updated);
    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "Resume deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


const topThreeMatch = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await SignUpDB.findOne({ Email: email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const userSkills = (user.CertificationLinks ?? []).map(s => s.toLowerCase());
    const roles = await fetchAllRoles();

    const scored = roles
      .map(role => {
        const required = role.requiredSkills.map(s => s.toLowerCase());
        const matchCount = required.filter(r => userSkills.includes(r)).length;
        return {
          ...role,
          _score: required.length ? matchCount / required.length : 0
        };
      })
      .filter(r => r._score > 0)
      .sort((a, b) => b._score - a._score);

    res.json(scored.slice(0, 3));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  sampleControll,
  SignUP_controll,
  LogIn_controll,
  // MailSender,
  ForgotPassword,
  ValidateCode,
  ResetPassword,


  getAllJobCategories,
  getJobRolesByCategory,
  getJobDetails,


  getAllSkills,

  getAllRequiredSkills,

  addSkillToUser,
  getUserSkills,
  DisplayUser,
  updateUser,
  UpdateProfileImage,
  SaveResume,
  DeleteResume,

  topThreeMatch
};






// exports.sampleControll=sampleControll;
// exports.SignUP_controll=SignUP_controll;
// exports.LogIn_controll=LogIn_controll;
// // exports.MailSender=MailSender;
// exports.ForgotPassword=ForgotPassword;
// exports.ValidateCode=ValidateCode;
// exports.ResetPassword=ResetPassword;