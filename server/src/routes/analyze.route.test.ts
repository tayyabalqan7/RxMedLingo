import { describe, it, expect, vi, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

// Mock the env config so the test thinks keys are configured.
vi.mock("../config/env.js", () => ({
  env: {
    PORT: 5000,
    OCR_SPACE_API_KEY: "test-key",
    RESPONSIVEVOICE_API_KEY: "test-key",
    RESPONSIVEVOICE_API_SECRET: "test-secret",
    RESPONSIVEVOICE_URDU_VOICE: "Urdu Female",
    OPENFDA_API_KEY: "",
    NODE_ENV: "test",
  },
  isOcrConfigured: true,
  isTtsConfigured: true,
}));

// Mock OCR service so no real API call is made.
vi.mock("../services/ocr/ocrSpace.service.js", () => ({
  extractTextFromImage: vi.fn().mockResolvedValue({
    text: "Tab Panadol 500mg\nTab Calpol 500mg\nTab Warfarin 5mg\nTab Brufen 400mg",
    confidence: 95,
  }),
}));

// Mock RxNorm calls.
vi.mock("../services/rxnorm/rxnorm.client.js", () => ({
  findRxcuiByName: vi.fn().mockImplementation(async (name: string) => {
    if (name.toLowerCase().includes("panadol")) return { rxcui: "panadol-rxcui", name: "Panadol" };
    if (name.toLowerCase().includes("calpol")) return { rxcui: "calpol-rxcui", name: "Calpol" };
    if (name.toLowerCase().includes("warfarin")) return { rxcui: "warfarin-rxcui", name: "Warfarin" };
    if (name.toLowerCase().includes("brufen")) return { rxcui: "brufen-rxcui", name: "Brufen" };
    return null;
  }),
  findApproximateRxcui: vi.fn().mockResolvedValue(null),
  getRelatedByRxcui: vi.fn().mockImplementation(async (rxcui: string) => {
    const map: Record<string, string> = {
      "panadol-rxcui": "Acetaminophen",
      "calpol-rxcui": "Acetaminophen",
      "warfarin-rxcui": "Warfarin",
      "brufen-rxcui": "Ibuprofen",
    };
    return {
      relatedGroup: {
        conceptGroup: [
          {
            tty: "IN",
            conceptProperties: [{ rxcui: `ing-${rxcui}`, name: map[rxcui], tty: "IN" }],
          },
        ],
      },
    };
  }),
}));

describe("POST /api/analyze", () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(() => {
    app = createApp();
  });

  it("returns 400 when no image is uploaded", async () => {
    const res = await request(app).post("/api/analyze");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("NO_IMAGE");
  });

  it("returns analyzed drugs, duplicates, and interactions", async () => {
    const buffer = Buffer.from("fake-image-data");
    const res = await request(app).post("/api/analyze").attach("image", buffer, "prescription.png");

    expect(res.status).toBe(200);
    expect(res.body.drugs.length).toBeGreaterThanOrEqual(1);
    expect(res.body.duplicates.length).toBeGreaterThanOrEqual(1);
  });
});
