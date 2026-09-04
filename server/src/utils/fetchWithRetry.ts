import { logger } from "./logger.js";

export interface FetchOptions {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
}

/**
 * Fetch wrapper with timeout and retry for transient failures.
 * Only retries idempotent GET requests on 429/5xx.
 */
export async function fetchWithRetry(
  input: RequestInfo,
  init?: RequestInit,
  options: FetchOptions = {}
): Promise<Response> {
  const { timeoutMs = 15000, retries = 2, retryDelayMs = 500 } = options;
  const method = (init?.method ?? "GET").toUpperCase();
  const canRetry = method === "GET";

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok && canRetry && attempt < retries && isRetryable(response.status)) {
        lastError = new Error(`HTTP ${response.status}`);
        await sleep(retryDelayMs * (attempt + 1));
        continue;
      }

      return response;
    } catch (err) {
      clearTimeout(timeout);
      lastError = err;
      if (canRetry && attempt < retries) {
        await sleep(retryDelayMs * (attempt + 1));
      }
    }
  }

  logger.error("Fetch failed after retries", { input: typeof input === "string" ? input : input.toString(), lastError });
  throw lastError instanceof Error ? lastError : new Error("Network request failed");
}

function isRetryable(status: number): boolean {
  return status === 429 || status >= 500;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
