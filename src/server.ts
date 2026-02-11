import dotenv from "dotenv";
import express, { Application, Request, Response, NextFunction } from "express";
import app from "./app";
import connectDb from "./config/db";
import { rateLimit } from "express-rate-limit";
// import morgan from "morgan";
// import session from "express-session";

const cors = require("cors");
dotenv.config();

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

// const app = require("./app");
// const connectDb = require("./src/config/db"); // Assuming the database connection logic is in this file.

// Enable CORS
app.use(cors(corsOptions));
// Parse JSON bodies
app.use(express.json());
// Apply rate limiting to all requests
app.use(limiter);

// Connect to the database and then start the server
connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
