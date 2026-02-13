import { Request, Response, NextFunction } from "express";
import Event from "../models/Event";
import User from "../models/User";
import Organizer from "../models/Organizer";
import { cloudinary } from "../config/cloudinaryConfig";
import fs from "fs";
import { eventSchema } from "../utils/validationSchema";
import { sendReminderEmails } from "../utils/sendEmails"; // Note: sendEventCreationEmail might be needed, but I'll use sendReminderEmails if creation email is not available yet or create it.

export const getEvents = async (req: Request, res: Response) => {
  console.log(req.headers, "headers");
  try {
    const events = await Event.find();
    return res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

export const getSingleEvent = async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "No Event Found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: event,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const searchEvents = async (req: Request, res: Response) => {
  const { search } = req.query;
  const newSearch = new RegExp(search as string, "i");

  try {
    const events = await Event.find({
      $or: [
        { title: newSearch },
        { location: newSearch },
        { category: newSearch },
        { "organizer.organizationName": newSearch },
      ],
    });

    return res.status(200).json({
      success: true,
      count: events.length,
      data: events.length === 0 ? "No Events" : events,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

export const addEvent = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user.id).exec();
    if (!user || user.role !== "organizer") {
      return res.status(403).json({
        message: "Access denied. Only organizers can perform this action.",
      });
    }

    const organizer = await Organizer.findOne({ userId: req.user.id }).exec();
    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: "Organizer details not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "Eventful-api",
    });
    console.log(result, "upload result");
    fs.unlink(req.file.path, (err) => {
      if (err) console.error(err);
    });

    const validInputs = await eventSchema.validateAsync(req.body);

    const reminder = {
      reminderTime: validInputs.reminders,
      email: user.email,
      sent: false,
    };

    const newEvent = new Event({
      ...validInputs,
      backdrop: result.secure_url,
      applicants: [],
      tickets: [],
      reminders: [reminder],
      organizer: {
        organizerId: organizer._id,
        organizationName: organizer.organizationName,
        email: user.email,
      },
    });

    const savedEvent = await newEvent.save();

    await Organizer.findByIdAndUpdate(organizer._id, {
      $push: {
        createdEvents: {
          eventId: savedEvent._id,
          title: savedEvent.title,
          location: savedEvent.location,
          category: savedEvent.category,
          description: savedEvent.description,
          date: savedEvent.date.toISOString(),
          time: savedEvent.time,
          price: savedEvent.price,
          capacity: savedEvent.capacity,
          backdrop: savedEvent.backdrop,
        },
      },
    });

    return res.status(201).json({
      success: true,
      data: savedEvent,
    });
  } catch (error: any) {
    if (error.isJoi) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const event = await Event.findOne({
      $and: [{ _id: req.params.id }, { "organizer.organizerId": req.user.id }],
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: "No event found or unauthorized",
      });
    }

    await event.deleteOne();

    return res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const getMyEvents = async (req: Request, res: Response) => {
  try {
    const events = await Event.find({ "organizer.organizerId": req.user.id });

    return res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const getEventApplicants = async (req: Request, res: Response) => {
  try {
    const event = await Event.findOne({
      $and: [{ _id: req.params.id }, { "organizer.organizerId": req.user.id }],
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "No event found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      count: event.applicants.length,
      data: event.applicants,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
