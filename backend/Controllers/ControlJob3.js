// controllers/authController.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const {SignUpDB} = require("../Model/SchemasJob");
// import j from '../public/'

// Configure email transporter (example using Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// Generate a 6-digit verification code
const generateVerificationCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send verification code via email
const sendVerificationEmail = async (email, code) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Your Verification Code',
    text: `Your verification code is: ${code}`,
    html: `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JobPath - Email Verification</title>
    <style>
        /* Base styles */
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f7fa;
            color: #333;
            line-height: 1.6;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #eaeaea;
        }
        
        .logo {
            max-width: 150px;
            height: auto;
        }
        
        .content {
            padding: 30px 20px;
        }
        
        h1 {
            color: #2c3e50;
            font-size: 24px;
            margin-bottom: 20px;
            text-align: center;
        }
        
        p {
            margin-bottom: 20px;
            font-size: 16px;
        }
        
        .verification-code {
            background-color: #f8f9fa;
            border: 1px dashed #dee2e6;
            padding: 15px;
            text-align: center;
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 5px;
            color: #2c3e50;
            margin: 30px 0;
            border-radius: 6px;
        }
        
        .button {
            display: inline-block;
            background-color: #3498db;
            color: white;
            text-decoration: none;
            padding: 12px 25px;
            border-radius: 4px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
        }
        
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #7f8c8d;
            border-top: 1px solid #eaeaea;
        }
        
        .note {
            font-size: 14px;
            color: #7f8c8d;
            font-style: italic;
        }
        
        .social-icons {
            margin: 20px 0;
            text-align: center;
        }
        
        .social-icon {
            margin: 0 10px;
            text-decoration: none;
        }
        
        /* Responsive styles */
        @media only screen and (max-width: 600px) {
            .container {
                width: 100%;
                border-radius: 0;
            }
            
            .content {
                padding: 20px 10px;
            }
            
            h1 {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <!-- Replace with your actual logo URL -->
            <img src="../public/jobpath_logo1.png" alt="JobPath Logo" class="logo">
        </div>
        
        <div class="content">
            <h1>Verify Your Email Address</h1>
            
            <p>Hello New User,</p>
            
            <p>Thank you for signing up with JobPath! To complete your registration, please verify your email address by entering the following verification code in your JobPath account:</p>
            
            <div class="verification-code">${code}</div>
            
            <p>This code will expire in 30 minutes. If you didn't request this email, please ignore it or contact our support team.</p>
                        
            <p class="note">Note: For security reasons, never share this code with anyone. JobPath will never ask you for your verification code.</p>
        </div>
        
        <div class="footer">
            <p>© 2023 JobPath. All rights reserved.</p>
            <p>123 Career Street, Professional City, PC 12345</p>
            
            <div class="social-icons">
                <a href="#" class="social-icon">Facebook</a>
                <a href="#" class="social-icon">Twitter</a>
                <a href="#" class="social-icon">LinkedIn</a>
            </div>
            
            <p>
                <a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a> | <a href="#">Unsubscribe</a>
            </p>
        </div>
    </div>
</body>
</html>

    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Controller for sending verification code
exports.sendVerificationCode = async (req, res) => {
  console.log("sendVerificationCode", req.body);
  try {
    const { email } = req.body;

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.in$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please use a valid .edu.in email address' 
      });
    }
    // IF email is already exists
    const EmailNoIsThere = await SignUpDB.findOne({ Email : email });
    
    if (EmailNoIsThere) return res.status(202).json({ message: 'Email already exists' });

    // Generate verification code
    const verificationCode = generateVerificationCode();

    console.log(EmailNoIsThere, verificationCode);

    // Create JWT token with the code (expires in 10 minutes)
    const token = jwt.sign(
      { email, code: verificationCode }, 
      process.env.JWT_SECRET, 
      { expiresIn: '10m' }
    );

    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationCode);
    if (!emailSent) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send verification code' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Verification code sent', 
      token // Send token in response body instead of header
    });

  } catch (error) {
    console.error('Error in sendVerificationCode:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

exports.verifyCode = async (req, res) => {
  console.log("verifyCode",req.body);
  try {
    const { verificationCode, token } = req.body; // Now expecting token in request body

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No verification token provided' 
      });
    }

    // Verify JWT token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid or expired token' 
        });
      }

      // Check if verification code matches
      if (decoded.code !== verificationCode) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid verification code' 
        });
      }

      res.status(200).json({ 
        success: true, 
        message: 'Email verified successfully',
        email: decoded.email
      });
    });

  } catch (error) {
    console.error('Error in verifyCode:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};
