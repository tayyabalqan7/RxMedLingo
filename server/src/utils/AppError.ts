/**
 * Typed application error used to propagate stage, retryability, and
 * user-friendly messages (English + Urdu) through the centralized handler.
 */
export type ErrorStage = "upload" | "ocr" | "extraction" | "normalization" | "interaction" | "tts" | "unknown";

export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly stage: ErrorStage,
    public readonly httpStatus: number,
    public readonly userMessage: string,
    public readonly userMessageUrdu: string,
    public readonly retryable: boolean,
    message?: string,
    public readonly cause?: unknown
  ) {
    super(message ?? userMessage);
    this.name = "AppError";
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        stage: this.stage,
        message: this.message,
        userMessage: this.userMessage,
        userMessageUrdu: this.userMessageUrdu,
        retryable: this.retryable,
      },
    };
  }
}
