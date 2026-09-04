import rateLimit from "express-rate-limit";

/**
 * Basic rate limiter to protect free-tier API quotas.
 */
export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: "RATE_LIMITED",
      stage: "unknown",
      message: "Too many requests. Please slow down.",
      userMessage: "Too many requests. Please slow down.",
      userMessageUrdu: "بہت زیادہ درخواستیں۔ براہ کرم آہستہ کریں۔",
      retryable: true,
    },
  },
});
