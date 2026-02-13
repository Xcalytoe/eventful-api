import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import Organizer from "../models/Organizer";
import Attendee from "../models/Attendee";
import { generateToken } from "../utils/jwt";
import { authSchema } from "../utils/validationSchema";

// Register a new user (Attendee or Organizer)
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, username, email, password, role, organizationName } =
      (await authSchema.validateAsync(req.body)) || {};

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user
    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      role,
    });
    if (!!role && role !== "organizer" && role !== "attendee") {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }
    // Create profile based on role
    if (role === "organizer") {
      if (!organizationName) {
        return res.status(400).json({
          success: false,
          message: "Organization name is required for organizers",
        });
      }
      await Organizer.create({
        userId: user._id,
        organizationName,
        createdEvents: [],
      });
    }
    if (role === "attendee") {
      await Attendee.create({
        userId: user._id,
        appliedEvents: [],
        reminders: [],
        tickets: [],
      });
    }

    return res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    if (error.isJoi) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// Login user
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email = "", password = "" } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken({ id: user._id });
    // res.cookie("authToken", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    // });

    return res.status(200).json({
      success: true,
      data: {
        token,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

/**
 * Logout user
 */
export const logoutUser = (req: Request, res: Response) => {
  res.cookie("authToken", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// Get current user profile
export const getProfile = async (req: Request, res: Response) => {
  // req.user is attached by the 'protect' middleware
  return res.status(200).json({
    success: true,
    data: req.user,
  });
};
