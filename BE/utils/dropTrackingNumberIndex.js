import mongoose from "mongoose";
import connectDB from "../config/database.js";
import dotenv from "dotenv";

dotenv.config();

const dropTrackingNumberIndex = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log("Connected to MongoDB");

    // Get the collection
    const collection = mongoose.connection.db.collection("orders");

    // List all indexes
    const indexes = await collection.indexes();
    console.log("Current indexes:", indexes.map(idx => idx.name));

    // Drop the unique index on trackingNumber if it exists
    try {
      await collection.dropIndex("trackingNumber_1");
      console.log("✅ Successfully dropped trackingNumber_1 index");
    } catch (error) {
      if (error.code === 27 || error.codeName === "IndexNotFound") {
        console.log("ℹ️  Index trackingNumber_1 does not exist, skipping...");
      } else {
        console.error("Error dropping index:", error);
        throw error;
      }
    }

    // Verify indexes after dropping
    const indexesAfter = await collection.indexes();
    console.log("Indexes after dropping:", indexesAfter.map(idx => idx.name));

    console.log("✅ Done! You can now restart your server.");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

dropTrackingNumberIndex();

