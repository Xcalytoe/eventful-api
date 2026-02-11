import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const MONGODB_URI = process.env.DB_URL;
    if (!MONGODB_URI) {
      throw new Error("DB_URL is not defined");
    }
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDb;
