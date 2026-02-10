import dotenv from "dotenv";
import express, { Application, Request, Response, NextFunction } from "express";
import app from "./app";
// import session from "express-session";
const cors = require("cors");

// const app = require("./app");
// const connectDb = require("./src/config/db"); // Assuming the database connection logic is in this file.

const PORT = process.env.PORT || 3000;

// Connect to the database and then start the server
// connectDb().then(() => {
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// });
