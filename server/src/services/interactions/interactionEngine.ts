import type { InteractionResult, DuplicateResult, Severity } from "@rxmedlingo/shared";
import type { NormalizedDrug } from "../../types/domain.js";
import { findCuratedInteraction } from "./severityRules.js";
import { OpenFdaProvider } from "./openFdaProvider.js";
import { detectDuplicates } from "./duplicateDetector.js";
import type { InteractionProvider } from "./InteractionProvider.js";
import { logger } from "../../utils/logger.js";

interface InteractionEngineResult {
  interactions: InteractionResult[];
  duplicates: DuplicateResult[];
  warnings: string[];
  sourceDegraded: boolean;
}

const openFda = new OpenFdaProvider();

/**
 * Build interaction and duplicate warnings from normalized drugs.
 *
 * Logic:
 * 1. Generate all pairwise ingredient combinations across products.
 * 2. Check curated rules first (primary severity source).
 * 3. Fall back to openFDA label evidence when no curated rule matches.
 * 4. Detect duplicate ingredients across brands.
 */
export async function buildInteractions(drugs: NormalizedDrug[]): Promise<InteractionEngineResult> {
  const interactions: InteractionResult[] = [];
  const seenPairs = new Set<string>();
  let sourceDegraded = false;

  const pairs = generateIngredientPairs(drugs);

  for (const { drugA, drugB, ingredientA, ingredientB } of pairs) {
    const pairKey = [ingredientA.rxcui, ingredientB.rxcui].sort().join("-");
    if (seenPairs.has(pairKey)) continue;
    seenPairs.add(pairKey);

    try {
      // Curated rules are the primary source.
      const curated = findCuratedInteraction(ingredientA.name, ingredientB.name);
      if (curated) {
        interactions.push({
          severity: curated.severity,
          drugA: drugA.matchedName,
          drugB: drugB.matchedName,
          ingredientA: ingredientA.name,
          ingredientB: ingredientB.name,
          summary: curated.summary,
          summaryUrdu: curated.summaryUrdu,
          evidenceSource: curated.source,
        });
        continue;
      }

      // openFDA as supporting evidence only.
      const openFdaResult = await openFda.findInteraction(ingredientA.name, ingredientB.name);
      if (openFdaResult) {
        interactions.push({
          severity: openFdaResult.severity,
          drugA: drugA.matchedName,
          drugB: drugB.matchedName,
          ingredientA: ingredientA.name,
          ingredientB: ingredientB.name,
          summary: openFdaResult.summary,
          summaryUrdu: openFdaResult.summaryUrdu,
          evidenceSource: openFdaResult.source,
          labelExcerpt: openFdaResult.labelExcerpt,
        });
      }
    } catch (err) {
      logger.warn("Interaction check failed for pair", {
        ingredientA: ingredientA.name,
        ingredientB: ingredientB.name,
        err,
      });
      sourceDegraded = true;
    }
  }

  // Sort: most severe first.
  const severityRank: Record<Severity, number> = { red: 0, amber: 1, green: 2 };
  interactions.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);

  const duplicates = detectDuplicates(drugs);

  const warnings: string[] = [];
  if (sourceDegraded) {
    warnings.push("Interaction data source is partially unavailable. Only high-confidence checks are shown.");
  }

  return { interactions, duplicates, warnings, sourceDegraded };
}

function generateIngredientPairs(drugs: NormalizedDrug[]) {
  const pairs: Array<{
    drugA: NormalizedDrug;
    drugB: NormalizedDrug;
    ingredientA: { rxcui: string; name: string };
    ingredientB: { rxcui: string; name: string };
  }> = [];

  for (let i = 0; i < drugs.length; i++) {
    for (let j = i + 1; j < drugs.length; j++) {
      const drugA = drugs[i];
      const drugB = drugs[j];
      for (const ingredientA of drugA.ingredients) {
        for (const ingredientB of drugB.ingredients) {
          if (ingredientA.rxcui === ingredientB.rxcui) continue; // handled by duplicate detector
          pairs.push({ drugA, drugB, ingredientA, ingredientB });
        }
      }
    }
  }

  return pairs;
}
