// certificateWorker.js
const { parentPort , workerData} = require("worker_threads");
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
// const puppeteer = require("puppeteer");
const puppeteer = require("puppeteer-core");
const { imageToDataURI } = require("../utils/imageToBase64URI");

const logoPath = path.resolve(__dirname, "../assets/img/c_logo.png");
const logoUri = imageToDataURI(logoPath);
const topLeftPath = path.resolve(__dirname, "../assets/img/top-left.png");
const topLeftUri = imageToDataURI(topLeftPath);
const bottomRightPath = path.resolve(__dirname, "../assets/img/bottom-right.png");
const bottomRightUri = imageToDataURI(bottomRightPath);

const bestAwardPath = path.resolve(__dirname, "../assets/img/best-award.png");
const bestAwardUri = imageToDataURI(bestAwardPath);

// async function generateCertificate({ name, eventName, date }) {
//   const templatePath = path.resolve(__dirname, "../templates/certificateTemplate.html");
//   let html = fs.readFileSync(templatePath, "utf-8");

//   // Replace placeholders
//   html = html
//     .replace("{{name}}", name)
//     .replace("{{eventName}}", eventName)
//     .replace("{{date}}", date)
//     .replace("{{logoPath}}", logoUri)
//     .replace("{{topLeftPath}}", topLeftUri)
//     .replace("{{bottomRightPath}}", bottomRightUri)
//     .replace("{{bestAwardPath}}", bestAwardUri);

//   // const outPath = path.join(__dirname, "text.html");
//   // fs.writeFileSync(outPath, html);

//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   await page.setContent(html, { waitUntil: "networkidle0" });

//   const filePath = `certificate-${Date.now()}.pdf`;
//   await page.pdf({
//     path: filePath,
//     format: "A4",
//     landscape: true,
//     printBackground: true,
//   });

//   await browser.close();
//   return filePath;
// }


async function generateCertificate({ name, eventName, date }) {
  const templatePath = path.resolve(__dirname, "../templates/certificateTemplate.html");
  let html = fs.readFileSync(templatePath, "utf-8");

  html = html
    .replace("{{name}}", name)
    .replace("{{eventName}}", eventName)
    .replace("{{date}}", date)
    .replace("{{logoPath}}", logoUri)
    .replace("{{topLeftPath}}", topLeftUri)
    .replace("{{bottomRightPath}}", bottomRightUri)
    .replace("{{bestAwardPath}}", bestAwardUri);

  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium-browser",
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-zygote",
      "--single-process"
    ]
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const filePath = `certificate-${Date.now()}.pdf`;
  await page.pdf({
    path: filePath,
    format: "A4",
    landscape: true,
    printBackground: true,
  });

  await browser.close();
  return filePath;
}


async function sendCertificateMail({ userEmail, name, eventName, date }) {
  const filePath = await generateCertificate({ name, eventName, date });

  // const transporter = nodemailer.createTransport({
  //   // service: process.env.SMTP_SERVICE || 'gmail',
  //   service: process.env.SMTP_SERVICE || 'hotmail',
  //   auth: {
  //     user: process.env.SMTP_USER || 'auto-notification@cyberswift.com',
  //     pass: process.env.SMTP_PASSWORD || 'Swift&#4512',
  //   },
  // });

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.office365.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // STARTTLS
    auth: {
      user: process.env.SMTP_USER || 'auto-notification@cyberswift.com',
      pass: process.env.SMTP_PASSWORD || 'Swift&#4512',
    },
  });

  console.log(userEmail)

  const mailOptions = {
    from: "auto-notification@cyberswift.com",
    // to: 'subhajeet.das@cyberswift.com',
    to: userEmail,
    subject: "Your Event Certificate",
    text: `Dear ${name},\n\nPlease find attached your certificate for ${eventName}.`,
    attachments: [{ filename: "certificate.pdf", path: filePath }],
  };

  await transporter.sendMail(mailOptions);

  fs.unlinkSync(filePath); // clean up
}

// Listen for messages from main thread
parentPort.on("message", async (data) => {
  try {
    console.log("Worker received data:", data);
    
    await sendCertificateMail(data);
    parentPort.postMessage({ success: true });
  } catch (err) {
    parentPort.postMessage({ success: false, error: err.message });
  }
});
