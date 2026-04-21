/**
 * scan.controller.js
 * Handles HTTP request/response logic for all scan-related endpoints.
 *
 * Endpoints:
 *   POST   /api/scan              → Start a new scan
 *   GET    /api/scans             → List all scans (dashboard)
 *   GET    /api/scan/:id/status   → Poll scan progress
 *   GET    /api/scan/:id/summary  → Grouped vulnerability summary
 *   GET    /api/scan/:id/alerts   → Instance detail for a specific vulnerability
 *   POST   /api/scan/:id/alerts/:alertId/ai-insights → Generate AI analysis for one instance
 *
 * This layer only handles request validation and response formatting.
 * All business logic lives in the service layer.
 */

import Scan from '../models/scan.model.js';
import { runScanPipeline } from '../services/scan.service.js';
import { generateInstanceInsights } from '../services/ai.service.js';

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/scan — Start a new scan
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a new scan job in MongoDB and kicks off the async pipeline.
 * Returns immediately with the scan ID — the client polls for progress.
 */
export const startScan = async (req, res) => {
  const { url, scanType = 'full' } = req.body;

  // ── Input validation ──────────────────────────────────────────────────
  if (!url) {
    console.warn(`⚠️ [CTRL] Scan request rejected — missing URL`);
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    new URL(url);  // Throws if invalid
  } catch {
    console.warn(`⚠️ [CTRL] Scan request rejected — invalid URL: ${url}`);
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  console.log(`📝 [CTRL] New scan request — Target: ${url}`);

  // ── Create scan document in MongoDB ───────────────────────────────────
  const scan = await Scan.create({ targetUrl: url, scanType });

  // Fire-and-forget — pipeline runs in the background
  runScanPipeline(scan._id.toString(), url);

  // Return scan ID immediately (202 Accepted)
  return res.status(202).json({ scanId: scan._id });
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/scans — List all scans (for dashboard)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns all scan jobs sorted by creation date (newest first).
 * Only returns metadata, not the full alerts array.
 */
export const getScans = async (req, res) => {
  const scans = await Scan.find()
    .select('targetUrl status progress error createdAt completedAt scanType')
    .sort({ createdAt: -1 });

  return res.json(scans);
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/scan/:id/status — Poll scan progress
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the current status and progress of a scan.
 */
export const getScanStatus = async (req, res) => {
  const scan = await Scan.findById(req.params.id)
    .select('status progress error');

  if (!scan) {
    return res.status(404).json({ error: 'Scan not found' });
  }

  return res.json({
    status: scan.status,
    progress: scan.progress,
    error: scan.error
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/scan/:id/summary — Grouped vulnerability summary
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns vulnerabilities grouped by name, with:
 *   - name: Vulnerability type (e.g. "Cross Site Scripting")
 *   - risk: Risk level (High, Medium, Low, Informational)
 *   - instances: Number of occurrences found
 *
 * This is the data for the main results table (like ZAP's HTML report).
 * Only available when scan status is COMPLETED.
 */
export const getScanSummary = async (req, res) => {
  const scan = await Scan.findById(req.params.id)
    .select('status targetUrl alerts createdAt completedAt');

  if (!scan) {
    return res.status(404).json({ error: 'Scan not found' });
  }

  if (scan.status !== 'COMPLETED') {
    return res.status(400).json({
      error: 'Scan not yet completed',
      currentStatus: scan.status
    });
  }

  // ── Group alerts by name ──────────────────────────────────────────────
  // Count how many instances exist for each vulnerability type.
  const grouped = {};
  for (const alert of scan.alerts) {
    if (!grouped[alert.name]) {
      grouped[alert.name] = {
        name: alert.name,
        risk: alert.risk,
        instances: 0
      };
    }
    grouped[alert.name].instances += 1;
  }

  // Convert to array and sort by risk severity (High → Medium → Low → Info)
  const riskOrder = { 'High': 0, 'Medium': 1, 'Low': 2, 'Informational': 3 };
  const summary = Object.values(grouped).sort((a, b) => {
    return (riskOrder[a.risk] ?? 4) - (riskOrder[b.risk] ?? 4);
  });

  return res.json({
    targetUrl: scan.targetUrl,
    totalAlerts: scan.alerts.length,
    uniqueVulnerabilities: summary.length,
    createdAt: scan.createdAt,
    completedAt: scan.completedAt,
    summary
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/scan/:id/alerts?name=... — Instance detail for a vulnerability
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns all instances of a specific vulnerability type.
 * Each instance includes: name, risk, url, method, param, attack, evidence, otherInfo.
 *
 * Query parameter:
 *   ?name=Cross%20Site%20Scripting  (URL-encoded vulnerability name)
 */
export const getAlertsByName = async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: 'Query parameter "name" is required' });
  }

  const scan = await Scan.findById(req.params.id);

  if (!scan) {
    return res.status(404).json({ error: 'Scan not found' });
  }

  if (scan.status !== 'COMPLETED') {
    return res.status(400).json({
      error: 'Scan not yet completed',
      currentStatus: scan.status
    });
  }

  // Filter alerts by the requested vulnerability name.
  // Track each alert's position in the full scan.alerts array so the
  // frontend can reference a specific instance for AI generation.
  const instances = [];
  for (let i = 0; i < scan.alerts.length; i++) {
    const a = scan.alerts[i];
    if (a.name === name) {
      instances.push({
        alertIndex: i,       // position in the full alerts array (stable across reads)
        name:       a.name,
        risk:       a.risk,
        url:        a.url,
        method:     a.method,
        param:      a.param,
        attack:     a.attack,
        evidence:   a.evidence,
        otherInfo:  a.otherInfo,
        aiAnalysis: a.aiAnalysis || null
      });
    }
  }

  if (instances.length === 0) {
    return res.status(404).json({ error: `No alerts found with name: "${name}"` });
  }

  return res.json({
    name,
    risk: instances[0].risk,
    totalInstances: instances.length,
    instances
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/scan/:id — Delete a scan result (Admin Only)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Deletes a scan job from MongoDB.
 */
export const deleteScan = async (req, res) => {
  try {
    const scan = await Scan.findByIdAndDelete(req.params.id);
    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }
    console.log(`🗑️ [CTRL] Scan deleted — ID: ${req.params.id}`);
    return res.json({ message: 'Scan deleted successfully' });
  } catch (err) {
    console.error(`❌ [CTRL] Error deleting scan: ${err.message}`);
    return res.status(500).json({ error: 'Failed to delete scan' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/scan/:id/alerts/:alertIndex/ai-insights — Generate AI analysis
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates AI-powered insights for a single vulnerability instance.
 *
 * Uses alertIndex (the alert's position in the scan.alerts array) rather
 * than _id, because old alert sub-documents were stored without _id fields.
 *
 * Flow:
 *   1. Find the scan and the specific alert by its array index
 *   2. If aiAnalysis already exists, return it (no re-generation)
 *   3. Send instance data to AI service (excluding description & solution)
 *   4. Save the AI analysis back into the alert sub-document
 *   5. Return the analysis to the client
 */
export const generateAiInsights = async (req, res) => {
  const { id, alertIndex } = req.params;
  const idx = parseInt(alertIndex, 10);

  try {
    // ── Find the scan ──────────────────────────────────────────────────
    const scan = await Scan.findById(id);

    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    // ── Find the specific alert instance by array index ────────────────
    if (isNaN(idx) || idx < 0 || idx >= scan.alerts.length) {
      return res.status(404).json({ error: 'Alert instance not found' });
    }
    const alert = scan.alerts[idx];

    // ── If already generated, return existing data ─────────────────────
    if (alert.aiAnalysis) {
      console.log(`ℹ️ [CTRL] AI insights already exist for alert index ${idx} — returning cached`);
      return res.json({ aiAnalysis: alert.aiAnalysis });
    }

    // ── Prepare input data (exclude description and solution) ──────────
    const instanceData = {
      name:       alert.name,
      risk:       alert.risk,
      confidence: alert.confidence,
      url:        alert.url,
      method:     alert.method,
      param:      alert.param,
      attack:     alert.attack,
      evidence:   alert.evidence,
      otherInfo:  alert.otherInfo,
      cweid:      alert.cweid,
      wascid:     alert.wascid
    };

    // ── Call the AI service ─────────────────────────────────────────────
    const aiResult = await generateInstanceInsights(instanceData);

    if (!aiResult) {
      return res.status(502).json({
        error: 'AI analysis generation failed. Please try again later.'
      });
    }

    // ── Save the analysis to MongoDB ───────────────────────────────────
    alert.aiAnalysis = aiResult;
    await scan.save();

    console.log(`💾 [CTRL] AI insights saved for alert index ${idx} in scan ${id}`);

    return res.json({ aiAnalysis: aiResult });

  } catch (err) {
    console.error(`❌ [CTRL] Error generating AI insights: ${err.message}`);
    return res.status(500).json({ error: 'Failed to generate AI insights' });
  }
};