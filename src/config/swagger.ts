import swaggerJsdoc from "swagger-jsdoc";
import APP_CONFIG from "./index";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Eventful API",
      version: "1.0.0",
      description: "API documentation for the Eventful application",
    },
    servers:
      process.env.NODE_ENV === "production"
        ? [
            {
              url: `https://eventful-api-beta.vercel.app/api/${APP_CONFIG.API_VERSION}`,
              description: "Production server",
            },
            {
              url: `http://localhost:${APP_CONFIG.PORT}/api/${APP_CONFIG.API_VERSION}`,
              description: "Development server",
            },
          ]
        : [
            {
              url: `http://localhost:${APP_CONFIG.PORT}/api/${APP_CONFIG.API_VERSION}`,
              description: "Development server",
            },
            {
              url: `https://eventful-api-beta.vercel.app/api/${APP_CONFIG.API_VERSION}`,
              description: "Production server",
            },
          ],
    tags: [
      {
        name: "Users",
        description: "Endpoints for event users",
      },
      {
        name: "Events",
        description: "Endpoints for events",
      },
      {
        name: "Tickets",
        description: "Endpoints for event tickets",
      },
      {
        name: "Attendees",
        description: "Endpoints for event attendees",
      },
      {
        name: "Admin (Organizer)",
        description: "Endpoints for event organizers and administrators",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
