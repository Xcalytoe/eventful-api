import mongoose, { Schema } from "mongoose";
import { IOrganizer } from "../types/user";

const organizerSchema = new Schema<IOrganizer>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  organizationName: {
    type: String,
    required: [true, "Please enter role"],
    trim: true,
  },
  createdEvents: [
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
});

const Organizer = mongoose.model<IOrganizer>("Organizer", organizerSchema);

export default Organizer;
