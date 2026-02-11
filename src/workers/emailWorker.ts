import { Worker, Job } from "bullmq";
import moment from "moment";
import Event from "../models/Event";
import { sendReminderEmails } from "../utils/sendEmails";
import { emailQueue } from "../queues/emailQueue";

const connection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379"),
};

const emailWorker = new Worker(
  "email-queue",
  async (job: Job) => {
    if (job.name === "check-reminders") {
      console.log("Checking for upcoming events to send reminders...");
      const todayDate = moment().format("DD/MM/YYYY");

      const upcomingEvents = await Event.find({
        "reminders.reminderTime": todayDate,
        "reminders.sent": false,
      });

      console.log(
        `Found ${upcomingEvents.length} events with pending reminders for ${todayDate}`,
      );

      for (const event of upcomingEvents) {
        for (const reminder of event.reminders) {
          if (reminder.reminderTime === todayDate && !reminder.sent) {
            // Add individual email job to the queue
            await emailQueue.add("send-email", {
              reminder,
              event: event.toObject(),
            });

            reminder.sent = true;
          }
        }
        await event.save();
      }
    } else if (job.name === "send-email") {
      const { reminder, event } = job.data;
      console.log(
        `Sending reminder email to ${reminder.email} for event ${event.title}`,
      );
      await sendReminderEmails(reminder, event);
    }
  },
  {
    connection,
    concurrency: 5,
  },
);

emailWorker.on("completed", (job) => {
  console.log(`Job ${job.id} of name ${job.name} completed successfully`);
});

emailWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed with error: ${err.message}`);
});

export default emailWorker;
