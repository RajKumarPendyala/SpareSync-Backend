const nodemailer = require('nodemailer');

exports.emailOTP = async (email) => {
  // 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_ID,
      to: email,
      subject: "Email OTP Verification",
      text: `Your OTP is: ${otp}`,
    });

    return otp;
  } catch (error) {
    console.error("Error sending OTP email:", error.message);
    return null;
  }
};
