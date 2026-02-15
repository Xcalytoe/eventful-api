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
import swaggerDocument from "../swagger.json";
import swaggerSpec from "./config/swagger";

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

const API_BASE = `/api/${APP_CONFIG.API_VERSION}`;

// Swagger UI

app.get("/api-docs/swagger.json", (_req, res) => {
  res.json(swaggerSpec);
});

app.get("/api-docs", (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Eventful API Documentation</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css" />
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js" crossorigin></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js" crossorigin></script>
      <script>
        window.onload = () => {
          window.ui = SwaggerUIBundle({
            url: '/api-docs/swagger.json',
            dom_id: '#swagger-ui',
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ],
            layout: "StandaloneLayout",
          });
        };
      </script>
    </body>
    </html>
  `);
});

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
