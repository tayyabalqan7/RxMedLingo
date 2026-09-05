# RxMedLingo

AI-powered prescription scanner and drug interaction checker for Pakistani patients, with accessibility features for low-literacy, Urdu-speaking users.

**What it does:** take a photo of a prescription, extract the medicine names, check for dangerous interactions and duplicate ingredients, and explain the results in spoken Urdu.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Keys](#api-keys)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Testing the Full Flow](#testing-the-full-flow)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Notes & Assumptions](#notes--assumptions)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
cd rxmedlingo
npm install
cp .env.example .env
# Edit .env and paste your Gemini API key.
npm run dev
```

- Web app: http://localhost:5173
- API server: http://localhost:5000

---

## Project Structure
