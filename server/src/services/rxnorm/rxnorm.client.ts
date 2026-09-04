import { fetchWithRetry } from "../../utils/fetchWithRetry.js";
import { logger } from "../../utils/logger.js";

const RXNAV_BASE = "https://rxnav.nlm.nih.gov/REST";

export interface RxcuiResult {
  idGroup?: {
    rxnormId?: string[];
    name?: string;
  };
}

export interface ApproximateTermResult {
  approximateGroup?: {
    candidate?: Array<{
      rxcui?: string;
      name?: string;
      score?: string;
    }>;
  };
}

export interface RelatedResult {
  relatedGroup?: {
    conceptGroup?: Array<{
      tty?: string;
      conceptProperties?: Array<{
        rxcui?: string;
        name?: string;
        tty?: string;
      }>;
    }>;
  };
}

const cache = new Map<string, unknown>();

async function getJson<T>(url: string, timeoutMs = 5000): Promise<T | null> {
  const cacheKey = url;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) as T;
  }

  try {
    const response = await fetchWithRetry(url, undefined, { timeoutMs, retries: 1 });
    if (!response.ok) {
      logger.warn("RxNorm request failed", { status: response.status, url });
      return null;
    }
    const data = (await response.json()) as T;
    cache.set(cacheKey, data);
    return data;
  } catch (err) {
    logger.warn("RxNorm request error", { url, err });
    return null;
  }
}

export async function findRxcuiByName(name: string): Promise<{ rxcui: string; name: string } | null> {
  const url = `${RXNAV_BASE}/rxcui.json?name=${encodeURIComponent(name)}`;
  const data = await getJson<RxcuiResult>(url);
  const ids = data?.idGroup?.rxnormId;
  if (ids && ids.length > 0) {
    return { rxcui: ids[0], name: data?.idGroup?.name ?? name };
  }
  return null;
}

export async function findApproximateRxcui(name: string): Promise<{ rxcui: string; name: string; score: number } | null> {
  const url = `${RXNAV_BASE}/approximateTerm.json?term=${encodeURIComponent(name)}&maxEntries=5&option=1`;
  const data = await getJson<ApproximateTermResult>(url);
  const candidates = data?.approximateGroup?.candidate;
  if (!candidates || candidates.length === 0) return null;

  const best = candidates[0];
  if (!best.rxcui || !best.name) return null;

  const score = Number(best.score ?? 0);
  return { rxcui: best.rxcui, name: best.name, score };
}

export async function getRelatedByRxcui(
  rxcui: string,
  ttys: string[] = ["IN", "MIN", "PIN"]
): Promise<RelatedResult> {
  const url = `${RXNAV_BASE}/rxcui/${encodeURIComponent(rxcui)}/related.json?tty=${ttys.join("+")}`;
  const data = await getJson<RelatedResult>(url);
  return data ?? {};
}