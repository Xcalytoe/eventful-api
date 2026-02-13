import { Router } from "express";
import {
  getEvents,
  getSingleEvent,
  searchEvents,
  addEvent,
  deleteEvent,
} from "../controllers/events.controller";
import { protect, restrictTo } from "../middleware/auth";
import { upload } from "../config/multerConfig";
import { getAppliedEvents } from "../controllers/attendees.controller";

const router = Router();

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get all events
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: {description: List of events}
 */
router.get("/", protect, getEvents);

/**
 * @swagger
 * /events/search-events:
 *   get:
 *     summary: Search for events
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               keyword: {type: string}
 *               category: {type: string}
 *     responses:
 *       200: {description: Search results}
 */
router.get("/search-events", protect, searchEvents);

/**
 * @swagger
 * /events/applied:
 *   get:
 *     summary: Get events the user has applied to
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: {description: List of applied events}
 */
router.get("/applied", protect, restrictTo("attendee"), getAppliedEvents);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Get a single event by ID
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: {type: string}
 *     responses:
 *       200: {description: Event details}
 */
router.get("/:id", protect, getSingleEvent);

// Protected routes (Only organizers can add/delete events)
/**
 * @swagger
 * /events/create-event:
 *   post:
 *     summary: Create a new event
 *     tags: [Admin (Organizer)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title: {type: string}
 *               description: {type: string}
 *               date: {type: string, format: date-time}
 *               location: {type: string}
 *               backdrop: {type: string, format: binary}
 *               capacity: {type: number, format: number}
 *               price: {type: number, format: number}
 *               time: {type: string, format: string}
 *               category: {type: string, format: string}
 *               reminders: {type: string, format: string}
 *     responses:
 *       201: {description: Event created}
 */
router.post(
  "/create-event",
  protect,
  restrictTo("organizer"),
  upload.single("backdrop"),
  addEvent,
);

/**
 * @swagger
 * /events/{id}/delete:
 *   delete:
 *     summary: Delete an event
 *     tags: [Admin (Organizer)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: {type: string}
 *     responses:
 *       200: {description: Event deleted}
 */
router.delete("/:id/delete", protect, restrictTo("organizer"), deleteEvent);

export default router;
