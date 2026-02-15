import jwt from "jsonwebtoken";
import { generateToken, verifyToken } from "../../utils/jwt";
import APP_CONFIG from "../../config";

// Mock the config module
jest.mock("../../config", () => ({
  __esModule: true,
  default: {
    JWT_SECRET: "test-jwt-secret-key",
  },
}));

describe("JWT Utilities", () => {
  describe("generateToken", () => {
    it("should generate a valid JWT token with correct payload", () => {
      const payload = { id: "123", role: "attendee" };
      const token = generateToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");

      // Decode without verification to check payload
      const decoded = jwt.decode(token) as any;
      expect(decoded.id).toBe(payload.id);
      expect(decoded.role).toBe(payload.role);
      expect(decoded.exp).toBeDefined();
    });

    it("should generate token with 1 hour expiration", () => {
      const payload = { id: "456" };
      const token = generateToken(payload);

      const decoded = jwt.decode(token) as any;
      const now = Math.floor(Date.now() / 1000);
      const expectedExpiry = now + 3600; // 1 hour in seconds

      // Allow 5 second tolerance for test execution time
      expect(decoded.exp).toBeGreaterThanOrEqual(expectedExpiry - 5);
      expect(decoded.exp).toBeLessThanOrEqual(expectedExpiry + 5);
    });

    it("should generate different tokens for different payloads", () => {
      const token1 = generateToken({ id: "1" });
      const token2 = generateToken({ id: "2" });

      expect(token1).not.toBe(token2);
    });
  });

  describe("verifyToken", () => {
    it("should verify and decode a valid token", () => {
      const payload = { id: "789", role: "organizer" };
      const token = generateToken(payload);

      const decoded = verifyToken(token);

      expect(decoded.id).toBe(payload.id);
      expect(decoded.role).toBe(payload.role);
    });

    it("should throw error for invalid token", () => {
      const invalidToken = "invalid.token.here";

      expect(() => verifyToken(invalidToken)).toThrow();
    });

    it("should throw error for token with wrong signature", () => {
      const payload = { id: "999" };
      const wrongSecretToken = jwt.sign(payload, "wrong-secret", {
        expiresIn: "1h",
      });

      expect(() => verifyToken(wrongSecretToken)).toThrow();
    });

    it("should throw error for expired token", () => {
      const payload = { id: "111" };
      const expiredToken = jwt.sign(payload, APP_CONFIG.JWT_SECRET as string, {
        expiresIn: "-1h", // Already expired
      });

      expect(() => verifyToken(expiredToken)).toThrow();
    });

    it("should throw error for malformed token", () => {
      const malformedTokens = [
        "",
        "not-a-token",
        "only.two",
        "too.many.parts.here.invalid",
      ];

      malformedTokens.forEach((token) => {
        expect(() => verifyToken(token)).toThrow();
      });
    });
  });

  describe("Token lifecycle", () => {
    it("should generate and verify token successfully", () => {
      const originalPayload = {
        id: "user123",
        role: "attendee",
        email: "test@example.com",
      };

      // Generate token
      const token = generateToken(originalPayload);

      // Verify token
      const decodedPayload = verifyToken(token);

      // Check all payload properties are preserved
      expect(decodedPayload.id).toBe(originalPayload.id);
      expect(decodedPayload.role).toBe(originalPayload.role);
      expect(decodedPayload.email).toBe(originalPayload.email);
    });
  });
});
