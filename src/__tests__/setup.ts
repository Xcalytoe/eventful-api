// Test setup file
// This file runs before all tests

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-key-for-testing-only";
process.env.MONGODB_URI = "mongodb://localhost:27017/eventful-test";
process.env.PORT = "5001";

// Increase timeout for async operations
jest.setTimeout(10000);

// Mock console methods to reduce noise in test output (optional)
global.console = {
  ...console,
  // Uncomment to suppress console logs during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  error: console.error, // Keep error logs visible
};
