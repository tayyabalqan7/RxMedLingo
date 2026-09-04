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
# Edit .env and paste your OCR.space and ResponsiveVoice API credentials.
npm run dev
```

- Web app: http://localhost:5173
- API server: http://localhost:5000

---

## Project Structure

```
rxmedlingo/
├── .env.example              # API key placeholders
├── package.json              # npm workspaces + dev scripts
├── shared/                   # Shared TypeScript contracts
│   └── src/types/api.ts
├── server/                   # Express + TypeScript backend
│   └── src/
│       ├── config/env.ts     # All API keys read here
│       ├── routes/
│       ├── controllers/
│       ├── services/         # OCR, extraction, RxNorm, interactions, TTS
│       ├── middleware/
│       └── utils/
└── web/                      # React + Vite + Tailwind frontend
    └── src/
        ├── pages/
        ├── components/
        └── hooks/
```

---

## API Keys

You need API credentials for two services:

1. **OCR.space** — for extracting text from prescription images (free tier available).
2. **ResponsiveVoice** — for generating Urdu audio. The app asks for an API key and an optional API secret; some signups only provide a single key.

### Files that need your API keys

| File | Purpose | Lines to edit |
|------|---------|---------------|
| `rxmedlingo/.env.example` | Canonical placeholder file | L5, L10, L11 |
| `rxmedlingo/.env` | Your actual local configuration | L5, L10, L11 |

Only `server/src/config/env.ts` reads these values. The consumers are:

- `server/src/services/ocr/ocrSpace.service.ts` — uses `OCR_SPACE_API_KEY`
- `server/src/services/tts/responsiveVoice.service.ts` — uses `RESPONSIVEVOICE_API_KEY` and optionally `RESPONSIVEVOICE_API_SECRET`
- `server/src/services/interactions/openFdaProvider.ts` — optionally uses `OPENFDA_API_KEY`

### How to get the keys

- **OCR.space:** sign up for a free key at https://ocr.space/ocrapi/freekey
- **ResponsiveVoice:** get your key (and secret, if provided) at https://responsivevoice.org/api/

---

## Environment Variables

All configuration lives in `rxmedlingo/.env`.

```env
OCR_SPACE_API_KEY=your-key-here
RESPONSIVEVOICE_API_KEY=your-key-here
RESPONSIVEVOICE_API_SECRET=your-secret-here
RESPONSIVEVOICE_URDU_VOICE=Urdu Female
OPENFDA_API_KEY=optional-key-here
PORT=5000
```

`OPENFDA_API_KEY` is optional. Without it you get the free unauthenticated quota (1,000 requests/day). With a free key the quota rises to 120,000/day.

`RESPONSIVEVOICE_URDU_VOICE` defaults to `Urdu Female`. You can list available Urdu voices by calling:

```bash
curl https://texttospeech.responsivevoice.org/v2/voices/language/ur \
  -H "X-API-Key: $RESPONSIVEVOICE_API_KEY" \
  -H "X-API-Secret: $RESPONSIVEVOICE_API_SECRET"
```

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
# Edit .env and add your OCR.space and ResponsiveVoice credentials.
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

1. **Health check:** open http://localhost:5000/api/health
   - `ocrConfigured` and `ttsConfigured` should be `true`.
2. **Open the app:** http://localhost:5173
   - First load shows a 3-slide onboarding overlay.
3. **Upload a test prescription.** You can use a typed image with lines like:
   ```
   Tab Panadol 500mg twice daily
   Tab Calpol 500mg twice daily
   Tab Warfarin 5mg once daily
   Tab Brufen 400mg twice daily
   ```
4. **Expected results:**
   - Panadol and Calpol are flagged as a **RED** duplicate (both contain acetaminophen).
   - Warfarin + Brufen (ibuprofen) are flagged as a **RED** interaction.
5. **Tap "Listen in Urdu"** to generate and play the Urdu audio summary.
6. **Error states:**
   - Upload a non-prescription photo to see the empty-state tips.
   - Leave `OCR_SPACE_API_KEY` blank to see the "scanner not configured" message.

---

## Architecture

### Backend pipeline

```
image upload
  → OCR.space OCR
  → noise filter + drug extraction + dosage parsing
  → RxNorm normalization + ingredient decomposition
  → interaction engine (curated rules + openFDA evidence)
  → Urdu narrative
  → JSON response
