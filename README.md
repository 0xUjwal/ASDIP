# AI Secure Data Intelligence Platform

An advanced security analysis platform that acts as an **AI Gateway**, **Data Scanner**, **Log Analyzer**, and **Risk Engine**. It ingests multi-source data (text, files, logs, SQL, chat), detects sensitive data and security risks, and generates AI-powered insights.

**Live Demo:** [https://asdip-theta.vercel.app](https://asdip-theta.vercel.app)

---

## Video Demo

Link to video demonstration:
[Watch the demo](https://youtu.be/hAm08lOlX64)

---

## Features

- **Multi-Input Support** — Text, PDF, DOCX, TXT, LOG, SQL, and chat input
- **Sensitive Data Detection** — Emails, phone numbers, API keys, passwords, tokens, credit cards, secrets
- **Log File Analysis** — Parses log files, counts log levels, detects brute-force attacks, suspicious IPs, debug leaks
- **Risk Engine** — Scores and classifies risks (None / Low / Medium / High / Critical)
- **Policy Engine** — Configurable actions: allow, mask, or block content based on risk
- **AI Insights** — Rule-based heuristic insights with optional OpenAI / Anthropic LLM integration
- **Log Visualization** — Frontend viewer with highlighted sensitive lines, risk markers, and line numbers
- **Drag & Drop Upload** — File upload with drag-and-drop support
- **History** — Session-based analysis history with one-click replay
- **Notifications** — Real-time alerts for high/critical risk detections
- **Settings** — Configurable AI provider, API keys, analysis defaults
- **Observability** — Structured JSON logging via structlog

---

## Architecture

```
Input (Text / File / SQL / Log / Chat)
       |
   Validation
       |
 Extraction (Parser)
       |
  Detection Engine
    |-- Regex Scanner
    |-- AI Insights Engine
    |-- Log Analyzer
       |
   Risk Engine
       |
  Policy Engine
       |
    Response
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11+, FastAPI, Pydantic |
| Frontend | React 18, Vite, Tailwind CSS |
| AI | Rule-based engine + optional OpenAI / Anthropic API |
| Logging | structlog (JSON) |
| File Parsing | PyPDF2, python-docx |
| Deployment | Vercel (serverless) |

---

## Project Structure

```
AISDEP/
├── api/
│   └── index.py                 # Vercel serverless entry point
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── models/
│   │   │   └── schemas.py       # Pydantic request/response models
│   │   ├── routers/
│   │   │   └── analyze.py       # API endpoints
│   │   ├── services/
│   │   │   ├── scanner.py       # Sensitive data scanner
│   │   │   ├── log_analyzer.py  # Log file analyzer
│   │   │   ├── risk_engine.py   # Risk scoring engine
│   │   │   ├── policy_engine.py # Policy decisions & masking
│   │   │   ├── ai_insights.py   # AI insight generation
│   │   │   └── file_parser.py   # Multi-format file parser
│   │   └── utils/
│   │       └── patterns.py      # Regex detection patterns
│   ├── tests/
│   │   ├── test_scanner.py
│   │   ├── test_log_analyzer.py
│   │   └── test_risk_engine.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main application
│   │   ├── main.jsx             # Entry point
│   │   ├── index.css            # Tailwind styles
│   │   ├── components/
│   │   │   ├── Header.jsx       # App header with status
│   │   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   │   ├── InputPanel.jsx   # Multi-tab input interface
│   │   │   ├── ResultsPanel.jsx # Findings, insights, risk display
│   │   │   ├── LogViewer.jsx    # Log visualization with risk markers
│   │   │   ├── HistoryPanel.jsx # Analysis history
│   │   │   ├── SettingsPanel.jsx# Configuration panel
│   │   │   ├── HelpPanel.jsx    # Usage guide
│   │   │   └── NotificationsPanel.jsx # Alert notifications
│   │   └── services/
│   │       └── api.js           # API client
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── vercel.json                  # Vercel deployment config
├── requirements.txt             # Root deps for Vercel serverless
├── .gitignore
└── README.md
```

---

## Local Development

### Prerequisites

- Python 3.11+
- Node.js 18+

### 1. Clone & install

```bash
git clone <your-repo-url>
cd AISDEP
```

### 2. Backend

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
python -m uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

### 4. Run Tests

```bash
cd backend
python tests/test_scanner.py
python tests/test_log_analyzer.py
python tests/test_risk_engine.py
```

---
## API Reference

### `POST /api/analyze`

Analyze text content.

```json
{
  "input_type": "text | file | sql | chat | log",
  "content": "...",
  "options": {
    "mask": true,
    "block_high_risk": true,
    "log_analysis": true
  }
}
```

### `POST /api/analyze/file`

Upload and analyze a file (multipart form data).

| Field | Type | Description |
|-------|------|-------------|
| `file` | File | .pdf, .docx, .txt, .log (max 10 MB) |
| `mask` | bool | Mask sensitive data |
| `block_high_risk` | bool | Block high-risk content |
| `log_analysis` | bool | Enable log analysis |

### `GET /api/health`

Health check endpoint.

---

## Risk Classification

| Pattern | Risk Level |
|---------|-----------|
| Password in content | Critical |
| Secret / Private key | Critical |
| Credit card number | Critical |
| API key exposed | High |
| Auth token exposed | High |
| SQL injection pattern | High |
| Brute-force attempts | High |
| Stack trace / Error leak | Medium |
| Debug mode enabled | Medium |
| Email address | Low |
| Phone number | Low |

---

## License

Developed for hackathon purposes.
