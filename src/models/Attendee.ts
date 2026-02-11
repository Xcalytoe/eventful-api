import mongoose, { Schema } from "mongoose";
import { IAttendee } from "../types/user";

const attendeeSchema = new Schema<IAttendee>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  appliedEvents: [
    {
      eventId: { type: Schema.Types.ObjectId, ref: "Event" },
      title: { type: String },
      location: { type: String },
      category: { type: String },
      description: { type: String },
      date: { type: String },
      time: { type: String },
      price: { type: Number },
      capacity: { type: Number },
      backdrop: { type: String },
    },
  ],
  reminders: [
    {
      eventId: { type: Schema.Types.ObjectId, ref: "Event" },
      reminderTime: { type: String, required: true },
      sent: { type: Boolean, default: false },
      email: { type: String, required: true },
    },
  ],
  tickets: [
    {
      eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
      attendeeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      purchaseDate: { type: Date, default: Date.now },
      qrCode: { type: String, required: true },
      token: { type: String, required: true },
      scanned: { type: Boolean, default: false },
      price: { type: Number, required: true },
    },
  ],
});

const Attendee = mongoose.model<IAttendee>("Attendee", attendeeSchema);

export default Attendee;
