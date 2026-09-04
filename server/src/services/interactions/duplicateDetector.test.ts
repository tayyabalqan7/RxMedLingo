import { describe, it, expect } from "vitest";
import { detectDuplicates } from "./duplicateDetector.js";
import type { NormalizedDrug } from "../../types/domain.js";

function makeDrug(name: string, ingredients: { rxcui: string; name: string }[]): NormalizedDrug {
  return {
    id: "1",
    rawText: name,
    matchedName: name,
    rxcui: "rxcui-" + name,
    confidence: "high",
    ingredients,
    isCombination: ingredients.length > 1,
    dosage: { strength: null, frequency: null, duration: null },
  };
}

describe("detectDuplicates", () => {
  it("flags shared ingredient across different brand names", () => {
    const drugs = [
      makeDrug("Panadol", [{ rxcui: "161", name: "Acetaminophen" }]),
      makeDrug("Calpol", [{ rxcui: "161", name: "Acetaminophen" }]),
    ];

    const duplicates = detectDuplicates(drugs);
    expect(duplicates).toHaveLength(1);
    expect(duplicates[0].ingredient).toBe("Acetaminophen");
    expect(duplicates[0].products).toContain("Panadol");
    expect(duplicates[0].products).toContain("Calpol");
    expect(duplicates[0].severity).toBe("red");
  });

  it("ignores single-product ingredients", () => {
    const drugs = [makeDrug("Panadol", [{ rxcui: "161", name: "Acetaminophen" }])];
    expect(detectDuplicates(drugs)).toHaveLength(0);
  });
});
