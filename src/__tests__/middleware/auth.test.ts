import { Request, Response, NextFunction } from "express";
import { protect, restrictTo } from "../../middleware/auth";
import { verifyToken } from "../../utils/jwt";
import User from "../../models/User";

// Mock dependencies
jest.mock("../../utils/jwt");
jest.mock("../../models/User");

describe("Authentication Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    // Reset mocks before each test
    mockRequest = {
      headers: {},
      cookies: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();

    // Clear all mock calls
    jest.clearAllMocks();
  });

  describe("protect middleware", () => {
    it("should authenticate user with valid Bearer token", async () => {
      const mockUser = {
        _id: "user123",
        name: "Test User",
        email: "test@example.com",
        role: "attendee",
      };

      mockRequest.headers = {
        authorization: "Bearer valid-token-here",
      };

      (verifyToken as jest.Mock).mockReturnValue({ id: "user123" });
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      await protect(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(verifyToken).toHaveBeenCalledWith("valid-token-here");
      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(mockRequest.user).toEqual(mockUser);
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should accept lowercase "bearer" in authorization header', async () => {
      const mockUser = {
        _id: "user456",
        name: "Another User",
        email: "another@example.com",
        role: "organizer",
      };

      mockRequest.headers = {
        authorization: "bearer valid-token",
      };

      (verifyToken as jest.Mock).mockReturnValue({ id: "user456" });
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      await protect(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(verifyToken).toHaveBeenCalledWith("valid-token");
      expect(nextFunction).toHaveBeenCalled();
    });

    it("should return 401 when no token is provided", async () => {
      mockRequest.headers = {};

      await protect(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "You are not logged in! Please log in to get access.",
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should return 401 when authorization header is missing Bearer prefix", async () => {
      mockRequest.headers = {
        authorization: "just-a-token",
      };

      await protect(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should return 401 when token is invalid", async () => {
      mockRequest.headers = {
        authorization: "Bearer invalid-token",
      };

      (verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await protect(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid token. Please log in again.",
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should return 401 when token is expired", async () => {
      mockRequest.headers = {
        authorization: "Bearer expired-token",
      };

      (verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error("jwt expired");
      });

      await protect(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid token. Please log in again.",
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should return 401 when user no longer exists", async () => {
      mockRequest.headers = {
        authorization: "Bearer valid-token",
      };

      (verifyToken as jest.Mock).mockReturnValue({ id: "deleted-user" });
      (User.findById as jest.Mock).mockResolvedValue(null);

      await protect(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "The user belonging to this token no longer exists.",
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should handle database errors gracefully", async () => {
      mockRequest.headers = {
        authorization: "Bearer valid-token",
      };

      (verifyToken as jest.Mock).mockReturnValue({ id: "user123" });
      (User.findById as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      await protect(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe("restrictTo middleware", () => {
    it("should allow access for authorized role", () => {
      mockRequest.user = {
        _id: "user123",
        role: "organizer",
      };

      const middleware = restrictTo("organizer");
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should allow access when user has one of multiple allowed roles", () => {
      mockRequest.user = {
        _id: "user456",
        role: "attendee",
      };

      const middleware = restrictTo("organizer", "attendee", "admin");
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should deny access for unauthorized role", () => {
      mockRequest.user = {
        _id: "user789",
        role: "attendee",
      };

      const middleware = restrictTo("organizer");
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "You do not have permission to perform this action",
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should deny access when user role is not in allowed roles list", () => {
      mockRequest.user = {
        _id: "user999",
        role: "guest",
      };

      const middleware = restrictTo("organizer", "admin");
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should work with single role restriction", () => {
      mockRequest.user = {
        _id: "admin1",
        role: "admin",
      };

      const middleware = restrictTo("admin");
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(nextFunction).toHaveBeenCalled();
    });

    it("should be case-sensitive for role matching", () => {
      mockRequest.user = {
        _id: "user123",
        role: "Organizer", // Capital O
      };

      const middleware = restrictTo("organizer"); // lowercase
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe("protect and restrictTo integration", () => {
    it("should work together to authenticate and authorize", async () => {
      const mockUser = {
        _id: "organizer123",
        name: "Event Organizer",
        email: "organizer@example.com",
        role: "organizer",
      };

      mockRequest.headers = {
        authorization: "Bearer valid-organizer-token",
      };

      (verifyToken as jest.Mock).mockReturnValue({ id: "organizer123" });
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      // First apply protect middleware
      await protect(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockRequest.user).toEqual(mockUser);
      expect(nextFunction).toHaveBeenCalled();

      // Reset nextFunction mock
      nextFunction = jest.fn();

      // Then apply restrictTo middleware
      const restrictMiddleware = restrictTo("organizer");
      restrictMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(nextFunction).toHaveBeenCalled();
    });
  });
});
