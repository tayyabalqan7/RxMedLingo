/**
 * Internal domain types used inside the backend pipeline.
 */

export interface ExtractedDrug {
  id: string;
  rawText: string;
  dosage: {
    strength: string | null;
    frequency: string | null;
    duration: string | null;
  };
}

export interface NormalizedDrug {
  id: string;
  rawText: string;
  matchedName: string;
  rxcui: string | null;
  confidence: "high" | "medium" | "low";
  ingredients: Array<{ rxcui: string; name: string }>;
  isCombination: boolean;
  dosage: ExtractedDrug["dosage"];
}

export interface IngredientRef {
  rxcui: string;
  name: string;
}

export interface InteractionPair {
  drugA: NormalizedDrug;
  drugB: NormalizedDrug;
  ingredientA: IngredientRef;
  ingredientB: IngredientRef;
}