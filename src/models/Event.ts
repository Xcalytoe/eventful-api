import mongoose, { Schema } from "mongoose";
import { IEvent } from "../types/event";

const reminderSchema = new Schema({
  reminderTime: { type: String, required: true },
  sent: { type: Boolean, default: false },
  email: { type: String, required: true },
});

const ticketSchema = new Schema({
  eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
  attendeeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  purchaseDate: { type: Date, default: Date.now },
  qrCode: { type: String, required: true },
  token: { type: String, required: true },
  scanned: { type: Boolean, default: false },
  price: { type: Number, required: true },
});

const eventSchema = new Schema<IEvent>({
  title: {
    type: String,
    required: [true, "Please enter event title"],
    trim: true,
  },
  location: {
    type: String,
    required: [true, "Please enter event location"],
  },
  category: {
    type: String,
    required: [true, "Please enter event category"],
  },
  description: {
    type: String,
    required: [true, "Please enter event description"],
  },
  date: {
    type: Date,
    required: [true, "Please enter event date"],
  },
  time: {
    type: String,
    required: [true, "Please enter event start time"],
  },
  price: {
    type: Number,
    required: [true, "Please enter ticket price"],
  },
  capacity: {
    type: Number,
    required: [true, "Please enter event capacity"],
  },
  backdrop: {
    type: String,
    required: [true, "Please enter event backdrop"],
  },
  applicants: [
    {
      applicantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      name: String,
      username: String,
      email: String,
    },
  ],
  ticketsSold: { type: Number, default: 0 },
  tickets: [ticketSchema],
  reminders: [reminderSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  organizer: {
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organizer",
    },
    organizationName: String,
    email: String,
  },
});

const Event = mongoose.model<IEvent>("Event", eventSchema);

export default Event;
