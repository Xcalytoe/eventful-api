import mongoose, { Schema, Document } from "mongoose";
import { IAppliedEvents, ICreatedEvents, IReminder, ITicket } from "./event";

export type IUser = Document & {
  id?: string;
  name: string;
  username: string;
  email: string;
  role: string;
  password: string;
  createdAt: Date;
};

export interface IAuthor {
  [x: string]: unknown;
  organizerId: Schema.Types.ObjectId;
  organizationName: string;
  email: string;
}

export interface IAttendee extends Document {
  userId: mongoose.Types.ObjectId;
  organizationName: string;
  appliedEvents: IAppliedEvents[];
  reminders: IReminder[];
  tickets: ITicket[];
}

export interface IOrganizer extends Document {
  userId: mongoose.Types.ObjectId;
  organizationName: string;
  createdEvents: ICreatedEvents[];
}

export interface IApplicant {
  applicantId: mongoose.Types.ObjectId;
  name: string;
  username: string;
  email: string;
}
