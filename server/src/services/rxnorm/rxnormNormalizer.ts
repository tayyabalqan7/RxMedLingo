import type { ExtractedDrug, NormalizedDrug } from "../../types/domain.js";
import { findApproximateRxcui, findRxcuiByName, getRelatedByRxcui } from "./rxnorm.client.js";
import { logger } from "../../utils/logger.js";

interface NormalizeResult {
  drugs: NormalizedDrug[];
  warnings: string[];
}

// Common Pakistani/international brand names mapped to their US-recognized
// generic names, so RxNorm (a US database) can find a match.
const BRAND_TO_GENERIC: Record<string, string> = {
  "ciproxin": "ciprofloxacin",
  "risec": "omeprazole",
  "panadol": "acetaminophen",
  "panadol extra": "acetaminophen",
  "calpol": "acetaminophen",
  "brufen": "ibuprofen",
  "augmentin": "amoxicillin",
  "flagyl": "metronidazole",
  "amoxil": "amoxicillin",
  "cataflam": "diclofenac",
  "voltral": "diclofenac",
  "tegral": "carbamazepine",
  "lasix": "furosemide",
  "ventolin": "salbutamol",
  "zantac": "ranitidine",
  "losec": "omeprazole",
  "nexum": "esomeprazole",
  "tryptin": "amitriptyline",
  "rivotril": "clonazepam",
  "myoril": "tizanidine",
  "myoril 4mg": "tizanidine",
  "myoba": "chlorzoxazone",
  "tonoflex": "tramadol",
  "tonoflex-p": "tramadol",
  "myteka": "montelukast",
  "singulair": "montelukast",
  "risek": "omeprazole",
  "arinac": "pseudoephedrine",
  "arinac forte": "pseudoephedrine",
  "surbex-z": "multivitamin",
  "surbex": "multivitamin",
  "disprin": "aspirin",
  "aspilet": "aspirin",
  "profenac": "aclofenac",
  "diclon": "diclofenac",
  "arthrofen": "ibuprofen",
  "septran": "cotrimoxazole",
  "septran ds": "cotrimoxazole",
  "amoxil forte": "amoxicillin",
  "moxatag": "amoxicillin",
  "klaricid": "clarithromycin",
  "zithromax": "azithromycin",
  "azomax": "azithromycin",
  "azimax": "azithromycin",
  "biaxin": "clarithromycin",
  "epilim": "sodium valproate",
  "tegretol": "carbamazepine",
  "lyrica": "pregabalin",
  "gabica": "gabapentin",
  "neurontin": "gabapentin",
  "concor": "bisoprolol",
  "inderal": "propranolol",
  "norvasc": "amlodipine",
  "amlong": "amlodipine",
  "amlopres": "amlodipine",
  "co-amoxiclav": "amoxicillin clavulanate",
  "clavamox": "amoxicillin clavulanate",
  "ponstan": "mefenamic acid",
  "ponstan forte": "mefenamic acid",
  "buscopan": "hyoscine",
  "gaviscon": "alginic acid",
  "eno": "sodium bicarbonate",
  "librax": "chlordiazepoxide clidinium",
  "xanax": "alprazolam",
  "tranax": "alprazolam",
  "valium": "diazepam",
  "diazep": "diazepam",
  "reglan": "metoclopramide",
  "maxolon": "metoclopramide",
  "motilium": "domperidone",
  "domstal": "domperidone",
  "cipro": "ciprofloxacin",
  "ciplox": "ciprofloxacin",
  "moxiflox": "moxifloxacin",
  "avelox": "moxifloxacin",
  "levoflox": "levofloxacin",
  "tavanic": "levofloxacin",
  "genta": "gentamicin",
  "gentamicin": "gentamicin",
  "metrogyl": "metronidazole",
  "flagentyl": "metronidazole",
  "duphaston": "dydrogesterone",
  "folic acid": "folic acid",
  "folvite": "folic acid",
  "ferrous": "ferrous sulfate",
  "surbex t": "multivitamin",
};

