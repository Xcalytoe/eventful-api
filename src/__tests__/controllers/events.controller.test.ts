import { Request, Response } from "express";
import {
  getEvents,
  getSingleEvent,
  searchEvents,
  addEvent,
  deleteEvent,
  getMyEvents,
  getEventApplicants,
} from "../../controllers/events.controller";
import Event from "../../models/Event";
import User from "../../models/User";
import Organizer from "../../models/Organizer";
import { cloudinary } from "../../config/cloudinaryConfig";
import { eventSchema } from "../../utils/validationSchema";
import fs from "fs";

// Mock dependencies
jest.mock("../../models/Event");
jest.mock("../../models/User");
jest.mock("../../models/Organizer");
jest.mock("../../config/cloudinaryConfig");
jest.mock("../../utils/validationSchema");
jest.mock("fs");

describe("Events Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      query: {},
      user: undefined,
      file: undefined,
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  describe("getEvents", () => {
    it("should return all events successfully", async () => {
      const mockEvents = [
        { _id: "1", title: "Event 1", location: "Location 1" },
        { _id: "2", title: "Event 2", location: "Location 2" },
      ];

      (Event.find as jest.Mock).mockResolvedValue(mockEvents);

      await getEvents(mockRequest as Request, mockResponse as Response);

      expect(Event.find).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockEvents,
      });
    });

    it("should return empty array when no events exist", async () => {
      (Event.find as jest.Mock).mockResolvedValue([]);

      await getEvents(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        data: [],
      });
    });

    it("should return 500 on server error", async () => {
      (Event.find as jest.Mock).mockRejectedValue(new Error("Database error"));

      await getEvents(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Server Error",
      });
    });
  });

  describe("getSingleEvent", () => {
    it("should return a single event by ID", async () => {
      const mockEvent = {
        _id: "event123",
        title: "Tech Conference",
        location: "San Francisco",
      };

      mockRequest.params = { id: "event123" };
      (Event.findById as jest.Mock).mockResolvedValue(mockEvent);

      await getSingleEvent(mockRequest as Request, mockResponse as Response);

      expect(Event.findById).toHaveBeenCalledWith("event123");
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockEvent,
      });
    });

    it("should return 404 when event not found", async () => {
      mockRequest.params = { id: "nonexistent" };
      (Event.findById as jest.Mock).mockResolvedValue(null);

      await getSingleEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "No Event Found.",
      });
    });

    it("should return 500 on server error", async () => {
      mockRequest.params = { id: "event123" };
      (Event.findById as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      await getSingleEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Database error",
      });
    });
  });

  describe("searchEvents", () => {
    it("should search events by title", async () => {
      mockRequest.query = { search: "Tech" };
      const mockEvents = [
        { _id: "1", title: "Tech Conference" },
        { _id: "2", title: "TechFest" },
      ];

      (Event.find as jest.Mock).mockResolvedValue(mockEvents);

      await searchEvents(mockRequest as Request, mockResponse as Response);

      expect(Event.find).toHaveBeenCalledWith({
        $or: expect.arrayContaining([
          { title: expect.any(RegExp) },
          { location: expect.any(RegExp) },
          { category: expect.any(RegExp) },
          { "organizer.organizationName": expect.any(RegExp) },
        ]),
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockEvents,
      });
    });

    it('should return "No Events" message when no results found', async () => {
      mockRequest.query = { search: "NonExistent" };
      (Event.find as jest.Mock).mockResolvedValue([]);

      await searchEvents(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        data: "No Events",
      });
    });

    it("should return 500 on server error", async () => {
      mockRequest.query = { search: "Tech" };
      (Event.find as jest.Mock).mockRejectedValue(new Error("Database error"));

      await searchEvents(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Server Error",
      });
    });
  });

  describe("addEvent", () => {
    const validEventData = {
      title: "Tech Conference",
      location: "San Francisco",
      category: "Technology",
      description: "Annual tech conference",
      date: new Date("2026-06-15"),
      time: "09:00 AM",
      price: 99.99,
      capacity: 500,
      reminders: "1 day before",
    };

    it("should create event successfully for organizer", async () => {
      mockRequest.user = { id: "organizer123" };
      mockRequest.body = validEventData;
      mockRequest.file = { path: "/tmp/upload.jpg" } as Express.Multer.File;

      const mockUser = {
        _id: "organizer123",
        email: "organizer@example.com",
        role: "organizer",
      };

      const mockOrganizer = {
        _id: "org123",
        organizationName: "Event Org",
      };

      const mockSavedEvent = {
        _id: "event123",
        ...validEventData,
        backdrop: "https://cloudinary.com/image.jpg",
      };

      (User.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      (Organizer.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrganizer),
      });
      (cloudinary.uploader.upload as jest.Mock).mockResolvedValue({
        secure_url: "https://cloudinary.com/image.jpg",
      });
      (eventSchema.validateAsync as jest.Mock).mockResolvedValue(
        validEventData,
      );
      (Event as any).mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockSavedEvent),
      }));
      (Organizer.findByIdAndUpdate as jest.Mock).mockResolvedValue({});
      (fs.unlink as unknown as jest.Mock).mockImplementation((path, callback) =>
        callback(null),
      );

      await addEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockSavedEvent,
      });
    });

    it("should return 403 when user is not an organizer", async () => {
      mockRequest.user = { id: "attendee123" };
      mockRequest.body = validEventData;

      const mockUser = {
        _id: "attendee123",
        role: "attendee",
      };

      (User.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      await addEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Access denied. Only organizers can perform this action.",
      });
    });

    it("should return 404 when organizer details not found", async () => {
      mockRequest.user = { id: "organizer123" };
      mockRequest.body = validEventData;

      const mockUser = {
        _id: "organizer123",
        role: "organizer",
      };

      (User.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      (Organizer.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await addEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Organizer details not found",
      });
    });

    it("should return 400 when no file is uploaded", async () => {
      mockRequest.user = { id: "organizer123" };
      mockRequest.body = validEventData;
      mockRequest.file = undefined;

      const mockUser = {
        _id: "organizer123",
        role: "organizer",
      };

      const mockOrganizer = {
        _id: "org123",
      };

      (User.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      (Organizer.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrganizer),
      });

      await addEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "No file uploaded",
      });
    });

    it("should return 400 for validation errors", async () => {
      mockRequest.user = { id: "organizer123" };
      mockRequest.body = { title: "" };
      mockRequest.file = { path: "/tmp/upload.jpg" } as Express.Multer.File;

      const mockUser = {
        _id: "organizer123",
        role: "organizer",
      };

      const mockOrganizer = {
        _id: "org123",
      };

      const validationError = {
        isJoi: true,
        details: [{ message: "Title is required" }],
      };

      (User.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      (Organizer.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrganizer),
      });
      (cloudinary.uploader.upload as jest.Mock).mockResolvedValue({
        secure_url: "https://cloudinary.com/image.jpg",
      });
      (eventSchema.validateAsync as jest.Mock).mockRejectedValue(
        validationError,
      );
      (fs.unlink as unknown as jest.Mock).mockImplementation((path, callback) =>
        callback(null),
      );

      await addEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Title is required",
      });
    });
  });

  describe("deleteEvent", () => {
    it("should delete event successfully", async () => {
      mockRequest.params = { id: "event123" };
      mockRequest.user = { id: "organizer123" };

      const mockEvent = {
        _id: "event123",
        deleteOne: jest.fn().mockResolvedValue({}),
      };

      (Event.findOne as jest.Mock).mockResolvedValue(mockEvent);

      await deleteEvent(mockRequest as Request, mockResponse as Response);

      expect(Event.findOne).toHaveBeenCalledWith({
        $and: [
          { _id: "event123" },
          { "organizer.organizerId": "organizer123" },
        ],
      });
      expect(mockEvent.deleteOne).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {},
      });
    });

    it("should return 404 when event not found or unauthorized", async () => {
      mockRequest.params = { id: "event123" };
      mockRequest.user = { id: "organizer123" };

      (Event.findOne as jest.Mock).mockResolvedValue(null);

      await deleteEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "No event found or unauthorized",
      });
    });

    it("should return 500 on server error", async () => {
      mockRequest.params = { id: "event123" };
      mockRequest.user = { id: "organizer123" };

      (Event.findOne as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      await deleteEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Database error",
      });
    });
  });

  describe("getMyEvents", () => {
    it("should return events for authenticated organizer", async () => {
      mockRequest.user = { id: "organizer123" };

      const mockEvents = [
        { _id: "1", title: "Event 1", "organizer.organizerId": "organizer123" },
        { _id: "2", title: "Event 2", "organizer.organizerId": "organizer123" },
      ];

      (Event.find as jest.Mock).mockResolvedValue(mockEvents);

      await getMyEvents(mockRequest as Request, mockResponse as Response);

      expect(Event.find).toHaveBeenCalledWith({
        "organizer.organizerId": "organizer123",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockEvents,
      });
    });

    it("should return empty array when organizer has no events", async () => {
      mockRequest.user = { id: "organizer123" };

      (Event.find as jest.Mock).mockResolvedValue([]);

      await getMyEvents(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        data: [],
      });
    });

    it("should return 500 on server error", async () => {
      mockRequest.user = { id: "organizer123" };

      (Event.find as jest.Mock).mockRejectedValue(new Error("Database error"));

      await getMyEvents(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Database error",
      });
    });
  });

  describe("getEventApplicants", () => {
    it("should return applicants for event owner", async () => {
      mockRequest.params = { id: "event123" };
      mockRequest.user = { id: "organizer123" };

      const mockEvent = {
        _id: "event123",
        applicants: [
          { userId: "user1", name: "User 1" },
          { userId: "user2", name: "User 2" },
        ],
      };

      (Event.findOne as jest.Mock).mockResolvedValue(mockEvent);

      await getEventApplicants(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(Event.findOne).toHaveBeenCalledWith({
        $and: [
          { _id: "event123" },
          { "organizer.organizerId": "organizer123" },
        ],
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockEvent.applicants,
      });
    });

    it("should return 404 when event not found or unauthorized", async () => {
      mockRequest.params = { id: "event123" };
      mockRequest.user = { id: "organizer123" };

      (Event.findOne as jest.Mock).mockResolvedValue(null);

      await getEventApplicants(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "No event found or unauthorized",
      });
    });

    it("should return 500 on server error", async () => {
      mockRequest.params = { id: "event123" };
      mockRequest.user = { id: "organizer123" };

      (Event.findOne as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      await getEventApplicants(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Database error",
      });
    });
  });
});
