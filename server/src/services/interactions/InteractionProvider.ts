import type { Severity } from "@rxmedlingo/shared";

export interface InteractionEvidence {
  severity: Severity;
  summary: string;
  summaryUrdu: string;
  source: "curated-rules" | "openfda-label";
  labelExcerpt?: string;
}

/**
 * Pluggable interface for drug-interaction data sources.
 * Curated rules implement this directly; openFDA also implements it.
 */
export interface InteractionProvider {
  name: string;
  findInteraction(ingredientA: string, ingredientB: string): Promise<InteractionEvidence | null>;
}
