import { authSchema, eventSchema } from "../../utils/validationSchema";

describe("Validation Schemas", () => {
  describe("authSchema", () => {
    const validAuthData = {
      name: "John Doe",
      username: "johndoe",
      email: "john@example.com",
      role: "attendee",
      password: "password123",
      verifyPassword: "password123",
    };

    it("should validate correct user registration data", async () => {
      const result = await authSchema.validateAsync(validAuthData);

      expect(result).toBeDefined();
      expect(result.name).toBe(validAuthData.name);
      expect(result.username).toBe(validAuthData.username);
      expect(result.email).toBe(validAuthData.email);
    });

    it("should require name field", async () => {
      const { name, ...dataWithoutName } = validAuthData;

      await expect(authSchema.validateAsync(dataWithoutName)).rejects.toThrow();
    });

    it("should require username field", async () => {
      const { username, ...dataWithoutUsername } = validAuthData;

      await expect(
        authSchema.validateAsync(dataWithoutUsername),
      ).rejects.toThrow();
    });

    it("should enforce minimum username length of 3 characters", async () => {
      const invalidData = { ...validAuthData, username: "ab" };

      await expect(authSchema.validateAsync(invalidData)).rejects.toThrow();
    });

    it("should enforce maximum username length of 30 characters", async () => {
      const invalidData = { ...validAuthData, username: "a".repeat(31) };

      await expect(authSchema.validateAsync(invalidData)).rejects.toThrow();
    });

    it("should validate email format", async () => {
      const invalidEmails = [
        "invalid",
        "test@",
        "@example.com",
        "test@example",
      ];

      for (const email of invalidEmails) {
        const invalidData = { ...validAuthData, email };
        await expect(authSchema.validateAsync(invalidData)).rejects.toThrow();
      }
    });

    it("should convert email to lowercase", async () => {
      const dataWithUppercaseEmail = {
        ...validAuthData,
        email: "JOHN@EXAMPLE.COM",
      };
      const result = await authSchema.validateAsync(dataWithUppercaseEmail);

      expect(result.email).toBe("john@example.com");
    });

    it("should require role field", async () => {
      const { role, ...dataWithoutRole } = validAuthData;

      await expect(authSchema.validateAsync(dataWithoutRole)).rejects.toThrow();
    });

    it("should require password field", async () => {
      const { password, ...dataWithoutPassword } = validAuthData;

      await expect(
        authSchema.validateAsync(dataWithoutPassword),
      ).rejects.toThrow();
    });

    it("should enforce minimum password length of 6 characters", async () => {
      const invalidData = {
        ...validAuthData,
        password: "12345",
        verifyPassword: "12345",
      };

      await expect(authSchema.validateAsync(invalidData)).rejects.toThrow();
    });

    it("should validate password confirmation matches", async () => {
      const invalidData = { ...validAuthData, verifyPassword: "different" };

      await expect(authSchema.validateAsync(invalidData)).rejects.toThrow();
    });

    it("should allow optional organizationName field", async () => {
      const dataWithOrg = { ...validAuthData, organizationName: "Test Org" };
      const result = await authSchema.validateAsync(dataWithOrg);

      expect(result.organizationName).toBe("Test Org");
    });

    it("should validate organizer registration with organization name", async () => {
      const organizerData = {
        ...validAuthData,
        role: "organizer",
        organizationName: "Event Organizers Inc",
      };

      const result = await authSchema.validateAsync(organizerData);
      expect(result.role).toBe("organizer");
      expect(result.organizationName).toBe("Event Organizers Inc");
    });
  });

  describe("eventSchema", () => {
    const validEventData = {
      title: "Tech Conference 2026",
      location: "San Francisco, CA",
      category: "Technology",
      description: "Annual tech conference featuring latest innovations",
      date: new Date("2026-06-15"),
      time: "09:00 AM",
      price: 99.99,
      capacity: 500,
      ticketsSold: 0,
      reminders: "1 day before",
    };

    it("should validate correct event data", async () => {
      const result = await eventSchema.validateAsync(validEventData);

      expect(result).toBeDefined();
      expect(result.title).toBe(validEventData.title);
      expect(result.location).toBe(validEventData.location);
      expect(result.category).toBe(validEventData.category);
    });

    it("should require title field", async () => {
      const { title, ...dataWithoutTitle } = validEventData;

      await expect(
        eventSchema.validateAsync(dataWithoutTitle),
      ).rejects.toThrow();
    });

    it("should require location field", async () => {
      const { location, ...dataWithoutLocation } = validEventData;

      await expect(
        eventSchema.validateAsync(dataWithoutLocation),
      ).rejects.toThrow();
    });

    it("should require category field", async () => {
      const { category, ...dataWithoutCategory } = validEventData;

      await expect(
        eventSchema.validateAsync(dataWithoutCategory),
      ).rejects.toThrow();
    });

    it("should require description field", async () => {
      const { description, ...dataWithoutDescription } = validEventData;

      await expect(
        eventSchema.validateAsync(dataWithoutDescription),
      ).rejects.toThrow();
    });

    it("should require date field", async () => {
      const { date, ...dataWithoutDate } = validEventData;

      await expect(
        eventSchema.validateAsync(dataWithoutDate),
      ).rejects.toThrow();
    });

    it("should require time field", async () => {
      const { time, ...dataWithoutTime } = validEventData;

      await expect(
        eventSchema.validateAsync(dataWithoutTime),
      ).rejects.toThrow();
    });

    it("should require price field", async () => {
      const { price, ...dataWithoutPrice } = validEventData;

      await expect(
        eventSchema.validateAsync(dataWithoutPrice),
      ).rejects.toThrow();
    });

    it("should enforce minimum price of 0", async () => {
      const invalidData = { ...validEventData, price: -10 };

      await expect(eventSchema.validateAsync(invalidData)).rejects.toThrow();
    });

    it("should allow free events with price 0", async () => {
      const freeEventData = { ...validEventData, price: 0 };
      const result = await eventSchema.validateAsync(freeEventData);

      expect(result.price).toBe(0);
    });

    it("should require capacity field", async () => {
      const { capacity, ...dataWithoutCapacity } = validEventData;

      await expect(
        eventSchema.validateAsync(dataWithoutCapacity),
      ).rejects.toThrow();
    });

    it("should enforce minimum capacity of 1", async () => {
      const invalidData = { ...validEventData, capacity: 0 };

      await expect(eventSchema.validateAsync(invalidData)).rejects.toThrow();
    });

    it("should require capacity to be an integer", async () => {
      const invalidData = { ...validEventData, capacity: 50.5 };

      await expect(eventSchema.validateAsync(invalidData)).rejects.toThrow();
    });

    it("should enforce minimum ticketsSold of 0 when provided", async () => {
      const invalidData = { ...validEventData, ticketsSold: -5 };

      await expect(eventSchema.validateAsync(invalidData)).rejects.toThrow();
    });

    it("should require ticketsSold to be an integer when provided", async () => {
      const invalidData = { ...validEventData, ticketsSold: 10.7 };

      await expect(eventSchema.validateAsync(invalidData)).rejects.toThrow();
    });

    it("should allow optional ticketsSold field", async () => {
      const { ticketsSold, ...dataWithoutTicketsSold } = validEventData;
      const result = await eventSchema.validateAsync(dataWithoutTicketsSold);

      expect(result).toBeDefined();
    });

    it("should require reminders field", async () => {
      const { reminders, ...dataWithoutReminders } = validEventData;

      await expect(
        eventSchema.validateAsync(dataWithoutReminders),
      ).rejects.toThrow();
    });

    it("should set default createdAt to current date", async () => {
      const result = await eventSchema.validateAsync(validEventData);

      expect(result.createdAt).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it("should validate event with all fields", async () => {
      const completeEventData = {
        ...validEventData,
        ticketsSold: 50,
        createdAt: new Date(),
      };

      const result = await eventSchema.validateAsync(completeEventData);
      expect(result.ticketsSold).toBe(50);
      expect(result.createdAt).toBeDefined();
    });
  });
});
