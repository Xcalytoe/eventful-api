import { Router } from "express";
import {
  getAllEventAnalytics,
  getSingleEventAnalytics,
} from "../controllers/analytics.controller";
import { protect, restrictTo } from "../middleware/auth";

const router = Router();

// Only organizers can access analytics
router.get("/overall", protect, restrictTo("organizer"), getAllEventAnalytics);
router.get(
  "/event/:id",
  protect,
  restrictTo("organizer"),
  getSingleEventAnalytics,
);

export default router;
