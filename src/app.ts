import express, { Application, Request, Response, NextFunction } from "express";
import APP_CONFIG from "./config";

const app = express();

// Middleware
app.use(express.json());

// passport-jwt middleware (make sure to require and set this up properly)
// require("./src/middleware/auth");

// Routes
app.get("/", (_, res) => {
  res.status(200).json({
    message: "Welcome to the Blog API",
    version: "1.0",
    documentation: "https://github.com/Xcalytoe/eventful",
  });
});
// app.use(`/api/${VERSION}/user`, authRoute);
// app.use(`/api/${VERSION}/articles`, articleRoute);

//  Handle 404 (route not found)
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    hasError: true,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handler middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const message = err?.message || "Oops! Something went wrong";
  return res.status(err.statusCode || 500).json({
    hasError: true,
    message,
  });
});

export default app;
