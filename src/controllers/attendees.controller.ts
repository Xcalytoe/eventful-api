import { Request, Response } from "express";
import Event from "../models/Event";
import Attendee from "../models/Attendee";

export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await Event.find();
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

export const applyToEvent = async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: "No event found",
      });
    }

    const attendee = await Attendee.findOne({ userId: req.user.id }).exec();

    if (!attendee) {
      return res.status(404).json({
        success: false,
        message: "Attendee details not found",
      });
    }

    const alreadyApplied = event.applicants.some(
      (applicant: any) =>
        applicant.applicantId.toString() === req.user.id.toString(),
    );

    if (alreadyApplied) {
      return res.status(409).json({
        success: false,
        error: "Already applied.",
      });
    }

    if (
      event.organizer.organizerId &&
      event.organizer.organizerId.toString() === req.user.id.toString()
    ) {
      return res.status(405).json({
        success: false,
        error: "You can't apply for your own event.",
      });
    }

    // Add applicant to event
    event.applicants.push({
      applicantId: req.user.id,
      name: req.user.name,
      username: req.user.username,
      email: req.user.email,
    });

    await event.save();

    // Add event to attendee's appliedEvents
    await Attendee.findByIdAndUpdate(attendee._id, {
      $push: {
        appliedEvents: {
          eventId: event._id,
          title: event.title,
          location: event.location,
          category: event.category,
          description: event.description,
          date: event.date.toISOString(),
          time: event.time,
          price: event.price,
          capacity: event.capacity,
          backdrop: event.backdrop,
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Applied for event successfully",
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const getAppliedEvents = async (req: Request, res: Response) => {
  try {
    const attendee = await Attendee.findOne({ userId: req.user.id });

    if (!attendee) {
      return res.status(404).json({
        success: false,
        message: "Attendee not found",
      });
    }

    return res.status(200).json({
      success: true,
      count: attendee.appliedEvents.length,
      data: attendee.appliedEvents,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const setReminder = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;
    const { reminderTime } = req.body;

    let attendee = await Attendee.findOne({ userId: req.user.id });
    let event = await Event.findById(eventId);

    if (!attendee) {
      return res.status(404).json({
        success: false,
        message: "No Attendee Found.",
      });
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "No Event Found.",
      });
    }

    const reminder = {
      reminderTime,
      email: req.user.email,
      sent: false,
    };

    // Add to attendee's reminders
    await Attendee.findByIdAndUpdate(attendee._id, {
      $push: { reminders: { ...reminder, eventId: event._id } },
    });

    // Add to event's reminders
    await Event.findByIdAndUpdate(event._id, {
      $push: { reminders: reminder },
    });

    return res.status(201).json({
      success: true,
      message: "Reminder set successfully",
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "Error setting reminder",
      error: err.message,
    });
  }
};
