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

const router = Router();

router.get("/", getEvents);
router.get("/:id", getSingleEvent);
router.post("/search-events", searchEvents);

// Protected routes (Only organizers can add/delete events)
router.post(
  "/create-event",
  protect,
  restrictTo("organizer"),
  upload.single("backdrop"),
  addEvent,
);
router.delete("/:id/delete", protect, restrictTo("organizer"), deleteEvent);

export default router;
