import express, { Application, Request, Response, NextFunction } from "express";
import app from "./app";
import connectDb from "./config/db";
import { rateLimit } from "express-rate-limit";
import { initEmailQueue } from "./queues/emailQueue";
import "./workers/emailWorker"; // Import to start the worker
// import morgan from "morgan";
// import session from "express-session";

const cors = require("cors");

const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  `http://localhost:${PORT}`,
  "https://eventful-frontend.vercel.app",
  "https://eventful-lbd.netlify.app/",
];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: "GET,POST,OPTIONS",
  allowedHeaders: ["Content-Type", "Authorization", "Origin", "Accept"],
};
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many requests, please try again later.",
    });
  },
});

// Enable CORS
app.use(cors(corsOptions));
// Parse JSON bodies
app.use(express.json());
// Apply rate limiting to all requests
app.use(limiter);

// Connect to the database and then start the server
// Connect to the database and then start the server
if (require.main === module) {
  connectDb().then(async () => {
    await initEmailQueue();
    app.listen(PORT, () => {
      console.log(`Server running on port http://localhost:${PORT}`);
    });
  });
}

export default app;
