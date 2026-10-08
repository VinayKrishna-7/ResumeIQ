<div align="center">

# ✨ ResumeIQ

**AI-Powered Resume Analyzer & ATS Optimization Platform**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-In--Memory%20Fallback-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-AI%20Advisory-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

<br />

ResumeIQ evaluates candidate resumes against target job descriptions using structured parsing, canonical skill normalization, deterministic 6-dimension ATS scoring, and evidence-grounded AI recommendations.

[Features](#-key-features) • [Preview](#-preview) • [Scoring Rubric](#-deterministic-scoring-model) • [Getting Started](#-getting-started) • [Tech Stack](#-tech-stack)

</div>

---

## 📸 Preview

<div align="center">

| Workspace Dashboard | ATS Evaluation Report |
| :---: | :---: |
| ![Dashboard](screenshots/dashboard.png) | ![Analysis Report](screenshots/analysis-report.png) |

</div>

---

## ⚡ Key Features

- **Multi-Format Extraction**: Parses PDF and DOCX files in-memory using multi-strategy text extraction with automatic fallback for corrupted XRefs.
- **Structured Resume Normalizer**: Automatically groups experience, education, skills, contact links, and projects into structured JSON.
- **Canonical Skill Taxonomy**: Maps 200+ industry skill variants to canonical standards (`React.js` → `React`, `K8s` → `Kubernetes`) with regex word-boundary isolation against false positives.
- **Deterministic ATS Scoring**: Rule-based, reproducible 0–100 matching engine across 6 calibrated dimensions.
- **Evidence-Grounded AI Guidance**: Google Gemini delivers qualitative feedback and bullet rewrites using Google's X-Y-Z framework (`Accomplished [X] measured by [Y] by doing [Z]`) with local heuristic fallbacks when offline.
- **Resume Library & Comparison**: Compare different resume iterations side-by-side against the same target role.
- **Server-Rendered PDF Export**: Generates clean, downloadable PDF audit reports.
- **Zero-Setup Local Dev**: In-memory MongoDB starts automatically when no external database connection string is provided.

---

## 🎯 Deterministic Scoring Model

Numerical match scores are calculated strictly via backend algorithms to ensure 100% reproducibility:

| Dimension | Weight | Criteria Measured |
| :--- | :---: | :--- |
| **Skills Match** | **30%** | Compares required skills (75% weight) and preferred skills (25% weight). |
| **Keyword Match** | **20%** | Measures technical domain term density and vocabulary alignment. |
| **Experience Match** | **20%** | Evaluates years of experience against seniority requirements and action verbs. |
| **Project Match** | **15%** | Analyzes alignment of candidate projects with target tech stacks. |
| **Resume Quality** | **10%** | Audits document craftsmanship, quantifiable outcomes, and structure. |
| **Education Match** | **5%** | Evaluates degree level and field of study relevance. |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### 1. Clone & Configure
```bash
git clone https://github.com/VinayKrishna-7/ResumeIQ.git
cd ResumeIQ
cp .env.example server/.env
```

> **Note**: An in-memory database starts automatically in development. An external `MONGODB_URI` and `GEMINI_API_KEY` are optional.

### 2. Install Dependencies
```bash
# Server dependencies
cd server && npm install

# Client dependencies
cd ../client && npm install
cd ..
```

### 3. Run Application
Start backend and frontend in separate terminals:

```bash
# Terminal 1 - Backend API (http://localhost:5000)
cd server && npm run dev

# Terminal 2 - Frontend Client (http://localhost:5173)
cd client && npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🧪 Testing

Execute the automated test suite covering unit normalizers, collision guards, scoring rubrics, and end-to-end integration:

```bash
cd server
npm test
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 6, Tailwind CSS 3, Recharts, Lucide Icons
- **Backend**: Node.js, Express 4, Mongoose 8, JWT, Helmet, CORS
- **Document Parsing**: `unpdf`, `pdf-parse`, `pdf2json`, `mammoth`
- **AI Advisory**: Google Gemini (`@google/generative-ai`) with heuristic fallback engines
- **Reporting**: PDFKit

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
