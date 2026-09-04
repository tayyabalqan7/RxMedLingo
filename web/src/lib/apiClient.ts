import type { AnalyzeResponse, SpeechRequest, SpeechResponse, HealthResponse, AnalyzeErrorResponse } from "@rxmedlingo/shared";

export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch("/api/health");
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}

export async function analyzeImage(file: File): Promise<AnalyzeResponse> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("/api/analyze", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = (await res.json()) as AnalyzeErrorResponse;
    throw new AnalysisError(error.error);
  }

  return res.json();
}

export async function synthesizeSpeech(text: string, languageCode?: string): Promise<SpeechResponse> {
  const body: SpeechRequest = { text, languageCode };

  const res = await fetch("/api/speech", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new SpeechError(error.error?.userMessage ?? "Could not generate audio.");
  }

  return res.json();
}

export class AnalysisError extends Error {
  constructor(
    public readonly error: AnalyzeErrorResponse["error"]
  ) {
    super(error.userMessage);
    this.name = "AnalysisError";
  }
}

export class SpeechError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SpeechError";
  }
}
