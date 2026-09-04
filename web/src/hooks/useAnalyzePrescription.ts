import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { analyzeImage, AnalysisError } from "../lib/apiClient.js";
import type { AnalyzeResponse, AnalyzeErrorResponse } from "@rxmedlingo/shared";

interface AnalyzeState {
  loading: boolean;
  error: AnalyzeErrorResponse["error"] | null;
  result: AnalyzeResponse | null;
}

export function useAnalyzePrescription() {
  const navigate = useNavigate();
  const [state, setState] = useState<AnalyzeState>({
    loading: false,
    error: null,
    result: null,
  });

  const analyze = useCallback(
    async (file: File) => {
      setState({ loading: true, error: null, result: null });
      navigate("/processing", { state: { fileName: file.name } });

      try {
        const result = await analyzeImage(file);
        setState({ loading: false, error: null, result });
        navigate("/results", { state: { result } });
      } catch (err) {
        const analysisError = err instanceof AnalysisError ? err.error : null;
        const fallbackError: AnalyzeErrorResponse["error"] = {
          code: "NETWORK_ERROR",
          stage: "unknown",
          message: err instanceof Error ? err.message : "Unknown error",
          userMessage: "Could not connect to the server. Please check your internet and try again.",
          userMessageUrdu: "سرور سے رابطہ نہیں ہو سکا۔ براہ کرم اپنا انٹرنیٹ چیک کریں اور دوبارہ کوشش کریں۔",
          retryable: true,
        };
        const error = analysisError ?? fallbackError;
        setState({ loading: false, error, result: null });
        navigate("/error", { state: { error } });
      }
    },
    [navigate]
  );

  const reset = useCallback(() => {
    setState({ loading: false, error: null, result: null });
  }, []);

  return { ...state, analyze, reset };
}
