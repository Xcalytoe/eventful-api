import { Router } from "express";
import {
  getEvents,
  applyToEvent,
  getAppliedEvents,
  setReminder,
} from "../controllers/attendees.controller";
import { protect, restrictTo } from "../middleware/auth";

const router = Router();

router.get("/", getEvents);

// Protected routes (Only attendees can apply or set reminders)
router.post("/:id/apply", protect, restrictTo("attendee"), applyToEvent);
router.get("/applied", protect, restrictTo("attendee"), getAppliedEvents);
router.post("/:id/reminder", protect, restrictTo("attendee"), setReminder);

export default router;
