// const express = require('express');
// const route = express.Router();

// const JobController1 = require("../Controllers/ControlJob");

// route.get("/Testing-api",JobController1.sampleControll);
// route.post("/SignUP_controll-api",JobController1.SignUP_controll);
// route.post("/LogIn_controll-api",JobController1.LogIn_controll);
// // route.post("/Mail_sender-api",JobController1.MailSender);
// route.post("/Forgot_Password-api",JobController1.ForgotPassword);
// route.post("/Validate_Code-api",JobController1.ValidateCode);
// route.post("/Reset_Password-api",JobController1.ResetPassword);

// module.exports = route;


const express = require('express');
const route = express.Router();

const JobController1 = require("../Controllers/ControlJob");
const JobController2 = require("../Controllers/ControlJob2");
// const ImageData = require("../Controllers/ImageData");




const multer = require('multer');
const upload = multer({ dest: '/tmp', limits: { fileSize: 8 * 1024 * 1024 } });




route.get("/Testing-api",JobController1.sampleControll);
route.post("/SignUP_controll-api",JobController1.SignUP_controll);
route.post("/LogIn_controll-api",JobController1.LogIn_controll);
// route.post("/Mail_sender-api",JobController1.MailSender);
route.post("/Forgot_Password-api",JobController1.ForgotPassword);
route.post("/Validate_Code-api",JobController1.ValidateCode);
route.post("/Reset_Password-api",JobController1.ResetPassword);


route.get("/getAllJobCategories-api",JobController2.getAllJobCategories);
route.post("/getJobRolesByCategory-api",JobController2.getJobRolesByCategory);
route.post("/getJobDetails-api",JobController2.getJobDetails);

route.post("/ChatBot-api",JobController2.ChatBot);

route.get("/getAllSkills-api", JobController1.getAllSkills);

route.get("/getAllRequiredSkills-api", JobController1.getAllRequiredSkills);

// route.post("/verifyCertificate-api", JobController2.verifyCertificate);
route.post("/verifyCertificate-api", upload.single('certificateFile'), JobController2.verifyCertificate);

route.post("/addSkill-api", JobController1.addSkillToUser);

route.post("/getUserSkills-api", JobController1.getUserSkills);

route.post("/displayUser-api", JobController1.DisplayUser);

route.post("/updateUser-api", JobController1.updateUser);

route.post("/saveResume-api", JobController1.SaveResume);

route.post("/deleteResume-api", JobController1.DeleteResume);

route.post("/topThreeMatch-api", JobController1.topThreeMatch);



route.post("/updateProfileImage-api", JobController1.UpdateProfileImage);

const JobController3 = require("../Controllers/ControlJob3");
route.post("/SendVerificationCodeApi-api", JobController3.sendVerificationCode);
route.post("/VerifyCodeApi-api", JobController3.verifyCode);

module.exports = route;

