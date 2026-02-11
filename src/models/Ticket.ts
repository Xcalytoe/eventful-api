import mongoose, { Document, Schema } from "mongoose";
import { ITicket } from "../types/event";

const TicketSchema: Schema = new Schema({
  eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
  attendeeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  purchaseDate: { type: Date, default: Date.now },
  qrCode: { type: String, required: true },
  token: { type: String, required: true },
  scanned: { type: Boolean, default: false },
  price: { type: Number, required: true },
});

const Ticket = mongoose.model<ITicket>("Ticket", TicketSchema);
export default Ticket;
