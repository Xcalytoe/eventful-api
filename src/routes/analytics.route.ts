import { Router } from "express";
import {
  getAllEventAnalytics,
  getSingleEventAnalytics,
} from "../controllers/analytics.controller";
import { protect, restrictTo } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /analytics/overall:
 *   get:
 *     summary: Get overall analytics for all events
 *     tags: [Admin (Organizer)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: {description: Overall analytics data}
 */
// Only organizers can access analytics
router.get("/overall", protect, restrictTo("organizer"), getAllEventAnalytics);

/**
 * @swagger
 * /analytics/event/{id}:
 *   get:
 *     summary: Get analytics for a specific event
 *     tags: [Admin (Organizer)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: {type: string}
 *     responses:
 *       200: {description: Event analytics data}
 */
router.get(
  "/event/:id",
  protect,
  restrictTo("organizer"),
  getSingleEventAnalytics,
);

export default router;
