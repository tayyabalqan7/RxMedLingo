import { env } from "../../config/env.js";
import { fetchWithRetry } from "../../utils/fetchWithRetry.js";
import { logger } from "../../utils/logger.js";
import type { InteractionEvidence, InteractionProvider } from "./InteractionProvider.js";

const OPENFDA_BASE = "https://api.fda.gov/drug/label.json";

interface OpenFdaLabel {
  results?: Array<{
    drug_interactions?: string[];
    openfda?: {
      generic_name?: string[];
      substance_name?: string[];
    };
  }>;
}

/**
 * openFDA drug-label interaction provider.
 *
 * openFDA supplies supporting evidence (FDA-label prose) but is NOT used as the
 * primary severity source, because label text does not encode pairwise severity.
 *
 * API KEY (optional): see rxmedlingo/.env.example L13
 */
export class OpenFdaProvider implements InteractionProvider {
  name = "openfda";

  async findInteraction(ingredientA: string, ingredientB: string): Promise<InteractionEvidence | null> {
    try {
      const excerpt = await this.findLabelExcerpt(ingredientA, ingredientB);
      if (!excerpt) return null;

      return {
        severity: "amber",
        summary: `FDA labeling mentions an interaction between ${ingredientA} and ${ingredientB}.`,
        summaryUrdu: `FDA لیبلنگ میں ${ingredientA} اور ${ingredientB} کے درمیان تعامل کا ذکر ہے۔`,
        source: "openfda-label",
        labelExcerpt: excerpt,
      };
    } catch (err) {
      logger.warn("openFDA interaction lookup failed", { ingredientA, ingredientB, err });
      return null;
    }
  }

  private async findLabelExcerpt(ingredientA: string, ingredientB: string): Promise<string | null> {
    const key = env.OPENFDA_API_KEY ? `&api_key=${env.OPENFDA_API_KEY}` : "";
    const termA = encodeURIComponent(ingredientA);
    const termB = encodeURIComponent(ingredientB);

    const url = `${OPENFDA_BASE}?search=drug_interactions:${termA}+AND+drug_interactions:${termB}${key}&limit=1`;

    const response = await fetchWithRetry(url, undefined, { timeoutMs: 8000, retries: 1 });

    if (!response.ok) {
      if (response.status === 429) {
        logger.warn("openFDA rate limit hit");
      }
      return null;
    }

    const data = (await response.json()) as OpenFdaLabel;
    const interactions = data.results?.[0]?.drug_interactions;
    if (!interactions || interactions.length === 0) return null;

    const text = interactions[0];
    const lowerA = ingredientA.toLowerCase();
    const lowerB = ingredientB.toLowerCase();

    // Extract a relevant sentence containing both ingredient names.
    const sentences = text.split(/(?<=[.!?])\s+/);
    const relevant = sentences.find(
      (sentence) =>
        sentence.toLowerCase().includes(lowerA) && sentence.toLowerCase().includes(lowerB)
    );

    return relevant ? relevant.trim() : text.slice(0, 300).trim();
  }
}
