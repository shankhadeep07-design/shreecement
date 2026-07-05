const { parentPort } = require("worker_threads");
const { Sequelize, Op, QueryTypes } = require("sequelize");
const nodemailer = require("nodemailer");
const fs = require("fs");
const handlebars = require("handlebars");
const EventModel = require("../models/emo_volunteering/event.model");
const { sequelize } = require("../config/db");
require("dotenv").config();

// === Email Setup ===
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: process.env.SMTP_PORT == 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: { rejectUnauthorized: false },
  logger: true,
  debug: false,
});

// === Load Handlebars Template ===
const templateSource = fs.readFileSync(
  "src/jobs/templates/eventReminder.hbs",
  "utf8"
);
const template = handlebars.compile(templateSource);

// === Helper Functions ===
async function getVolunteers(eventId) {
  const sql = `
    SELECT email
    FROM public.t_event_assign
    LEFT JOIN users ON users.id = t_event_assign.tea_user_id
    WHERE tea_status = 'approved' AND tea_event_id = :eventId
  `;
  return sequelize.query(sql, {
    replacements: { eventId },
    type: QueryTypes.SELECT,
  });
}

async function markReminderSent(eventId) {
  const sql = `
    UPDATE t_event_assign
    SET tea_final_status = 'reminder'
    WHERE tea_status = 'approved' AND tea_event_id = :eventId
  `;
  return sequelize.query(sql, { replacements: { eventId }, type: QueryTypes.UPDATE });
}

// === Function to Send Event Reminders ===
async function sendEventReminders() {
  try {
    // Verify SMTP connection
    await transporter.verify();
    console.log("✅ SMTP server is ready");

    // Date 2 days from now
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 2);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // Fetch events
    const events = await EventModel.findAll({
      where: {
        tevnt_start_date_event: { [Op.between]: [startOfDay, endOfDay] },
        tevnt_is_active: true,
      },
    });

    if (!events.length) {
      console.log("ℹ️ No events scheduled for reminders.");
      parentPort.postMessage("No events to send reminders for.");
      return;
    }

    // Loop over events
    for (const event of events) {
      const volunteers = await getVolunteers(event.tevnt_id);
      const emails = volunteers.map(v => v.email).filter(Boolean);

      if (!emails.length) {
        console.log(`⚠️ No approved volunteers for event: ${event.tevnt_activity_title}`);
        continue;
      }

      console.log(`📩 Sending reminders for "${event.tevnt_activity_title}" to ${emails.length} volunteers`);

      // Send emails concurrently
      await Promise.all(
        emails.map(email => {
          const html = template({
            eventName: event.tevnt_activity_title,
            location: event.tevnt_location,
            activity_details: event.tevnt_activity_details,
            hr_person_name: event.tevnt_hr_person_name,
            hr_person_phone_no: event.tevnt_hr_person_phone_no,
            startDate: `${event.tevnt_start_date_event} ${event.tevnt_start_time}`,
          });

          return transporter.sendMail({
            from: `"Choromandel Event Reminder" <${process.env.SMTP_USER}>`,
            to: email,
            subject: `Reminder: Event "${event.tevnt_activity_title}" starts in 2 days!`,
            html,
          })
          .then(() => console.log(`✅ Reminder sent to ${email}`))
          .catch(err => console.error(`❌ Failed to send email to ${email}: ${err.message}`));
        })
      );

      // Mark reminder as sent
      await markReminderSent(event.tevnt_id);
    }

    parentPort.postMessage("✅ Event reminders sent successfully!");
  } catch (err) {
    console.error("❌ Error sending reminders:", err);
    parentPort.postMessage("❌ Error sending reminders");
  }
}

// Run the function
sendEventReminders();
