# ResumeIQ

A web application that analyzes resumes against job descriptions, calculates ATS compatibility scores, and highlights missing skills with actionable suggestions to improve your resume.

## Features

- **Resume Parsing**: Upload resumes in PDF or DOCX format.
- **ATS Match Score**: Evaluates compatibility based on skills, keywords, experience, projects, and formatting.
- **Skill Gap Detection**: Highlights matching, missing, and preferred skills for the target role.
- **Bullet Suggestions**: Recommends action verbs and metrics to strengthen experience bullets.
- **Resume Comparison**: Compare two versions of a resume against the same job description.
- **PDF Report Export**: Download an analysis summary as a PDF.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **Parsing & Tools**: pdf-parse, mammoth, pdfkit

## Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/VinayKrishna-7/ResumeIQ.git
cd ResumeIQ
```

### 2. Environment setup
```bash
cp .env.example server/.env
```
> *Note: An in-memory database starts automatically in development if no MongoDB connection string is provided.*

### 3. Install dependencies
```bash
# Install backend packages
cd server
npm install

# Install frontend packages
cd ../client
npm install
cd ..
```

### 4. Run development servers
Start the backend and frontend in separate terminal windows:

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd server && npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd client && npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

## Tests

Run the test suite:
```bash
cd server && npm test
```

## License

MIT © [Vinay Krishna](https://github.com/VinayKrishna-7)
