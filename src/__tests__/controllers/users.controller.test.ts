import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
} from "../../controllers/users.controller";
import User from "../../models/User";
import Organizer from "../../models/Organizer";
import Attendee from "../../models/Attendee";
import { generateToken } from "../../utils/jwt";
import { authSchema } from "../../utils/validationSchema";

// Mock dependencies
jest.mock("../../models/User");
jest.mock("../../models/Organizer");
jest.mock("../../models/Attendee");
jest.mock("../../utils/jwt");
jest.mock("../../utils/validationSchema");
jest.mock("bcryptjs");

describe("Users Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      body: {},
      user: undefined,
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    const validRegistrationData = {
      name: "John Doe",
      username: "johndoe",
      email: "john@example.com",
      password: "password123",
      verifyPassword: "password123",
      role: "attendee",
    };

    it("should register a new attendee successfully", async () => {
      mockRequest.body = validRegistrationData;

      const mockUser = {
        _id: "user123",
        name: "John Doe",
        email: "john@example.com",
        role: "attendee",
      };

      (authSchema.validateAsync as jest.Mock).mockResolvedValue(
        validRegistrationData,
      );
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue("salt");
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (Attendee.create as jest.Mock).mockResolvedValue({});

      await registerUser(mockRequest as Request, mockResponse as Response);

      expect(User.findOne).toHaveBeenCalledWith({
        email: validRegistrationData.email,
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(
        validRegistrationData.password,
        "salt",
      );
      expect(User.create).toHaveBeenCalled();
      expect(Attendee.create).toHaveBeenCalledWith({
        userId: mockUser._id,
        appliedEvents: [],
        reminders: [],
        tickets: [],
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          id: mockUser._id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
        },
      });
    });

    it("should register a new organizer successfully with organization name", async () => {
      const organizerData = {
        ...validRegistrationData,
        role: "organizer",
        organizationName: "Event Organizers Inc",
      };
      mockRequest.body = organizerData;

      const mockUser = {
        _id: "organizer123",
        name: "John Doe",
        email: "john@example.com",
        role: "organizer",
      };

      (authSchema.validateAsync as jest.Mock).mockResolvedValue(organizerData);
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue("salt");
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (Organizer.create as jest.Mock).mockResolvedValue({});

      await registerUser(mockRequest as Request, mockResponse as Response);

      expect(Organizer.create).toHaveBeenCalledWith({
        userId: mockUser._id,
        organizationName: "Event Organizers Inc",
        createdEvents: [],
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it("should return 409 when user already exists", async () => {
      mockRequest.body = validRegistrationData;

      (authSchema.validateAsync as jest.Mock).mockResolvedValue(
        validRegistrationData,
      );
      (User.findOne as jest.Mock).mockResolvedValue({
        email: "john@example.com",
      });

      await registerUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "User with this email already exists",
      });
    });

    it("should return 400 when organization name is missing for organizer", async () => {
      const organizerDataWithoutOrg = {
        ...validRegistrationData,
        role: "organizer",
      };
      mockRequest.body = organizerDataWithoutOrg;

      const mockUser = {
        _id: "organizer123",
        role: "organizer",
      };

      (authSchema.validateAsync as jest.Mock).mockResolvedValue(
        organizerDataWithoutOrg,
      );
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue("salt");
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
      (User.create as jest.Mock).mockResolvedValue(mockUser);

      await registerUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Organization name is required for organizers",
      });
    });

    it("should return 400 for invalid role", async () => {
      const invalidRoleData = {
        ...validRegistrationData,
        role: "admin",
      };
      mockRequest.body = invalidRoleData;

      const mockUser = {
        _id: "user123",
        role: "admin",
      };

      (authSchema.validateAsync as jest.Mock).mockResolvedValue(
        invalidRoleData,
      );
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue("salt");
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
      (User.create as jest.Mock).mockResolvedValue(mockUser);

      await registerUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid role",
      });
    });

    it("should return 400 for validation errors", async () => {
      mockRequest.body = { email: "invalid" };

      const validationError = {
        isJoi: true,
        details: [{ message: "Validation failed" }],
      };

      (authSchema.validateAsync as jest.Mock).mockRejectedValue(
        validationError,
      );

      await registerUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Validation failed",
      });
    });

    it("should return 500 for server errors", async () => {
      mockRequest.body = validRegistrationData;

      (authSchema.validateAsync as jest.Mock).mockResolvedValue(
        validRegistrationData,
      );
      (User.findOne as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      await registerUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Database error",
      });
    });
  });

  describe("loginUser", () => {
    it("should login user with valid credentials", async () => {
      const loginData = {
        email: "john@example.com",
        password: "password123",
      };
      mockRequest.body = loginData;

      const mockUser = {
        _id: "user123",
        email: "john@example.com",
        password: "hashedPassword",
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (generateToken as jest.Mock).mockReturnValue("generated-token");

      await loginUser(mockRequest as Request, mockResponse as Response);

      expect(User.findOne).toHaveBeenCalledWith({ email: loginData.email });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginData.password,
        mockUser.password,
      );
      expect(generateToken).toHaveBeenCalledWith({ id: mockUser._id });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          token: "generated-token",
        },
      });
    });

    it("should return 400 when email is missing", async () => {
      mockRequest.body = { password: "password123" };

      await loginUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Please provide email and password",
      });
    });

    it("should return 400 when password is missing", async () => {
      mockRequest.body = { email: "john@example.com" };

      await loginUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Please provide email and password",
      });
    });

    it("should return 401 when user does not exist", async () => {
      mockRequest.body = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);

      await loginUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid email or password",
      });
    });

    it("should return 401 when password is incorrect", async () => {
      mockRequest.body = {
        email: "john@example.com",
        password: "wrongpassword",
      };

      const mockUser = {
        _id: "user123",
        email: "john@example.com",
        password: "hashedPassword",
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await loginUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid email or password",
      });
    });

    it("should return 500 for server errors", async () => {
      mockRequest.body = {
        email: "john@example.com",
        password: "password123",
      };

      (User.findOne as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      await loginUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Database error",
      });
    });
  });

  describe("logoutUser", () => {
    it("should logout user successfully", () => {
      logoutUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        "authToken",
        "loggedout",
        {
          expires: expect.any(Date),
          httpOnly: true,
        },
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Logged out successfully",
      });
    });
  });

  describe("getProfile", () => {
    it("should return user profile", async () => {
      const mockUser = {
        _id: "user123",
        name: "John Doe",
        email: "john@example.com",
        role: "attendee",
      };

      mockRequest.user = mockUser;

      await getProfile(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
      });
    });
  });
});
