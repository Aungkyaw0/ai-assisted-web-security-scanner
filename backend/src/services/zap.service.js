/**
 * zap.service.js
 * Handles all communication with the OWASP ZAP REST API.
 * ZAP runs inside a Docker container and exposes a JSON API.
 *
 * Environment variables used:
 *   ZAP_BASE_URL — Base URL of the ZAP daemon (e.g. http://localhost:8080)
 *   ZAP_API_KEY  — API key configured when starting the ZAP container
 *
 * ZAP requires a URL to be in its "Scan Tree" before an active scan can run.
 * The spider crawls the target first, populating the scan tree, then the
 * active scan tests each discovered page for vulnerabilities.
 */

import axios from 'axios';

const ZAP = process.env.ZAP_BASE_URL;
const API_KEY = process.env.ZAP_API_KEY;

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION — Quick vs Full Scan
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Configures the ZAP scan policy based on the requested scan type.
 */
export const setScanPolicy = async (scanType) => {
  try {
    if (scanType === 'quick') {
      console.log(`⚙️ [ZAP] Configuring QUICK scan policy...`);
      // Active Scanners
      await axios.get(`${ZAP}/JSON/ascan/action/disableAllScanners/`, { params: { apikey: API_KEY } });
      await axios.get(`${ZAP}/JSON/ascan/action/enableScanners/`, { params: { apikey: API_KEY, ids: '6,7,40012,40014,40018,90021,90020,90019' } });
      
      // Passive Scanners
      await axios.get(`${ZAP}/JSON/pscan/action/disableAllScanners/`, { params: { apikey: API_KEY } });
      await axios.get(`${ZAP}/JSON/pscan/action/enableScanners/`, { params: { apikey: API_KEY, ids: '10038,10098,10202' } });
      console.log(`✅ [ZAP] Quick scan policy applied.`);
    } else {
      console.log(`⚙️ [ZAP] Configuring FULL scan policy...`);
      // 1. Enable all default scanners first
      await axios.get(`${ZAP}/JSON/ascan/action/enableAllScanners/`, { params: { apikey: API_KEY } });
      await axios.get(`${ZAP}/JSON/pscan/action/enableAllScanners/`, { params: { apikey: API_KEY } });
      
      // 2. Set max rule duration to 3 minutes to improve performance
      try {
        await axios.get(`${ZAP}/JSON/ascan/action/setOptionMaxRuleDurationInMins/`, { params: { apikey: API_KEY, Integer: 3 } });
        console.log(`✅ [ZAP] Set Max Rule Duration to 3 minutes.`);
      } catch (e) {
        console.warn(`⚠️ [ZAP] Failed to set max rule duration: ${e.message}`);
      }

      // 3. Disable specific heavy/unwanted scanners gracefully
      const disableSafe = async (engine, ids) => {
        for (const id of ids.split(',')) {
          try {
            await axios.get(`${ZAP}/JSON/${engine}/action/disableScanners/`, { params: { apikey: API_KEY, ids: id } });
          } catch (e) {
            // Ignore DOES_NOT_EXIST if we guess the wrong engine (ascan vs pscan)
          }
        }
      };

      // Exclusions requested by user: 10104, 40026, 100043, 50000
      const excludedIds = '10104,40026,100043,50000';
      await disableSafe('ascan', excludedIds);
      await disableSafe('pscan', excludedIds);

      console.log(`✅ [ZAP] Full scan policy applied with exclusions: ${excludedIds}`);
    }
  } catch (err) {
    console.error(`❌ [ZAP] Failed to set scan policy: ${err.message}`);
    throw new Error(`ZAP policy configuration failed: ${err.message}`);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SPIDER — Crawls the target to discover pages and populate the scan tree
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Starts a spider (crawler) on the target URL.
 * The spider discovers all accessible pages and adds them to ZAP's scan tree.
 * This MUST run before an active scan, otherwise ZAP returns "URL Not Found".
 *
 * ZAP Endpoint: /JSON/spider/action/scan
 *
 * @param {string} url - The target URL to crawl
 * @returns {string} The ZAP spider scan ID used to poll progress
 * @throws {Error} If ZAP is unreachable or rejects the request
 */
export const startSpider = async (url) => {
  const endpoint = `${ZAP}/JSON/spider/action/scan/`;
  const params = { apikey: API_KEY, url, recurse: true };

  console.log(`🕷️ [ZAP] Starting spider — Target: ${url}`);
  console.log(`🕷️ [ZAP] Request: GET ${endpoint}`);

  try {
    const res = await axios.get(endpoint, { params });
    const spiderScanId = res.data.scan;

    console.log(`✅ [ZAP] Spider started — Spider ID: ${spiderScanId}`);
    return spiderScanId;
  } catch (err) {
    console.error(`❌ [ZAP] Failed to start spider`);
    console.error(`❌ [ZAP] Target URL: ${url}`);
    console.error(`❌ [ZAP] Endpoint: ${endpoint}`);
    console.error(`❌ [ZAP] Error: ${err.message}`);

    if (err.response) {
      console.error(`❌ [ZAP] Response Status: ${err.response.status}`);
      console.error(`❌ [ZAP] Response Body:`, JSON.stringify(err.response.data));
    }

    throw new Error(`ZAP spider failed: ${err.message}`);
  }
};

/**
 * Polls the progress of a running ZAP spider.
 * ZAP Endpoint: /JSON/spider/view/status
 *
 * @param {string} scanId - The ZAP spider scan ID
 * @returns {number} Progress percentage (0–100)
 * @throws {Error} If ZAP is unreachable or returns an invalid response
 */
export const getSpiderProgress = async (scanId) => {
  const endpoint = `${ZAP}/JSON/spider/view/status/`;
  const params = { apikey: API_KEY, scanId };

  try {
    const res = await axios.get(endpoint, { params });
    const progress = Number(res.data.status);

    return progress;
  } catch (err) {
    console.error(`❌ [ZAP] Failed to get spider progress`);
    console.error(`❌ [ZAP] Spider ID: ${scanId}`);
    console.error(`❌ [ZAP] Endpoint: ${endpoint}`);
    console.error(`❌ [ZAP] Error: ${err.message}`);

    if (err.response) {
      console.error(`❌ [ZAP] Response Status: ${err.response.status}`);
      console.error(`❌ [ZAP] Response Body:`, JSON.stringify(err.response.data));
    }

    throw new Error(`ZAP spider progress poll failed: ${err.message}`);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVE SCAN — Tests discovered pages for vulnerabilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Starts an active scan on the given target URL via ZAP.
 * The URL must already be in ZAP's scan tree (via spidering).
 * ZAP Endpoint: /JSON/ascan/action/scan
 *
 * @param {string} url - The target URL to scan
 * @returns {string} The ZAP-internal scan ID used to poll progress
 * @throws {Error} If ZAP is unreachable or rejects the request
 */
export const startActiveScan = async (url) => {
  const endpoint = `${ZAP}/JSON/ascan/action/scan/`;
  const params = { apikey: API_KEY, url, recurse: true };

  console.log(`🔍 [ZAP] Starting active scan — Target: ${url}`);
  console.log(`🔍 [ZAP] Request: GET ${endpoint}`);

  try {
    const res = await axios.get(endpoint, { params });
    const zapScanId = res.data.scan;

    console.log(`✅ [ZAP] Active scan started — ZAP Scan ID: ${zapScanId}`);
    return zapScanId;
  } catch (err) {
    console.error(`❌ [ZAP] Failed to start active scan`);
    console.error(`❌ [ZAP] Target URL: ${url}`);
    console.error(`❌ [ZAP] Endpoint: ${endpoint}`);
    console.error(`❌ [ZAP] Error: ${err.message}`);

    if (err.response) {
      console.error(`❌ [ZAP] Response Status: ${err.response.status}`);
      console.error(`❌ [ZAP] Response Body:`, JSON.stringify(err.response.data));
    }

    throw new Error(`ZAP active scan failed: ${err.message}`);
  }
};

/**
 * Polls the progress of a running ZAP active scan.
 * ZAP Endpoint: /JSON/ascan/view/status
 *
 * @param {string} scanId - The ZAP-internal scan ID
 * @returns {number} Progress percentage (0–100)
 * @throws {Error} If ZAP is unreachable or returns an invalid response
 */
export const getScanProgress = async (scanId, retries = 5) => {
  const endpoint = `${ZAP}/JSON/ascan/view/status/`;
  const params = { apikey: API_KEY, scanId };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await axios.get(endpoint, { params });
      return Number(res.data.status);
    } catch (err) {
      console.warn(`⚠️ [ZAP] Failed to get scan progress (Attempt ${attempt}/${retries}): ${err.message}`);
      if (attempt === retries) {
        console.error(`❌ [ZAP] Max retries reached for scan progress poll.`);
        throw new Error(`ZAP progress poll failed after ${retries} attempts: ${err.message}`);
      }
      // Wait 3 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ALERTS — Retrieve vulnerability findings
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retrieves all vulnerability alerts found by ZAP for the target URL.
 * ZAP Endpoint: /JSON/core/view/alerts
 *
 * @param {string} url - The target URL that was scanned
 * @returns {Array} Array of ZAP alert objects
 * @throws {Error} If ZAP is unreachable or returns an invalid response
 */
export const getScanAlerts = async (url) => {
  const endpoint = `${ZAP}/JSON/core/view/alerts/`;
  const params = { apikey: API_KEY, baseurl: url };

  console.log(`📥 [ZAP] Fetching alerts for: ${url}`);

  try {
    const res = await axios.get(endpoint, { params });
    const alerts = res.data.alerts;

    console.log(`✅ [ZAP] Retrieved ${alerts.length} alert(s) for: ${url}`);
    return alerts;
  } catch (err) {
    console.error(`❌ [ZAP] Failed to fetch alerts`);
    console.error(`❌ [ZAP] Target URL: ${url}`);
    console.error(`❌ [ZAP] Endpoint: ${endpoint}`);
    console.error(`❌ [ZAP] Error: ${err.message}`);

    if (err.response) {
      console.error(`❌ [ZAP] Response Status: ${err.response.status}`);
      console.error(`❌ [ZAP] Response Body:`, JSON.stringify(err.response.data));
    }

    throw new Error(`ZAP alert retrieval failed: ${err.message}`);
  }
};