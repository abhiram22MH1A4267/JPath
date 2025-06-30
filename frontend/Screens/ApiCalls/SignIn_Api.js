// import axios from "axios";

// const Link = '192.168.146.223'; //type the cmd is ipconfig =>IPv4 Address... Value we need
// const TestingApi = async()=>{
//   try{
//     console.log("Making request to API...");
//     const res = await axios.get(`http://${Link}:9000/test-api`);
//     // console.log(res);
//     return res;
//   }catch(err){
//     // console.log("err",err);
//     alert(err.message);
//   }
// }
// export default TestingApi;



// export const SignUpAPi = async(data)=>{
//   console.log("SignUpAPi")
//   try{
//     const result = await axios.post(`http://${Link}:9000/job/SignUP_controll-api`,data);
//     // const result = await axios.post('http://192.168.71.15:9000/job/SignUP_controll-api',data);
//     // console.log(result)
//     return result;
//   }catch(err){
//     // console.log(err);
//     // alert(err.message);
//     return err;
//   }
// }

// export const LogInAPi = async(data)=>{
//   try{
//     const result = await axios.post(`http://${Link}:9000/job/LogIn_controll-api`,data);
//     // console.log(result);
//     return result;
//   }catch(err){
//     return err;
//   }
// }




// export const ForgotPasswordApi = async (email) => {
//   return await axios.post(`http://${Link}:9000/job/Forgot_Password-api`, { email });
// };

// export const ValidateCodeApi = async (token, code) => {
//   return await axios.post(`http://${Link}:9000/job/Validate_Code-api`, { token, code });
// };

// export const ResetPasswordApi = async (token, newPassword) => {
//   return await axios.post(`http://${Link}:9000/job/Reset_Password-api`, { token, newPassword });
// };


import axios from "axios";

// const Link = '10.20.36.40'; //type the cmd is ipconfig =>IPv4 Address... Value we need

// const Link = '192.168.70.223';
const Link = '192.168.1.5';
// const Link = "192.168.107.247";


const TestingApi = async()=>{
  try{
    // console.log("Making request to API...");
    const res = await axios.get(`http://${Link}:9000/test-api`);
    // console.log(res);
    return res;
  }catch(err){
    // console.log("err",err);
    alert(err.message);
  }
}
export default TestingApi;



export const SignUpAPi = async(data)=>{
  // console.log("SignUpAPi")
  try{
    const result = await axios.post(`http://${Link}:9000/job/SignUP_controll-api`,data);
    // const result = await axios.post('http://192.168.71.15:9000/job/SignUP_controll-api',data);
    // console.log(result)
    return result;
  }catch(err){
    // console.log(err);
    // alert(err.message);
    return err;
  }
}

export const LogInAPi = async(data)=>{
  try{
    const result = await axios.post(`http://${Link}:9000/job/LogIn_controll-api`,data);
    // console.log(result);
    return result;
  }catch(err){
    return err;
  }
}




export const ForgotPasswordApi = async (email) => {
  return await axios.post(`http://${Link}:9000/job/Forgot_Password-api`, { email });
};

export const ValidateCodeApi = async (token, code) => {
  return await axios.post(`http://${Link}:9000/job/Validate_Code-api`, { token, code });
};

export const ResetPasswordApi = async (token, newPassword) => {
  return await axios.post(`http://${Link}:9000/job/Reset_Password-api`, { token, newPassword });
};



export const fetchCategoriesApi = async () => {
  const response = await axios.get(`http://${Link}:9000/job/getAllJobCategories-api`);
  return response.data; // expected: [{ categoryName: string }, ...]
};

export const fetchRolesByCategoryApi = async (categoryName) => {
  const response = await axios.post(`http://${Link}:9000/job/getJobRolesByCategory-api`,{categoryName});
  return response.data; // expected: [{ roleName: string }, ...]
};

