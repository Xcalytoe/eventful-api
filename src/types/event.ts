import mongoose, { Schema, Document, ObjectId } from "mongoose";
import { IApplicant, IAuthor } from "./user";

type IObjectId = Schema.Types.ObjectId;

export interface ICreatedEvents {
  eventId: IObjectId;
  title: string;
  location: string;
  category: string;
  description: string;
  date: string;
  time: string;
  price: number;
  capacity: number;
  backdrop: string;
}

export interface ITicket extends Document {
  eventId: string;
  attendeeId: string;
  purchaseDate: Date;
  qrCode: string;
  token: string;
  scanned: boolean;
  price: number;
}

export interface IReminder {
  reminderTime: string;
  sent: boolean;
  email: string;
}

export interface IAppliedEvents {
  eventId: IObjectId;
  title: string;
  location: string;
  category: string;
  description: string;
  date: string;
  time: string;
  price: number;
  capacity: number;
  backdrop: string;
}
export interface IEvent extends Document {
  id: ObjectId;
  title: string;
  location: string;
  category: string;
  description: string;
  date: Date;
  time: string;
  price: number;
  capacity: number;
  backdrop: string;
  applicants: IApplicant[];
  ticketsSold: number;
  tickets: ITicket[];
  reminders: IReminder[];
  createdAt: Date;
  organizer: IAuthor;
}
