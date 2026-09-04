/**
 * Shared API request/response contracts used by both the server and the web frontend.
 */

export type Severity = "red" | "amber" | "green";

export interface DrugResult {
  id: string;
  rawText: string;
  matchedName: string;
  rxcui: string | null;
  confidence: "high" | "medium" | "low";
  ingredients: Array<{ rxcui: string; name: string }>;
  isCombination: boolean;
  dosage: {
    strength: string | null;
    frequency: string | null;
    duration: string | null;
  };
  commonUse: string | null;
}

export interface InteractionResult {
  severity: Severity;
  drugA: string;
  drugB: string;
  ingredientA: string;
  ingredientB: string;
  summary: string;
  summaryUrdu: string;
  evidenceSource: "curated-rules" | "openfda-label";
  labelExcerpt?: string;
}

export interface DuplicateResult {
  ingredient: string;
  ingredientRxcui: string;
  products: string[];
  severity: Severity;
  message: string;
  messageUrdu: string;
}

export interface AnalyzeResponse {
  requestId: string;
  drugs: DrugResult[];
  interactions: InteractionResult[];
  duplicates: DuplicateResult[];
  urduNarrative: string;
  warnings: string[];
  meta: {
    ocrConfidence: number;
    stageTimingsMs: Record<string, number>;
    interactionSourceDegraded: boolean;
  };
}

export interface AnalyzeErrorResponse {
  error: {
    code: string;
    stage: "upload" | "ocr" | "extraction" | "normalization" | "interaction" | "tts" | "unknown";
    message: string;
    userMessage: string;
    userMessageUrdu: string;
    retryable: boolean;
  };
}

export interface SpeechRequest {
  text: string;
  languageCode?: string;
}

export interface SpeechResponse {
  audioContent: string;
  languageCode: string;
  voiceName: string;
}

export interface HealthResponse {
  status: "ok";
  ocrConfigured: boolean;
  ttsConfigured: boolean;
  interactionProvider: string;
}