export const fetchRoleDetailsApi = async (categoryName, roleName) => {
  const response = await axios.post(`http://${Link}:9000/job/getJobDetails-api`, {categoryName,roleName,});
  // console.log(response.data);
  return response.data; // Expected: full job role details object
};

export const fetchAllTheSkills = async () => {
  const response = await axios.get(`http://${Link}:9000/job/getAllSkills-api`);
  return response.data; // expected: [{ skillName: string }, ...]
};

 
export const fetchAllRequiredSkillsApi = async() => {
  const response = await axios.get(`http://${Link}:9000/job/getAllRequiredSkills-api`);
  // console.log(response.data);
  return response.data;
}


export const verifyCertificateApi = async (certificate) => {
  // console.log("certificate");
  const response = await axios.post(`http://${Link}:9000/job/verifyCertificate-api`, certificate, 
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 20000,
    }
  );
  // console.log(response.data);
  return response.data;
}

export const AddSkillApi = async (email, skillName) => {
  // console.log(email,skillName);
  const response = await axios.post(`http://${Link}:9000/job/addSkill-api`, { email, skillName });
  // console.log(response.data);
  return response.data;
};

export const getUserSkillsApi = async (email) => {
  // console.log("email : ",email);
  const response = await axios.post(`http://${Link}:9000/job/getUserSkills-api`, { email });
  // console.log(response.data);
  return response.data;
};

export const getUserApi = async (email) => {
  const response = await axios.post(`http://${Link}:9000/job/displayUser-api`, { email });
  // console.log(response.data);
  return response.data;
}

export const updateUserApi = async (data) => {
  const response = await axios.post(`http://${Link}:9000/job/updateUser-api`, { data });
  // console.log(response.data);
  return response.data;
}



//not completed
export const addprofileImage = async (profileImage, Email) => {
  // console.log(profileImage,Email);
  const response = await axios.post(`http://${Link}:9000/job/updateProfileImage-api`, { profileImage, Email });
  // console.log(response.data);
  return response.data;
}



export const chatBotApi = async (prompt) => {
    const res = await fetch(`http://${Link}:9000/job/ChatBot-api`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: prompt }),
    });
    const data = await res.json();
    // console.log(data.answer);
    return data.reply;
  };

export const saveResumeApi = async(uri, name, Email) => {
  // console.log(uri,name,Email);
  const response = await axios.post(`http://${Link}:9000/job/saveResume-api`, { uri, name, Email });
  // console.log(response.data);
  return response.data;
}

export const deleteResumeApi = async( Email) => {
  // console.log(Resume,email);
  const response = await axios.post(`http://${Link}:9000/job//deleteResume-api`, { Email });
  // console.log(response.data);
  return response.data;
}





//------------------
export const SendVerificationCodeApi = async (email) => {
  try {
    const response = await axios.post(`http://${Link}:9000/job/SendVerificationCodeApi-api`, { 
      email 
    });
    return response;
  } catch (error) {
    console.error('Send Verification Code Error:', error);
    return error.response || { status: 500, data: { message: 'Failed to send verification code' } };
  }
};


export const VerifyCodeApi = async ({ verificationCode, token }) => {
  try {
    const response = await axios.post(`http://${Link}:9000/job/VerifyCodeApi-api`, {
      verificationCode,
      token
    });
    return response;
  } catch (error) {
    console.error('Verify Code Error:', error);
    return error.response || { status: 500, data: { success: false, message: 'Verification failed' } };
  }
};


export const getJobApplyApi = async () => {
  // console.log("getJobApplyApi");
  const response = await axios.get(`http://${Link}:9000/jobapisout/getRemoteOKJobs`);
  // console.log(response.data);
  return response.data;
  }

export const getTopThreeApi = async (email) => {
  // console.log("getJobApplyApi");
  const response = await axios.post(`http://${Link}:9000/job/topThreeMatch-api`, { email });
  // console.log(response.data);
  return response.data;
} 