function resolveBrandName(rawText: string): string {
  const lower = rawText.toLowerCase().trim();
  for (const brand of Object.keys(BRAND_TO_GENERIC)) {
    if (lower.includes(brand)) {
      return BRAND_TO_GENERIC[brand];
    }
  }
  return rawText;
}

function scoreToConfidence(score: number): NormalizedDrug["confidence"] {
  if (score >= 80) return "high";
  if (score >= 50) return "medium";
  return "low";
}

function capitalize(name: string): string {
  return name
    .split(" ")
    .map((word) => (word.length > 0 ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word))
    .join(" ");
}

/**
 * Normalize extracted drug text against RxNorm and decompose each product
 * into its ingredient set (IN/MIN/PIN). This is the foundation for both
 * combination-product handling and duplicate-drug detection.
 */
export async function normalizeDrugs(extracted: ExtractedDrug[]): Promise<NormalizeResult> {
  const warnings: string[] = [];
  const normalized: NormalizedDrug[] = [];

  for (const candidate of extracted) {
    try {
      let match = await findRxcuiByName(candidate.rawText);
      let score = match ? 100 : 0;

      if (!match) {
        const approximate = await findApproximateRxcui(candidate.rawText);
        // Only trust the approximate match if it's very confident.
        // A weak match is often noise and worse than trying the
        // brand-name mapping below.
        if (approximate && approximate.score >= 90) {
          match = { rxcui: approximate.rxcui, name: approximate.name };
          score = approximate.score;
        }
      }

      if (!match) {
        const genericName = resolveBrandName(candidate.rawText);
        if (genericName !== candidate.rawText) {
          match = await findRxcuiByName(genericName);
          if (match) {
            score = 90;
          } else {
            const approximateGeneric = await findApproximateRxcui(genericName);
            if (approximateGeneric && approximateGeneric.score >= 90) {
              match = { rxcui: approximateGeneric.rxcui, name: approximateGeneric.name };
              score = approximateGeneric.score;
            }
          }
        }
      }

      if (!match) {
        normalized.push({
          ...candidate,
          matchedName: candidate.rawText,
          rxcui: null,
          confidence: "low",
          ingredients: [],
          isCombination: false,
        });
        continue;
      }

      const related = await getRelatedByRxcui(match.rxcui, ["IN", "MIN", "PIN"]);
      const groups = related.relatedGroup?.conceptGroup ?? [];

      const ingredients = groups
        .flatMap((group) => group.conceptProperties ?? [])
        .filter((prop) => prop.tty === "IN" && prop.rxcui && prop.name)
        .map((prop) => ({ rxcui: prop.rxcui!, name: capitalize(prop.name!) }));

      const uniqueIngredients = Array.from(new Map(ingredients.map((i) => [i.rxcui, i])).values());

      const isCombination = uniqueIngredients.length > 1;

      if (uniqueIngredients.length === 0) {
        uniqueIngredients.push({ rxcui: match.rxcui, name: capitalize(match.name) });
      }

      normalized.push({
        ...candidate,
        matchedName: capitalize(match.name),
        rxcui: match.rxcui,
        confidence: scoreToConfidence(score),
        ingredients: uniqueIngredients,
        isCombination,
      });
    } catch (err) {
      logger.warn("Failed to normalize drug", { rawText: candidate.rawText, err });
      warnings.push(`Could not verify "${candidate.rawText}" against the drug database.`);
      normalized.push({
        ...candidate,
        matchedName: candidate.rawText,
        rxcui: null,
        confidence: "low",
        ingredients: [],
        isCombination: false,
      });
    }
  }

  if (warnings.length > 0) {
    warnings.unshift("Some drug names could not be fully verified. Results may be incomplete.");
  }

  return { drugs: normalized, warnings };
}