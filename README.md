# Eventful API

Eventful is a demo backend API for an event management platform, built with Node.js, Express, and MongoDB. It allows users to create events, buy tickets, and manage event attendees.

## Features

- **User Authentication**: Secure signup and login using JWT.
- **Event Management**: Create, update, view, and delete events.
- **Ticket System**: Purchase tickets, generate QR codes, and validate tickets.
- **attendee Management**: Track event applicants and attendees.
- **RBAC**: Role-based access control for Organizers and Attendees.
- **Swagger Documentation**: Interactive API documentation.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose)
- **Authentication**: Passport.js (JWT)
- **Documentation**: Swagger UI
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- MongoDB (Local or Atlas URI)
- Redis (optional, for caching/queues if implemented)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Xcalytoe/eventful.git
   cd eventful
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory using the `.env.example` file as a guide.

### Running the Server

- **Development**:

  ```bash
  npm run dev
  ```

- **Production**:
  ```bash
  npm start
  ```

## API Documentation

The API documentation is available via Swagger UI.

1. Start the server.
2. Visit `http://localhost:5000/api-docs` in your browser.
