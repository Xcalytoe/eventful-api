import { Request, Response } from "express";
import Ticket from "../models/Ticket";
import Event from "../models/Event";
import Attendee from "../models/Attendee";
import QRCode from "qrcode";
import { generateToken, verifyToken } from "../utils/jwt";
import APP_CONFIG from "../config";

interface JwtPayload {
  eventId: string;
  userId: string;
}

export const generateTicket = async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    const attendee = await Attendee.findOne({ userId: req.user.id });

    if (!attendee) {
      return res.status(404).json({
        success: false,
        message: "No Attendee Found.",
      });
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        error: "No event found",
      });
    }

    if (event.ticketsSold >= event.capacity) {
      return res.status(410).json({
        success: false,
        error: "This event is sold out.",
      });
    }

    const userId = req.user.id;
    const eventId = event._id;

    const qrData = { eventId, userId };
    const ticketToken = generateToken(qrData);

    QRCode.toDataURL(ticketToken, async (err, url) => {
      if (err) {
        return res.status(500).json({ message: "Failed to generate QR code" });
      }

      const newTicket = new Ticket({
        eventId,
        attendeeId: userId,
        qrCode: url,
        token: ticketToken,
        price: event.price,
      });

      const ticket = await newTicket.save();

      // Update attendee's tickets
      await Attendee.findByIdAndUpdate(attendee._id, {
        $push: { tickets: ticket },
      });

      // Update event's tickets and sold count
      await Event.findByIdAndUpdate(eventId, {
        $push: { tickets: ticket },
        $inc: { ticketsSold: 1 },
      });

      return res.status(200).json({
        success: true,
        ticketId: ticket._id,
        qrCode: url,
      });
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const scanTicket = async (req: Request, res: Response) => {
  const { qrCode } = req.body;

  try {
    if (req.user.role !== "organizer") {
      return res.status(403).json({
        success: false,
        error: "Forbidden - Only organizers can scan tickets",
      });
    }

    let ticketRecord = await Ticket.findOne({ qrCode });

    if (!ticketRecord) {
      return res.status(404).json({
        success: false,
        message: "No ticket found.",
      });
    }

    let decodedToken: any;
    try {
      decodedToken = verifyToken(ticketRecord.token);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired ticket token",
      });
    }

    const { eventId, userId } = decodedToken;

    let event = await Event.findOne({
      $and: [
        { _id: eventId },
        { "organizer.organizerId": req.user.id }, // Verification that the scanning organizer owns the event
      ],
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "No matching event found for this organizer.",
      });
    }

    if (ticketRecord.scanned) {
      return res.status(400).json({
        success: false,
        message: "Ticket has already been scanned",
      });
    }

    // Mark ticket as scanned in the Ticket collection
    ticketRecord.scanned = true;
    await ticketRecord.save();

    // Mark as scanned in the Event's embedded tickets array
    await Event.updateOne(
      { _id: eventId, "tickets._id": ticketRecord._id },
      { $set: { "tickets.$.scanned": true } },
    );

    // Mark as scanned in the Attendee's embedded tickets array
    await Attendee.updateOne(
      { userId: userId, "tickets._id": ticketRecord._id },
      { $set: { "tickets.$.scanned": true } },
    );

    return res.status(200).json({
      success: true,
      message: "Ticket verified successfully",
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
