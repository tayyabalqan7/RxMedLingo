import type { ErrorRequestHandler } from "express";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

/**
 * Central Express error handler. Converts AppError to a structured JSON response
 * and maps unexpected errors to a generic, user-friendly message.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    logger.warn("Application error", { code: err.code, stage: err.stage, status: err.httpStatus });
    res.status(err.httpStatus).json(err.toJSON());
    return;
  }

  logger.error("Unexpected error", { err });
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      stage: "unknown",
      message: "An unexpected error occurred.",
      userMessage: "Something went wrong on our end. Please try again.",
      userMessageUrdu: "ہماری طرف سے کچھ غلط ہو گیا۔ براہ کرم دوبارہ کوشش کریں۔",
      retryable: true,
    },
  });
};
