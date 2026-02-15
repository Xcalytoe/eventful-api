import { Queue } from "bullmq";

const connection = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL }
  : {
      host: "127.0.0.1",
      port: 6379,
    };

export const emailQueue = new Queue("email-queue", {
  connection,
});

// Initialize the email queue and schedule the repeatable job.

export const initEmailQueue = async () => {
  console.log("Initializing Email Queue and scheduling repeatable jobs...");

  // Schedule a daily job at 7 AM to check for reminders
  await emailQueue.add(
    "check-reminders",
    {},
    {
      repeat: {
        pattern: "0 7 * * *", // 7:00 AM every day
      },
      jobId: "daily-reminder-check",
    },
  );
};
