/**
 * scan.routes.js
 * Defines all REST API endpoints for the scan feature.
 *
 * Route structure (assuming mounted under /api/scan):
 *   POST   /               → Start a new scan
 *   GET    /list           → List all scans (dashboard)
 *   GET    /:id/status     → Poll scan progress
 *   GET    /:id/summary    → Grouped vulnerability summary (results table)
 *   GET    /:id/alerts     → Instance detail for a specific vulnerability
 *   POST   /:id/alerts/:alertId/ai-insights → Generate AI analysis for one instance
 */

import { Router } from 'express';
import {
  startScan,
  getScans,
  getScanStatus,
  getScanSummary,
  getAlertsByName,
  deleteScan,
  generateAiInsights
} from '../controllers/scan.controller.js';
import { requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Start a new scan
// POST /api/scan/
router.post('/', startScan);

// List all scans — used by the dashboard page
// GET /api/scan/list
router.get('/list', getScans);

// Poll scan status and progress
// GET /api/scan/:id/status
router.get('/:id/status', getScanStatus);

// Get vulnerability summary grouped by name
// GET /api/scan/:id/summary
router.get('/:id/summary', getScanSummary);

// Get all instances of a specific vulnerability
// GET /api/scan/:id/alerts?name=...
router.get('/:id/alerts', getAlertsByName);

// Generate AI insights for a specific alert instance
// POST /api/scan/:id/alerts/:alertIndex/ai-insights
router.post('/:id/alerts/:alertIndex/ai-insights', generateAiInsights);

// Delete a scan (Admin Only)
// DELETE /api/scan/:id
router.delete('/:id', requireAdmin, deleteScan);

export default router;