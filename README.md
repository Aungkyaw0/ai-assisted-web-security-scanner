# AI-Assisted Web Application Security Scanner Installation Guideline

## Getting Started

### Prerequisites

- **Node.js** (v18+)
- **Docker** (for running OWASP ZAP)
- **MongoDB** (running locally on `mongodb://localhost:27017`)
- **Groq API Key** (for future AI integration)

### 1. Run OWASP ZAP (Docker)

```bash
docker run -u zap -p 8080:8080 -d --name zap-daemon ghcr.io/zaproxy/zaproxy:stable zap.sh \
  -daemon -port 8080 -host 0.0.0.0 \
  -config api.disablekey=false \
  -config api.key=changeme \
  -config api.addrs.addr(0).name=.* \
  -config api.addrs.addr(0).regex=true
```

### 2. Configure Environment Variables

Create or update `backend/.env`:

```env
PORT=5000
ZAP_BASE_URL=http://localhost:8080
ZAP_API_KEY=changeme
MONGO_URI=mongodb://localhost:27017/ai-vuln-scanner
GROQ_API_KEY=your_groq_api_key
```

### 3. Start the Backend

```bash
cd backend
npm install
npm run dev
```

The backend will start on `http://localhost:5000`.

### 4. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:3000`.

---

## Key Dependencies

### Backend

| Package    | Purpose                              |
| ---------- | ------------------------------------ |
| `express`  | Web server framework                 |
| `mongoose` | MongoDB object modeling              |
| `cors`     | Enable Cross-Origin Resource Sharing |
| `axios`    | HTTP client (ZAP REST API)           |
| `openai`   | Groq/Llama AI client (OpenAI SDK)    |
| `dotenv`   | Environment variable loading         |
| `nodemon`  | Auto-restart during development      |

### Frontend

| Package       | Purpose              |
| ------------- | -------------------- |
| `next`        | React meta-framework |
| `react`       | UI library           |
| `tailwindcss` | Utility-first CSS    |
| `typescript`  | Type safety          |

---

## Coding Standards

- **ES Modules** (`import`/`export`) throughout
- **`async`/`await`** for all asynchronous operations
- Meaningful variable and function names
- Clear **inline comments** for async workflows, ZAP interactions, and AI calls
- **Defensive error handling** at every service layer
- Structured **console logging** with emoji prefixes for easy visual scanning

---

## Development Philosophy

| Principle             | Description                                     |
| --------------------- | ----------------------------------------------- |
| Backend first         | API is built and tested before the frontend     |
| API driven            | Clean REST interface between frontend & backend |
| Academic defensible   | Easy to explain in a viva with clear decisions  |
| Simple before complex | Start minimal, add complexity as needed         |
| Real over mock        | Real ZAP scans and real AI — no fake demos      |

---

## License

ISC
