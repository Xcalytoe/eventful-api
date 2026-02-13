import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
} from "../controllers/users.controller";
import { protect } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, username]
 *             properties:
 *               name: {type: string}
 *               email: {type: string}
 *               password: {type: string}
 *               username: {type: string}
 *               role: {type: string}
 *               organizationName: {type: string}
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "698ee1b66195079573bcd93d"
 *                 name: "jane doe"
 *                 email: "menu@mailinator.com"
 *                 role: "attendee"
 */
router.post("/register", registerUser);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: {type: string, example: "menu+@mailinator.com"}
 *               password: {type: string, example: "pasword123"}
 *     responses:
 *       200: {description: Login successful}
 */
router.post("/login", loginUser);

/**
 * @swagger
 * /users/logout:
 *   get:
 *     summary: Logout user
 *     tags: [Users]
 *     responses:
 *       200: {description: Logout successful}
 */
router.get("/logout", logoutUser);

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: {description: User profile retrieved}
 */
router.get("/me", protect, getProfile);

export default router;
