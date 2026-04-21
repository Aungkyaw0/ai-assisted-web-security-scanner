/**
 * server.js
 * Application entry point.
 *
 * 1. Loads environment variables (MUST be the first import)
 * 2. Connects to MongoDB
 * 3. Starts the Express HTTP server
 *
 * The dotenv/config import MUST remain the very first line — it populates
 * process.env before any other module reads from it.
 */

import 'dotenv/config';           // ← MUST be first — loads .env into process.env
import connectDB from './config/db.js';
import app from './app.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB first, then start the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 [SERVER] Running on http://localhost:${PORT}`);
  });
});