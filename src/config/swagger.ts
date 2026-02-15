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
    paths: {
      "/analytics/overall": {
        get: {
          summary: "Get overall analytics for all events",
          tags: ["Admin (Organizer)"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          responses: {
            "200": {
              description: "Overall analytics data",
            },
          },
        },
      },
      "/analytics/event/{id}": {
        get: {
          summary: "Get analytics for a specific event",
          tags: ["Admin (Organizer)"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            "200": {
              description: "Event analytics data",
            },
          },
        },
      },
      "/attendees/{id}/apply": {
        post: {
          summary: "Apply to an event",
          tags: ["Attendees"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            "200": {
              description: "Applied successfully",
            },
          },
        },
      },
      "/attendees/{id}/reminder": {
        post: {
          summary: "Set a reminder for an event",
          tags: ["Attendees"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            "200": {
              description: "Reminder set successfully",
            },
          },
        },
      },
      "/attendees/applied": {
        get: {
          summary: "Get attendees for my events (Organizer only)",
          tags: ["Admin (Organizer)"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          responses: {
            "200": {
              description: "List of attendees who applied to your events",
            },
          },
        },
      },
      "/events": {
        get: {
          summary: "Get all events",
          tags: ["Events"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          responses: {
            "200": {
              description: "List of events",
            },
          },
        },
      },
      "/events/search-events": {
        get: {
          summary: "Search for events",
          tags: ["Events"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    keyword: {
                      type: "string",
                    },
                    category: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Search results",
            },
          },
        },
      },
      "/events/applied": {
        get: {
          summary: "Get events the user has applied to",
          tags: ["Events"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          responses: {
            "200": {
              description: "List of applied events",
            },
          },
        },
      },
      "/events/{id}": {
        get: {
          summary: "Get a single event by ID",
          tags: ["Events"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            "200": {
              description: "Event details",
            },
          },
        },
      },
      "/events/create-event": {
        post: {
          summary: "Create a new event",
          tags: ["Admin (Organizer)"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          requestBody: {
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    title: {
                      type: "string",
                    },
                    description: {
                      type: "string",
                    },
                    date: {
                      type: "string",
                      format: "date-time",
                    },
                    location: {
                      type: "string",
                    },
                    backdrop: {
                      type: "string",
                      format: "binary",
                    },
                    capacity: {
                      type: "number",
                      format: "number",
                    },
                    price: {
                      type: "number",
                      format: "number",
                    },
                    time: {
                      type: "string",
                      format: "string",
                    },
                    category: {
                      type: "string",
                      format: "string",
                    },
                    reminders: {
                      type: "string",
                      format: "string",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Event created",
            },
          },
        },
      },
      "/events/{id}/delete": {
        delete: {
          summary: "Delete an event",
          tags: ["Admin (Organizer)"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            "200": {
              description: "Event deleted",
            },
          },
        },
      },
      "/tickets/{id}/generate-ticket": {
        post: {
          summary: "Generate a ticket for an event",
          tags: ["Tickets"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            "200": {
              description: "Ticket generated",
            },
          },
        },
      },
      "/tickets/scan-ticket": {
        post: {
          summary: "Scan a ticket",
          tags: ["Admin (Organizer)"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["ticketId"],
                  properties: {
                    ticketId: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Ticket scanned successfully",
            },
          },
        },
      },
      "/users/register": {
        post: {
          summary: "Register a new user",
          tags: ["Users"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password", "username"],
                  properties: {
                    name: {
                      type: "string",
                    },
                    email: {
                      type: "string",
                    },
                    password: {
                      type: "string",
                    },
                    username: {
                      type: "string",
                    },
                    role: {
                      type: "string",
                    },
                    organizationName: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "User registered successfully",
              content: {
                "application/json": {
                  example: {
                    success: true,
                    data: {
                      id: "698ee1b66195079573bcd93d",
                      name: "jane doe",
                      email: "menu@mailinator.com",
                      role: "attendee",
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/users/login": {
        post: {
          summary: "Login user",
          tags: ["Users"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: {
                      type: "string",
                      example: "menu+@mailinator.com",
                    },
                    password: {
                      type: "string",
                      example: "pasword123",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Login successful",
            },
          },
        },
      },
      "/users/logout": {
        get: {
          summary: "Logout user",
          tags: ["Users"],
          responses: {
            "200": {
              description: "Logout successful",
            },
          },
        },
      },
      "/users/me": {
        get: {
          summary: "Get current user profile",
          tags: ["Users"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          responses: {
            "200": {
              description: "User profile retrieved",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
