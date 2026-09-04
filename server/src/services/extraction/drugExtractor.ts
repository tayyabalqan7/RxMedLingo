import crypto from "node:crypto";
import { cleanText } from "./noiseFilter.js";
import { parseDosage, stripDosageTokens } from "./dosageParser.js";
import type { ExtractedDrug } from "../../types/domain.js";

const KNOWN_NON_DRUGS = [
  "advice",
  "counsel",
  "diet",
  "exercise",
  "rest",
  "fluids",
  "review",
  "follow",
  "revisit",
  "come",
  "back",
];

export function extractDrugs(rawText: string): ExtractedDrug[] {
  const cleaned = cleanText(rawText);
  const lines = cleaned.split("\n");

  const candidates: ExtractedDrug[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 3) continue;

    const lower = trimmed.toLowerCase();
    if (KNOWN_NON_DRUGS.some((word) => lower.includes(word))) continue;

    const hasWord = /[a-zA-Z]{2,}/.test(trimmed);
    if (!hasWord) continue;

    const dosage = parseDosage(trimmed);
    const nameOnly = stripDosageTokens(trimmed);
    if (!nameOnly || nameOnly.length < 2) continue;

    candidates.push({
      id: crypto.randomUUID(),
      rawText: trimmed,
      dosage,
    });
  }

  const seen = new Set<string>();
  const deduped: ExtractedDrug[] = [];
  for (const candidate of candidates) {
    const key = stripDosageTokens(candidate.rawText).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(candidate);
  }

  return deduped;
}