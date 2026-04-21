/**
 * db.js
 * MongoDB connection setup using Mongoose.
 *
 * Connects to the MongoDB instance specified by the MONGO_URI environment variable.
 * This module exports a single `connectDB` function that should be called
 * once during server startup (in server.js) before the Express app starts listening.
 *
 * Connection events are logged for visibility during development.
 */

import mongoose from 'mongoose';

/**
 * Establishes a connection to MongoDB.
 * Logs success or exits the process on failure (fail-fast approach).
 *
 * @throws {Error} Exits process with code 1 if connection fails
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ [DB] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error(`❌ [DB] MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;
