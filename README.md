# LinkedIn Profile Optimizer

A client-side React app that parses a LinkedIn profile PDF, lets you clean up the extracted profile data, and generates an ATS-friendly LaTeX resume plus a job-tailoring prompt.

- Portfolio: https://www.jared-makes-stuff.com/
- Repository: https://github.com/jared-makes-stuff/Resume-Optimizer-Free-

## Features

- Local LinkedIn PDF parsing in the browser with PDF.js.
- Editable profile sections for basic info, experience, education, projects, organizations, skills, and raw JSON.
- LaTeX resume generation with escaped user content for safer compilation.
- Job description matcher that creates a copyable LLM prompt without sending data to a backend.
- Rose theme using `#F9F5F6`, `#F8E8EE`, `#FDCEDF`, and `#F2BED1` with Work Sans.

## Privacy Model

This project is a static frontend. Uploaded PDFs are parsed locally in the browser, profile data is stored in `localStorage`, and no backend API is required for the main workflow.

Because resumes contain personal data, avoid pasting real profile data into issue reports or screenshots unless you intentionally redact it first.

## Setup

Requirements:

- Node.js 20.19+ or 22.12+ for Vite 7.
- npm.

Install and run:

```bash
cd frontend
npm install
npm run dev
```

The dev server usually starts at `http://localhost:5173`.

## Environment

The app does not require secrets. Use `.env.example` as the reference for optional public Vite values:

```bash
VITE_APP_NAME=Resume Optimizer
VITE_APP_VERSION=1.0.0
```

Do not commit `.env` files. They are ignored by Git.

## Checks

Run these before shipping changes:

```bash
cd frontend
npm run lint
npm run build
npm audit
```

There is currently no automated test suite configured.

## Project Structure

- `frontend/src/pages/` - top-level page views.
- `frontend/src/components/` - reusable UI and workflow components.
- `frontend/src/services/` - local storage and PDF parsing services.
- `frontend/src/lib/` - resume generation and shared utilities.
- `frontend/public/` - static assets copied into the production build.
