import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import APP_CONFIG from "./config";
import {
  eventRoutes,
  ticketRoutes,
  analyticsRoutes,
  attendeesRoutes,
  usersRoutes,
} from "./routes";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger";

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

const API_BASE = `/api/${APP_CONFIG.API_VERSION}`;

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.get("/", (_, res) => {
  res.status(200).json({
    message: "Welcome to the Eventful API",
    version: "1.0",
    github: "https://github.com/Xcalytoe/eventful-api",
    documentation: "https://eventful-api-7f0t.onrender.com/api-docs",
  });
});

// Route registration
app.use(`${API_BASE}/users`, usersRoutes);
app.use(`${API_BASE}/events`, eventRoutes);
app.use(`${API_BASE}/tickets`, ticketRoutes);
app.use(`${API_BASE}/attendees`, attendeesRoutes);
app.use(`${API_BASE}/analytics`, analyticsRoutes);

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
