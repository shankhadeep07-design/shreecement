const { parentPort } = require("worker_threads");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const { imageToDataURI } = require("../utils/imageToBase64URI");

const logoPath = path.resolve(__dirname, "../assets/img/c_logo.png");
const logoUri = imageToDataURI(logoPath);

async function sendForgotPasswordOtpMail({ email, name, otp, expiryMinutes }) {

  const templatePath = path.resolve(__dirname,"../templates/forgotPasswordTemplate.html");

  let html = fs.readFileSync(templatePath, "utf-8");

  html = html
    .replace("{{name}}", name)
    .replace("{{otp}}", otp)
    .replace("{{expiryMinutes}}", expiryMinutes)
    .replace("{{logoPath}}", logoUri)
    .replace("{{year}}", new Date().getFullYear());

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.office365.com",
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || "auto-notification@cyberswift.com",
      pass: process.env.SMTP_PASSWORD || "Swift&#4512",
    },
  });

  await transporter.sendMail({
    from: "auto-notification@cyberswift.com",
    to: email,
    subject: "Password Reset OTP",
    html,
  });
}

// Listen for messages
parentPort.on("message", async (data) => {
  try {
    await sendForgotPasswordOtpMail(data);
    parentPort.postMessage({ success: true });
  } catch (err) {
    parentPort.postMessage({
      success: false,
      error: err.message,
    });
  }
});
