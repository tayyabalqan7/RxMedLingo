/**
 * Heuristics to remove common prescription noise (clinic headers, dates,
 * doctor names, vitals, instructions) so drug extraction is more accurate.
 */

const NOISE_PATTERNS = [
  /^dr\b\.?/i,
  /^mr\b\.?/i,
  /^mrs\b\.?/i,
  /^ms\b\.?/i,
  /^miss\b/i,
  /^mas\b\.?/i,
  /^name[\s:]/i,
  /^age[\s:]/i,
  /^sex[\s:]/i,
  /^gender[\s:]/i,
  /^wt[\s:]/i,
  /^weight[\s:]/i,
  /^bp[\s:]/i,
  /^temp[\s:]/i,
  /^date[\s:]/i,
  /^time[\s:]/i,
  /^follow[- ]?up/i,
  /^signature/i,
  /^clinic/i,
  /^hospital/i,
  /^address/i,
  /^phone/i,
  /^rx[\s#:]/i,
  /^reg[\s.\-]*no/i,
  /^csc\b/i,
  /^mbbs/i,
  /^mrcp/i,
  /^fcps/i,
  /^md\b/i,
  /^specialist/i,
  /^consultant/i,
  /^u\/s\b/i,
  /^ph\.?#/i,
  /not valid for court/i,
  /^valid\b/i,
  /^\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
  /^#\d/,
  /^\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4}/,
  /^\d{2,4}[\/\.\-]\d{1,2}[\/\.\-]\d{1,2}/,
  /^(once|twice|thrice)\s+(daily|a day|day)/i,
];

export function isNoiseLine(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length < 2) return true;
  if (NOISE_PATTERNS.some((pattern) => pattern.test(trimmed))) return true;

  // Discard lines that are purely numbers/symbols (likely vitals or dates).
  if (/^[\d\s\/\.\-]+$/.test(trimmed)) return true;

  return false;
}

export function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => !isNoiseLine(line))
    .join("\n");
}