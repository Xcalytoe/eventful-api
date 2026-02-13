import { Router } from "express";
import {
  getEvents,
  applyToEvent,
  getAppliedEvents,
  getEventAttendees,
  setReminder,
} from "../controllers/attendees.controller";
import { protect, restrictTo } from "../middleware/auth";

const router = Router();

// Protected routes (Only attendees can apply or set reminders)
/**
 * @swagger
 * /attendees/{id}/apply:
 *   post:
 *     summary: Apply to an event
 *     tags: [Attendees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: {type: string}
 *     responses:
 *       200: {description: Applied successfully}
 */
router.post("/:id/apply", protect, restrictTo("attendee"), applyToEvent);

/**
 * @swagger
 * /attendees/{id}/reminder:
 *   post:
 *     summary: Set a reminder for an event
 *     tags: [Attendees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: {type: string}
 *     responses:
 *       200: {description: Reminder set successfully}
 */
router.post("/:id/reminder", protect, restrictTo("attendee"), setReminder);

/**
 * @swagger
 * /attendees/applied:
 *   get:
 *     summary: Get attendees for my events (Organizer only)
 *     tags: [Admin (Organizer)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: {description: List of attendees who applied to your events}
 */
router.get("/applied", protect, restrictTo("organizer"), getEventAttendees);

export default router;
