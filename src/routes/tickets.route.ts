import { Router } from "express";
import { generateTicket, scanTicket } from "../controllers/tickets.controller";
import { protect, restrictTo } from "../middleware/auth";

const router = Router();

// Attendees generate tickets
router.post(
  "/:id/generate-ticket",
  protect,
  restrictTo("attendee"),
  generateTicket,
);

// Organizers scan tickets
router.post("/scan-ticket", protect, restrictTo("organizer"), scanTicket);

export default router;