```

### Key design decisions

- **No database:** everything is processed in real-time. Image buffers are held in memory only.
- **Ingredient-level checking:** RxNorm decomposes each product into ingredients, so combination products and duplicate brand names are detected correctly.
- **Curated rules as primary severity source:** the RxNav drug-interaction API was discontinued in 2024, so this app uses a curated rule table plus openFDA label prose as supporting evidence.
- **Deferred TTS:** audio is generated only when the user taps "Listen in Urdu", saving quota.
- **Urdu voice:** ResponsiveVoice is used for Urdu text-to-speech.

---

## API Endpoints

### `GET /api/health`

Returns configuration status.

```json
{
  "status": "ok",
  "ocrConfigured": true,
  "ttsConfigured": true,
  "interactionProvider": "openfda+curated"
}
```

### `POST /api/analyze`

Multipart upload. Send an `image` field.

Success response:

```json
{
  "requestId": "...",
  "drugs": [...],
  "interactions": [...],
  "duplicates": [...],
  "urduNarrative": "...",
  "warnings": [],
  "meta": { "ocrConfidence": 95, "stageTimingsMs": {...}, "interactionSourceDegraded": false }
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

### `POST /api/speech`

```json
{ "text": "...", "languageCode": "ur" }
```

Response:

```json
{
  "audioContent": "base64-mp3-string",
  "languageCode": "ur",
  "voiceName": "Urdu Female"
}
```

---

## Notes & Assumptions

- **Prescriptions are assumed to use Latin/English drug names.** Pakistani prescriptions are typically written in English, and OCR.space handles English OCR well. Urdu is used for output (TTS and UI labels), not input parsing.
- **ResponsiveVoice is used for Urdu TTS.** You need both an API key and an API secret.
- **Interaction data is a combination of curated rules and openFDA labels.** This covers common clinically significant pairs. It is not exhaustive like a commercial drug database.
- **This is informational, not medical advice.** A disclaimer is shown on every results page.
- **Accessibility:** the app respects `prefers-reduced-motion`, uses high-contrast colors, large touch targets, and bilingual labels.

---

## Troubleshooting

### `npm install` fails

Ensure you are using Node.js 20+:

```bash
node -v
```

### Server says "OCR_SPACE_API_KEY is required"

You forgot to create `.env` or the key is blank. Copy `.env.example` to `.env` and paste a valid OCR.space key.

### Frontend cannot reach backend

The Vite dev server proxies `/api` to `http://localhost:5000`. Make sure the backend is running and no other service is using port 5000.

### Urdu audio does not play

- Check that `RESPONSIVEVOICE_API_KEY` is set. If your signup gave you an API secret, add it too.
- Some browsers block autoplay. The user must tap the "Listen in Urdu" button.
- Verify your ResponsiveVoice account has access to the chosen voice (`RESPONSIVEVOICE_URDU_VOICE`).
- ResponsiveVoice v2 officially requires both key and secret. If audio fails with just the key, look for the secret in your ResponsiveVoice dashboard or email.
- If the ResponsiveVoice v2 endpoint returns JSON instead of raw audio, adjust `server/src/services/tts/responsiveVoice.service.ts` to parse the response accordingly.

### OCR returns no text

- Use a well-lit, flat photo.
- Make sure the text fills most of the frame.
- Avoid glare, shadows, and skew.
- OCR.space free tier has file-size and rate limits; large images may need resizing.
