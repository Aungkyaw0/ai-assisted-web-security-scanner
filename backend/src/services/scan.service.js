/**
 * scan.service.js
 * Orchestrates the full scan pipeline from start to finish.
 *
 * Pipeline flow (NO AI in this version — AI will be integrated later):
 *   PENDING → SPIDERING → SCANNING → COMPLETED
 *   Any error at any stage → FAILED
 *
 * The spider step crawls the target website to populate ZAP's scan tree.
 * The active scan then tests every discovered page for vulnerabilities.
 * All raw ZAP alerts are stored in MongoDB for the frontend to display.
 *
 * This function runs ASYNCHRONOUSLY — it is fire-and-forget from the controller.
 * The main request thread is never blocked; clients poll for status via the API.
 */

import {
  startSpider,
  getSpiderProgress,
  startActiveScan,
  getScanProgress,
  getScanAlerts,
  setScanPolicy
} from './zap.service.js';

import Scan from '../models/scan.model.js';
import { delay } from '../utils/delay.js';

/**
 * Runs the complete scan pipeline for a given target URL.
 * Steps:
 *   1. Spider (crawl) the target to populate ZAP's scan tree
 *   2. Start an active scan on ZAP
 *   3. Poll ZAP for active scan progress until 100%
 *   4. Fetch all vulnerability alerts from ZAP
 *   5. Store raw alerts in MongoDB
 *
 * @param {string} scanId - The MongoDB document _id for this scan
 * @param {string} targetUrl - The URL to scan
 */
export const runScanPipeline = async (scanId, targetUrl) => {
  try {
    // ── Step 1: Spider the target ───────────────────────────────────────
    const scan = await Scan.findById(scanId);
    if (!scan) throw new Error('Scan not found in DB');

    console.log(`🚀 [PIPELINE] Starting scan pipeline — ID: ${scanId}, Target: ${targetUrl}, Type: ${scan.scanType}`);
    await Scan.findByIdAndUpdate(scanId, { status: 'SPIDERING' });

    // Set ZAP Policy before starting any scans
    await setScanPolicy(scan.scanType);

    const spiderScanId = await startSpider(targetUrl);

    // Poll spider progress until it finishes crawling
    let spiderProgress = 0;
    while (spiderProgress < 100) {
      spiderProgress = await getSpiderProgress(spiderScanId);
      console.log(`🕷️ [PIPELINE] Scan ${scanId} spider progress: ${spiderProgress}%`);
      await delay(2000);
    }

    console.log(`✅ [PIPELINE] Scan ${scanId}: spider completed — scan tree populated`);

    // ── Step 2: Start ZAP active scan ───────────────────────────────────
    await Scan.findByIdAndUpdate(scanId, { status: 'SCANNING', progress: 0 });

    const zapScanId = await startActiveScan(targetUrl);

    // ── Step 3: Poll ZAP active scan progress until complete ────────────
    let progress = 0;
    while (progress < 100) {
      progress = await getScanProgress(zapScanId);
      await Scan.findByIdAndUpdate(scanId, { progress });
      console.log(`📊 [PIPELINE] Scan ${scanId} active scan progress: ${progress}%`);
      await delay(2000);
    }

    // ── Step 4: Fetch ZAP alerts ────────────────────────────────────────
    console.log(`📥 [PIPELINE] Scan ${scanId}: fetching alerts from ZAP`);
    const rawAlerts = await getScanAlerts(targetUrl);
    console.log(`📋 [PIPELINE] Scan ${scanId}: ${rawAlerts.length} raw alert(s) from ZAP`);

    // ── Step 5: Map ZAP fields and store in MongoDB ─────────────────────
    // Map ZAP's field names to our schema field names
    const alerts = rawAlerts.map((a) => ({
      name:        a.alert || a.name || '',
      risk:        a.risk || '',
      confidence:  a.confidence || '',
      url:         a.url || '',
      method:      a.method || '',
      param:       a.param || '',
      attack:      a.attack || '',
      evidence:    a.evidence || '',
      description: a.description || '',
      solution:    a.solution || '',
      reference:   a.reference || '',
      otherInfo:   a.other || '',
      cweid:       a.cweid || '',
      wascid:      a.wascid || ''
    }));

    await Scan.findByIdAndUpdate(scanId, {
      status: 'COMPLETED',
      alerts,
      completedAt: new Date()
    });

    console.log(`✅ [PIPELINE] Scan ${scanId} completed — ${alerts.length} finding(s) stored`);

  } catch (err) {
    console.error(`❌ [PIPELINE] Scan ${scanId} failed`);
    console.error(`❌ [PIPELINE] Target: ${targetUrl}`);
    console.error(`❌ [PIPELINE] Error: ${err.message}`);

    await Scan.findByIdAndUpdate(scanId, {
      status: 'FAILED',
      error: err.message
    });
  }
};