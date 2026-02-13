import { Router } from "express";
import { generateTicket, scanTicket } from "../controllers/tickets.controller";
import { protect, restrictTo } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /tickets/{id}/generate-ticket:
 *   post:
 *     summary: Generate a ticket for an event
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: {type: string}
 *     responses:
 *       200: {description: Ticket generated}
 */
// Attendees generate tickets
router.post(
  "/:id/generate-ticket",
  protect,
  restrictTo("attendee"),
  generateTicket,
);

/**
 * @swagger
 * /tickets/scan-ticket:
 *   post:
 *     summary: Scan a ticket
 *     tags: [Admin (Organizer)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ticketId]
 *             properties:
 *               ticketId: {type: string}
 *     responses:
 *       200: {description: Ticket scanned successfully}
 */
// Organizers scan tickets
router.post("/scan-ticket", protect, restrictTo("organizer"), scanTicket);

export default router;
