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

// passport-jwt middleware (make sure to require and set this up properly)
// require("./src/middleware/auth");

const API_BASE = `/api/${APP_CONFIG.API_VERSION}`;

// Swagger UI
// const CSS_URL =
//   "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";

// app.use(
//   "/api-docs",
//   swaggerUi.serve,
//   swaggerUi.setup(swaggerSpec, {
//     customCssUrl: CSS_URL,
//     customJs: [
//       "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui-bundle.js",
//       "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui-standalone-preset.js",
//     ],
//   }),
// );
const CSS_URL = "https://cdnjs.cloudflare.com";
const JS_URLS = [
  "https://cdnjs.cloudflare.com",
  "https://cdnjs.cloudflare.com",
];

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCssUrl: CSS_URL,
    customJs: JS_URLS,
  }),
);

// Routes
app.get("/", (_, res) => {
  res.status(200).json({
    message: "Welcome to the Eventful API",
    version: "1.0",
    documentation: "https://github.com/Xcalytoe/eventful",
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
