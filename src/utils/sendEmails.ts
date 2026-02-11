import nodemailer from "nodemailer";
import moment from "moment";
import { IEvent, IReminder } from "../types/event";

// Send welcome emails to attendees.
export const sendWelcomeEmails = async (reminder: IReminder, event: IEvent) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Eventful Team" <${process.env.EMAIL_USER}>`,
    to: reminder.email,
    subject: `Welcome to ${event.title}!`,
    html: `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
          .email-container { background-color: #ffffff; padding: 20px; margin: 0 auto; border-radius: 10px; max-width: 600px; box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1); }
          .header { text-align: center; background-color: #d9534f; padding: 10px; color: white; border-radius: 10px 10px 0 0; }
          .content { padding: 20px; text-align: justify; }
          .footer { margin-top: 20px; text-align: center; color: #777777; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>Eventful</h1>
          </div>
          <div class="content">
            <h2>Hello!</h2>
            <p>We are excited to inform you about your upcoming event!</p>
            <p><strong>Event:</strong> ${event.title}</p>
            <p><strong>Date:</strong> ${moment(event.date).format("dddd MMMM D, YYYY")}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <br/>
            <p>We look forward to seeing you there!</p>
          </div>
          <div class="footer">
            <p>&copy; ${moment().year()} Eventful. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return info;
  } catch (error) {
    console.error("Error sending reminder email:", error);
    throw error;
  }
};

// Send reminder emails to attendees.
export const sendReminderEmails = async (
  reminder: IReminder,
  event: IEvent,
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Eventful Team" <${process.env.EMAIL_USER}>`,
    to: reminder.email,
    subject: `Reminder: ${event.title} is coming up!`,
    html: `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
          .email-container { background-color: #ffffff; padding: 20px; margin: 0 auto; border-radius: 10px; max-width: 600px; box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1); }
          .header { text-align: center; background-color: #d9534f; padding: 10px; color: white; border-radius: 10px 10px 0 0; }
          .content { padding: 20px; text-align: justify; }
          .footer { margin-top: 20px; text-align: center; color: #777777; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>Eventful</h1>
          </div>
          <div class="content">
            <h2>Hello!</h2>
            <p>We are excited to inform you about your upcoming event!</p>
            <p><strong>Event:</strong> ${event.title}</p>
            <p><strong>Date:</strong> ${moment(event.date).format("dddd MMMM D, YYYY")}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <br/>
            <p>We look forward to seeing you there!</p>
          </div>
          <div class="footer">
            <p>&copy; ${moment().year()} Eventful. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return info;
  } catch (error) {
    console.error("Error sending reminder email:", error);
    throw error;
  }
};
