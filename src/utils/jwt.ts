import jwt from "jsonwebtoken";
import APP_CONFIG from "../config";

/**
 * Generates a JWT for a user.
 * @param payload - The data to include in the token (e.g., user ID and role).
 * @returns The signed JWT string.
 */
export const generateToken = (payload: object): string => {
  return jwt.sign(payload, APP_CONFIG.JWT_SECRET as string, {
    expiresIn: "1h", // Token expires in 1 hour
  });
};

/**
 * Verifies a JWT.
 * @param token - The token string to verify.
 * @returns The decoded payload if valid.
 * @throws Error if the token is invalid or expired.
 */
export const verifyToken = (token: string): any => {
  return jwt.verify(token, APP_CONFIG.JWT_SECRET as string);
};
