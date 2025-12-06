import nodemailer from "nodemailer";

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send email with OTP
export const sendOTPEmail = async (email, otp, userName = "User") => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || "E-commerce Store"}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Password Reset OTP - E-commerce Store",
      html: getOTPEmailTemplate(userName, otp),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("OTP email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

// Email template for OTP
const getOTPEmailTemplate = (userName, otp) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset OTP</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #4a90e2;
          margin-bottom: 10px;
        }
        .otp-box {
          background-color: #f8f9fa;
          border: 2px dashed #4a90e2;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 30px 0;
        }
        .otp-code {
          font-size: 32px;
          font-weight: bold;
          color: #4a90e2;
          letter-spacing: 5px;
          font-family: 'Courier New', monospace;
        }
        .message {
          margin: 20px 0;
          color: #666;
        }
        .warning {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          text-align: center;
          color: #999;
          font-size: 12px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #4a90e2;
          color: #ffffff;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🛍️ E-commerce Store</div>
          <h2>Password Reset Request</h2>
        </div>
        
        <p>Hello ${userName},</p>
        
        <p class="message">
          We received a request to reset your password. Please use the following One-Time Password (OTP) to complete the password reset process.
        </p>
        
        <div class="otp-box">
          <p style="margin: 0 0 10px 0; color: #666;">Your OTP Code:</p>
          <div class="otp-code">${otp}</div>
        </div>
        
        <p class="message">
          This OTP will expire in <strong>10 minutes</strong>. Please do not share this code with anyone.
        </p>
        
        <div class="warning">
          <strong>⚠️ Security Notice:</strong>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Never share your OTP with anyone</li>
            <li>Our team will never ask for your OTP</li>
            <li>If you didn't request this, please ignore this email</li>
          </ul>
        </div>
        
        <p class="message">
          If you didn't request a password reset, please ignore this email or contact our support team if you have concerns.
        </p>
        
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>&copy; ${new Date().getFullYear()} E-commerce Store. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

