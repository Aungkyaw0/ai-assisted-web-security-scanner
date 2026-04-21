# AI-Assisted Web Application Security Scanner

A full-stack web security scanner that combines **OWASP ZAP** for automated vulnerability detection with **AI-powered explanations** (Groq / Llama 3.1) to make scan results understandable for everyone. Built as a **Final Year Project**.

## Purpose

The system scans a user-provided web application URL, detects security vulnerabilities using OWASP ZAP, and then uses AI to:

- **Explain** vulnerabilities in plain English
- **Suggest** generic remediation steps
- **Help prioritise** which vulnerabilities to fix first

### Target Audience

- Students and beginners learning about web security
- Developers with limited security expertise

> This is an **educational, explainable, and technically correct** tool — not an enterprise-grade security product.

---

## Architecture Overview

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│   Frontend   │──────▶│   Backend API    │──────▶│  OWASP ZAP   │
│  (Next.js)   │◀──────│  (Express.js)    │◀──────│  (Docker)    │
└──────────────┘       │                  │       └──────────────┘
                       │  Scan Pipeline:  │              │
                       │  1. Spider/Crawl │       ┌──────▼───────┐
                       │  2. Active Scan  │──────▶│   MongoDB    │
                       │  3. Get Alerts   │◀──────│ (Persistence)│
                       │  4. Store Data   │       └──────────────┘
                       └──────────────────┘
```

## Tech Stack

| Layer    | Technology                                       |
| -------- | ------------------------------------------------ |
| Frontend | Next.js 16, React 19, Tailwind CSS 4, TypeScript |
| Backend  | Node.js, Express 5, ES Modules                   |
| Scanner  | OWASP ZAP (via Docker + REST API)                |
| AI       | Groq API (`llama-3.1-8b-instant` via OpenAI SDK) |
| Storage  | MongoDB (via Mongoose)                           |

---

## System Workflow

```
User submits URL
      │
      ▼
 ┌─────────┐
 │ PENDING  │  Scan job created in MongoDB
 └────┬─────┘
      ▼
 ┌───────────┐
 │ SPIDERING │  ZAP spider crawls target (populates scan tree)
 └────┬──────┘
      ▼
 ┌──────────┐
 │ SCANNING │  ZAP active scan running (polled every 2s)
 └────┬─────┘
      ▼
 ┌───────────┐
 │ COMPLETED │  Raw ZAP results stored in MongoDB
 └───────────┘

 Any error at any stage → FAILED (with error details logged & stored)
```

> ⚠️ The scan pipeline runs **asynchronously** — the main request thread is never blocked.

---

## Backend Structure

```
backend/
├── .env                          # Environment variables
├── package.json
└── src/
    ├── server.js                 # Entry point – loads env, starts Express
    ├── app.js                    # Express app setup, mounts routes
    ├── routes/
    │   └── scan.routes.js        # REST endpoint definitions
    ├── controllers/
    │   └── scan.controller.js    # Request validation & response handling
    ├── models/
    │   └── scan.model.js         # Mongoose schema for scan data
    ├── services/
    │   ├── scan.service.js       # Scan pipeline orchestrator
    │   ├── zap.service.js        # OWASP ZAP REST API integration
    │   └── ai.service.js         # AI service (Disabled for now)
    ├── config/
    │   └── db.js                 # MongoDB connection config
    └── utils/
        └── delay.js              # Promise-based delay helper
```

**Each layer has a single responsibility:**

| Layer       | Responsibility                               |
| ----------- | -------------------------------------------- |
| Routes      | API endpoint definitions only                |
| Controllers | Request/response handling & input validation |
| Services    | Business logic & external service calls      |
| Store       | Scan job state management                    |
| Utils       | Small, reusable helper functions             |

---

## API Endpoints

All routes are mounted under `/api/scan`.

### `POST /api/scan/`

Start a new security scan.

- **Request Body:** `{ "url": "<target-url>" }`
- **Response (202):** `{ "scanId": "<mongodb-id>" }`

### `GET /api/scan/list`

List all scans for the dashboard.

- **Response (200):** Array of scan metadata objects.

### `GET /api/scan/:id/status`

Poll the current scan status.

- **Response (200):**
  ```json
  {
    "status": "PENDING | SPIDERING | SCANNING | COMPLETED | FAILED",
    "progress": 0-100
  }
  ```

### `GET /api/scan/:id/summary`

Retrieve grouped vulnerability summary (ZAP HTML report style).

- **Response (200):**
  ```json
  {
    "summary": [
      { "name": "Cross Site Scripting", "risk": "High", "instances": 5 }
    ]
  }
  ```

### `GET /api/scan/:id/alerts?name=...`

Retrieve technical details for all instances of a specific vulnerability.

- **Query Param:** `name` (e.g. `Cross Site Scripting`)
- **Response (200):** Array of technical alert instances.

---

## AI Usage Philosophy

The AI component is **assistive, not authoritative**:

- It does **not** invent vulnerabilities — it only explains what ZAP found
- It does **not** override ZAP findings
- Output is designed to be **short, clear, and non-technical** where possible
- If the AI service fails, a fallback message is returned — the scan still completes with ZAP data

---

## Error Handling & Logging

Every failure in the system:

- Updates scan status to `FAILED`
- Stores error details in the scan object
- Logs: error message, request URL/parameters, and ZAP/AI response body (when available)

**The system never silently fails.** All state transitions, ZAP API interactions, and AI calls are logged to the console.

---
