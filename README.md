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

rxmedlingo/
├── .env.example # API key placeholders
├── package.json # npm workspaces + dev scripts
├── shared/ # Shared TypeScript contracts
│ └── src/types/api.ts
├── server/ # Express + TypeScript backend
│ └── src/
│ ├── config/env.ts # All API keys read here
│ ├── routes/
│ ├── controllers/
│ ├── services/ # OCR (Gemini), extraction, RxNorm, interactions, common-use
│ ├── middleware/
│ └── utils/
└── web/ # React + Vite + Tailwind frontend
└── src/
├── pages/
├── components/
└── hooks/ # includes browser-based Urdu text-to-speech


---

## API Keys

You need **one required** API key and one optional one:

1. **Google Gemini** — for reading prescription images (including handwriting) and generating short medicine-use descriptions. Free tier available.
2. **openFDA** (optional) — raises the interaction-lookup rate limit; the app works fine without it on the free unauthenticated quota.

Urdu text-to-speech runs entirely in the browser via the Web Speech API — **no API key required.**

### Files that need your API keys

| File | Purpose |
|------|---------|
| `rxmedlingo/.env.example` | Canonical placeholder file |
| `rxmedlingo/.env` | Your actual local configuration |

The consumers are:

- `server/src/services/ocr/ocrSpace.service.ts` — uses `GEMINI_API_KEY` for prescription OCR
- `server/src/services/ocr/commonUse.service.ts` — uses `GEMINI_API_KEY` to generate short medicine-use descriptions
- `server/src/services/interactions/openFdaProvider.ts` — optionally uses `OPENFDA_API_KEY`

### How to get the keys

- **Google Gemini:** get a free key at https://aistudio.google.com
- **openFDA (optional):** get a free key at https://open.fda.gov/apis/authentication/

---

## Environment Variables

All configuration lives in `rxmedlingo/.env`.

```env
GEMINI_API_KEY=your-key-here
OPENFDA_API_KEY=optional-key-here
PORT=5000
```

`OPENFDA_API_KEY` is optional. Without it you get the free unauthenticated quota (1,000 requests/day). With a free key the quota rises to 120,000/day.

---

## Running Locally

### Prerequisites

- Node.js 20+ (required for native `fetch`)
- npm 9+ (for workspaces)

### Install and run

```bash
cd rxmedlingo
npm install
cp .env.example .env
# Edit .env and add your Gemini API key.
npm run dev
```

This starts both the API server and the web frontend concurrently:

- API: http://localhost:5000
- Web: http://localhost:5173

The Vite dev server proxies `/api` requests to `:5000`, so no CORS setup is required.

### Run backend only

```bash
npm run dev:server
```

### Run frontend only

```bash
npm run dev:web
```

### Build for production

```bash
npm run build
```

### Run tests

```bash
npm test
```

---

## Testing the Full Flow

1. **Health check:** open http://localhost:5000/api/health — `ocrConfigured` should be `true`.
2. **Open the app:** http://localhost:5173 — first load shows a 3-slide onboarding overlay.
3. **Upload a test prescription** — either typed or handwritten. The app extracts medicine names and dosages, ignoring clinic headers, doctor names, and diagnostic notes.
4. **Expected behavior:**
   - Verified medicines show their generic name and a short plain-language description of what they're used for.
   - Medicines that can't be confidently matched against the drug database are labeled "could not be fully verified" rather than guessed.
   - Duplicate active ingredients across different brand names are flagged.
   - Drug interactions are shown with severity and a citation from an FDA drug label.
5. Tap **"Listen in Urdu"** to hear the full result read aloud (generated entirely in-browser, no network call).
6. **Error states:**
   - Upload a non-prescription photo to see the empty-state tips.
   - Leave `GEMINI_API_KEY` blank to see the "scanner not configured" message.

---

## Architecture

### Backend pipeline

image upload
→ Gemini vision OCR (extracts medicine lines only)
→ noise filter + drug extraction + dosage parsing
→ RxNorm normalization (confidence-gated) + Pakistani brand-name mapping + ingredient decomposition
→ interaction engine (openFDA evidence) + common-use lookup (parallel)
→ Urdu narrative
→ JSON response



### Key design decisions

- **No database:** everything is processed in real time. Image buffers are held in memory only.
- **Confidence-gated matching:** a drug-name match from RxNorm is only accepted above a strict confidence score. Weak matches are rejected rather than shown as fact, falling back to a curated Pakistani brand-to-generic mapping (covering common local brands such as Ciproxin, Risek, Panadol, Augmentin, and others).
- **Honest uncertainty:** when a medicine name still can't be confidently verified, the app says so explicitly instead of displaying a guess.
- **Ingredient-level checking:** RxNorm decomposes each product into ingredients, so combination products and duplicate brand names are detected correctly.
- **AI-generated context:** Gemini also provides a short, plain-language description of what each verified medicine is commonly used for.
- **Deferred, key-free TTS:** Urdu audio is generated on-device via the browser's Speech Synthesis API only when the user taps "Listen in Urdu" — no API call, no quota, no key.

---

## API Endpoints

### `GET /api/health`

Returns configuration status.

```json
{
  "status": "ok",
  "ocrConfigured": true,
  "ttsConfigured": true,
  "interactionProvider": "openfda"
}
```

### `POST /api/analyze`

Multipart upload. Send an `image` field.

Success response:

```json
{
  "requestId": "...",
  "drugs": [{ "matchedName": "...", "commonUse": "...", "confidence": "high", "...": "..." }],
  "interactions": [...],
  "duplicates": [...],
  "urduNarrative": "...",
  "warnings": [],
  "meta": { "ocrConfidence": 90, "stageTimingsMs": {...}, "interactionSourceDegraded": false }
}
```

Error response:

```json
{
  "error": {
    "code": "...",
    "stage": "ocr",
    "message": "...",
    "userMessage": "...",
    "userMessageUrdu": "...",
    "retryable": true
  }
}
```

---

## Notes & Assumptions

- Prescriptions may be handwritten or printed, in English or mixed Urdu/English — Gemini's vision model handles both far better than traditional OCR.
- Urdu audio is generated entirely client-side via the browser's built-in Speech Synthesis API — no external TTS service or API key is required.
- Drug-name verification combines RxNorm (a US database) with a curated Pakistani brand-name mapping layer. Coverage is not exhaustive; unmatched names are clearly flagged rather than guessed.
- Interaction data comes from openFDA drug labels, cited directly in the UI.
- This is informational, not medical advice. A disclaimer is shown on every results page.
- Accessibility: the app respects `prefers-reduced-motion`, uses high-contrast colors, large touch targets, and bilingual (English/Urdu) labels throughout.

---

## Troubleshooting

### `npm install` fails

Ensure you are using Node.js 20+:

```bash
node -v
```

### Server says "Gemini API key is required"

You forgot to create `.env` or the key is blank. Copy `.env.example` to `.env` and paste a valid Gemini API key from https://aistudio.google.com.

### Frontend cannot reach backend

The Vite dev server proxies `/api` to `http://localhost:5000`. Make sure the backend is running and no other service is using port 5000.

### Urdu audio does not play

- Some browsers block autoplay — the user must tap the "Listen in Urdu" button.
- Speech Synthesis voice availability varies by browser/OS; most modern browsers include at least one Urdu-compatible voice.

### OCR returns no text or misreads medicine names

- Use a well-lit, flat photo with the text filling most of the frame.
- Avoid glare, shadows, and skew.
- AI vision models are not 100% deterministic on very unclear handwriting — this is a known limitation, which is why unverified matches are flagged rather than silently trusted.
