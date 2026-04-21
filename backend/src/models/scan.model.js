/**
 * scan.model.js
 * Mongoose schema and model for scan documents.
 *
 * Each document represents one scan job and stores:
 *   - Target URL and scan metadata (status, progress, timestamps)
 *   - All raw ZAP alerts with full technical detail
 *
 * The `alerts` sub-array stores every individual ZAP finding.
 * Multiple alerts can share the same `name` (vulnerability type) but differ
 * in the URL/method/parameter where they were found — these are "instances".
 *
 * Frontend reads:
 *   - Summary view: group alerts by `name`, count instances, show risk
 *   - Instance view: filter alerts by `name`, show technical details
 */

import mongoose from 'mongoose';

/**
 * Schema for AI-generated analysis of a single vulnerability instance.
 * Stored alongside the alert so it only needs to be generated once.
 */
const aiAnalysisSchema = new mongoose.Schema({
  vulnerabilityOverview:          { type: String, default: '' },
  whyThisOccurs:                  { type: String, default: '' },
  riskAndConfidenceInterpretation:{ type: String, default: '' },
  affectedRequestContext:         { type: String, default: '' },
  potentialImpact:                { type: String, default: '' },
  developerFixGuidance:           { type: String, default: '' },
  studentLearningNotes:           { type: String, default: '' },
  generatedAt:                    { type: Date,   default: Date.now },
}, { _id: false });

/**
 * Schema for individual ZAP alert (vulnerability instance).
 * Maps directly to fields returned by ZAP's /JSON/core/view/alerts endpoint.
 */
const alertSchema = new mongoose.Schema({
  name:        { type: String, required: true },  // Vulnerability name (e.g. "Cross Site Scripting")
  risk:        { type: String, required: true },  // Risk level: High, Medium, Low, Informational
  confidence:  { type: String, default: '' },     // ZAP confidence: High, Medium, Low
  url:         { type: String, default: '' },     // URL where vuln was found
  method:      { type: String, default: '' },     // HTTP method (GET, POST, etc.)
  param:       { type: String, default: '' },     // Vulnerable parameter
  attack:      { type: String, default: '' },     // Attack payload used by ZAP
  evidence:    { type: String, default: '' },     // Evidence found in the response
  description: { type: String, default: '' },     // ZAP's description (stored for AI use later)
  solution:    { type: String, default: '' },     // ZAP's suggested solution (stored for AI use later)
  reference:   { type: String, default: '' },     // Reference links from ZAP
  otherInfo:   { type: String, default: '' },     // Additional info from ZAP
  cweid:       { type: String, default: '' },     // CWE ID
  wascid:      { type: String, default: '' },     // WASC ID
  aiAnalysis:  { type: aiAnalysisSchema, default: null },  // AI-generated insights (null = not yet generated)
});

/**
 * Schema for a scan job document.
 */
const scanSchema = new mongoose.Schema({
  targetUrl: {
    type: String,
    required: true
  },
  scanType: {
    type: String,
    enum: ['quick', 'full'],
    default: 'full'
  },
  status: {
    type: String,
    enum: ['PENDING', 'SPIDERING', 'SCANNING', 'COMPLETED', 'FAILED'],
    default: 'PENDING'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  error: {
    type: String,
    default: null
  },
  alerts: {
    type: [alertSchema],
    default: []
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true   // Adds `createdAt` and `updatedAt` automatically
});

const Scan = mongoose.model('Scan', scanSchema);

export default Scan;
