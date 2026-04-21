/**
 * app.js
 * Express application setup.
 * Mounts middleware and API routes.
 */

import express from 'express';
import cors from 'cors';
import scanRoutes from './routes/scan.routes.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

// Enable Cross-Origin Resource Sharing (CORS)
// Allows the frontend (e.g., localhost:3000) to call this API
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Mount scan API routes under /api/scan
app.use('/api/scan', scanRoutes);

// Mount auth API routes under /api/auth
app.use('/api/auth', authRoutes);

export default app;