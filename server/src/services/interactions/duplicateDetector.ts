import type { DuplicateResult, Severity } from "@rxmedlingo/shared";
import type { NormalizedDrug } from "../../types/domain.js";

/**
 * Detects duplicate therapy: the same ingredient appearing in multiple products
 * under different brand names (e.g., Panadol and Calpol both contain acetaminophen).
 */
export function detectDuplicates(drugs: NormalizedDrug[]): DuplicateResult[] {
  const ingredientToProducts = new Map<string, { name: string; products: string[] }>();

  for (const drug of drugs) {
    for (const ingredient of drug.ingredients) {
      const existing = ingredientToProducts.get(ingredient.rxcui);
      if (existing) {
        if (!existing.products.includes(drug.matchedName)) {
          existing.products.push(drug.matchedName);
        }
      } else {
        ingredientToProducts.set(ingredient.rxcui, {
          name: ingredient.name,
          products: [drug.matchedName],
        });
      }
    }
  }

  const duplicates: DuplicateResult[] = [];

  for (const [ingredientRxcui, { name, products }] of ingredientToProducts.entries()) {
    if (products.length < 2) continue;

    const severity = getDuplicateSeverity(name);
    const productList = products.join(", ");

    duplicates.push({
      ingredient: name,
      ingredientRxcui,
      products,
      severity,
      message: `${name} appears in multiple medicines: ${productList}. Taking more than one may lead to an overdose.`,
      messageUrdu: `${name} کئی ادویات میں موجود ہے: ${productList}۔ ایک سے زیادہ لینے سے overdose ہو سکتا ہے۔`,
    });
  }

  return duplicates;
}

function getDuplicateSeverity(ingredientName: string): Severity {
  const highRiskDuplicates = [
    "acetaminophen",
    "paracetamol",
    "ibuprofen",
    "aspirin",
    "warfarin",
    "metformin",
    "amlodipine",
    "atorvastatin",
  ];
  const lower = ingredientName.toLowerCase();
  if (highRiskDuplicates.some((name) => lower.includes(name))) return "red";
  return "amber";
}
