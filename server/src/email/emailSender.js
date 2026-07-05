// emailSender.js
const nodemailer = require("nodemailer");
const logger = require("./emailLogger");
require("dotenv").config();

class EmailSender {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendMail({
    from,
    to,
    subject,
    text,
    template,
    variables,
    html,
    cc,
    bcc,
    attachments = [],
  }) {
    try {
      let finalHtml = html;

      if (template) {
        finalHtml = this.loadTemplate(template, variables);
      }

      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_ADDRESS}>`,
        to: Array.isArray(to) ? to.join(", ") : to,
        subject,
        text,
        html: finalHtml,
        ...(cc && { cc }),
        ...(bcc && { bcc }),
        attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`[EmailSender] Sent email to ${to} | subject: ${subject}`);
      return info;
    } catch (error) {
      logger.error(`[EmailSender] Error: %o`, error);
      throw error;
    }
  }
}

module.exports = new EmailSender();
