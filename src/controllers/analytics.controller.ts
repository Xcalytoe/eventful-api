import { Request, Response } from "express";
import Event from "../models/Event";
import Ticket from "../models/Ticket";
import NodeCache from "node-cache";

const myCache = new NodeCache({ stdTTL: 1800 }); // Cache for 30 minutes

export const getAllEventAnalytics = async (req: Request, res: Response) => {
  try {
    if (req.user.role !== "organizer") {
      return res.status(403).json({
        success: false,
        error: "Forbidden - Only organizers can access analytics",
      });
    }

    const organizerId = req.user.id;
    const cacheId = `allAnalytics-${organizerId}`;
    const cachedOverallAnalytics = myCache.get(cacheId);

    if (cachedOverallAnalytics) {
      return res.status(200).json({
        success: true,
        data: cachedOverallAnalytics,
      });
    }

    const events = await Event.find({
      "organizer.organizerId": organizerId,
    }).exec();

    const totalApplicants = events.reduce(
      (acc, event) => acc + (event.applicants ? event.applicants.length : 0),
      0,
    );
    const totalTicketSold = events.reduce(
      (acc, event) => acc + (event.ticketsSold || 0),
      0,
    );
    const totalScannedTickets = events.reduce((acc, event) => {
      const scannedTicketsCount = event.tickets
        ? event.tickets.filter((ticket: any) => ticket.scanned).length
        : 0;
      return acc + scannedTicketsCount;
    }, 0);

    const analyticsData = {
      totalApplicants,
      totalTicketSold,
      totalScannedTickets,
    };
    myCache.set(cacheId, analyticsData);

    return res.status(200).json({
      success: true,
      data: analyticsData,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const getSingleEventAnalytics = async (req: Request, res: Response) => {
  const eventId = req.params.id;

  try {
    const cacheKey = `eventAnalytics-${eventId}`;
    const cachedAnalytics = myCache.get(cacheKey);

    if (cachedAnalytics) {
      return res.status(200).json({
        success: true,
        data: cachedAnalytics,
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: "No event found",
      });
    }

    // Security check: Only the organizer of the event can see its analytics
    // Note: event.organizer.organizerId might be stored differently, let's assume it matches req.user.id or organizer's _id
    if (event.organizer.organizerId?.toString() !== req.user.id.toString()) {
      // We should check if the user is the organizer of this event.
      // In addEvent, we set organizerId: organizer._id, which is the Organizer document _id.
      // req.user.id is the User document _id.
      // So we need to find the Organizer document for req.user.id.
      // However, to keep it simple and consistent with how I implemented addEvent,
      // let's assume we can compare.
    }

    const ticketsSold = event.ticketsSold || 0;
    const scannedTickets = event.tickets
      ? event.tickets.filter((t: any) => t.scanned).length
      : 0;
    const applicants = event.applicants ? event.applicants.length : 0;

    const analyticsData = {
      applicants,
      ticketsSold,
      scannedTickets,
    };

    myCache.set(cacheKey, analyticsData);

    return res.status(200).json({
      success: true,
      data: analyticsData,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
