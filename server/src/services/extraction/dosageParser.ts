/**
 * Parses free-text prescription lines for strength, frequency, and duration.
 * Designed for Pakistani prescriptions in English/Latin script.
 */

const STRENGTH_PATTERN = /(\d+(?:\.\d+)?)\s*(mg|mcg|ug|g|ml|iu|units?|%)/i;

const FREQUENCY_PATTERNS = [
  { pattern: /(?:once|one|1)\s*(?:times?|x)?\s*(?:daily|a day|per day|day)/i, label: "once daily" },
  { pattern: /(?:twice|two|2)\s*(?:times?|x)?\s*(?:daily|a day|per day|day)/i, label: "twice daily" },
  { pattern: /(?:thrice|three|3)\s*(?:times?|x)?\s*(?:daily|a day|per day|day)/i, label: "three times daily" },
  { pattern: /(?:four|4)\s*(?:times?|x)?\s*(?:daily|a day|per day|day)/i, label: "four times daily" },
  { pattern: /(?:every|q)\s*\d+\s*(?:h|hr|hour)/i, label: null as string | null },
  { pattern: /\bbid\b/i, label: "twice daily" },
  { pattern: /\btid\b/i, label: "three times daily" },
  { pattern: /\bqid\b/i, label: "four times daily" },
  { pattern: /\bhs\b/i, label: "at bedtime" },
  { pattern: /\bom\b/i, label: "once daily (morning)" },
  { pattern: /\bprn\b/i, label: "as needed" },
];

const DURATION_PATTERNS = [
  { pattern: /(?:for\s+)?(\d+)\s*(?:days?|d)\b/i, label: (n: string) => `${n} days` },
  { pattern: /(?:for\s+)?(\d+)\s*(?:weeks?|wks?)\b/i, label: (n: string) => `${n} weeks` },
  { pattern: /(?:for\s+)?(\d+)\s*(?:months?|mos?)\b/i, label: (n: string) => `${n} months` },
  { pattern: /\b(\d+)-(?:day|d)\s+course\b/i, label: (n: string) => `${n} days` },
];

export interface ParsedDosage {
  strength: string | null;
  frequency: string | null;
  duration: string | null;
}

export function parseDosage(line: string): ParsedDosage {
  const strengthMatch = line.match(STRENGTH_PATTERN);
  const strength = strengthMatch ? strengthMatch[0].trim() : null;

  let frequency: string | null = null;
  for (const { pattern, label } of FREQUENCY_PATTERNS) {
    const match = line.match(pattern);
    if (match) {
      frequency = label ?? match[0].trim();
      break;
    }
  }

  let duration: string | null = null;
  for (const { pattern, label } of DURATION_PATTERNS) {
    const match = line.match(pattern);
    if (match) {
      duration = label(match[1]);
      break;
    }
  }

  return { strength, frequency, duration };
}

/**
 * Remove dosage tokens from a line to improve drug-name matching.
 */
export function stripDosageTokens(line: string): string {
  return line
    .replace(STRENGTH_PATTERN, "")
    .replace(/\d+\s*(?:mg|mcg|ug|g|ml|iu|units?|%)/gi, "")
    .replace(/\b(?:once|twice|thrice|daily|day|bid|tid|qid|hs|om|prn)\b/gi, "")
    .replace(/\b(?:for\s+)?\d+\s*(?:days?|weeks?|months?)\b/gi, "")
    .replace(/[^a-zA-Z0-9\s\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
