const nodemailer = require("nodemailer");
const process = require("process");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.YOUREMAIL,
    pass: process.env.YOURAPPLICATIONPASSWORD,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"no-reply" <${process.env.YOUREMAIL}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    return "Email đã được gửi thành công.";
  } catch (error) {
    throw new Error("Gửi email thất bại: " + error.message);
  }
};

module.exports = sendEmail;
