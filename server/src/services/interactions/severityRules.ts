import type { Severity } from "@rxmedlingo/shared";
import type { InteractionEvidence } from "./InteractionProvider.js";

export interface CuratedRule {
  ingredientA: string;
  ingredientB: string;
  severity: Severity;
  summary: string;
  summaryUrdu: string;
}

/**
 * Curated, clinically significant interaction rules.
 * Each rule is bidirectional; the engine checks both (A,B) and (B,A).
 */
const RULES: CuratedRule[] = [
  // Anticoagulants + NSAIDs/aspirin — high bleeding risk
  {
    ingredientA: "warfarin",
    ingredientB: "ibuprofen",
    severity: "red",
    summary: "Ibuprofen can increase bleeding risk when taken with warfarin.",
    summaryUrdu: "وارفارن کے ساتھ آئیبuprofen لینے سے خون بہنے کا خطرہ بڑھ سکتا ہے۔",
  },
  {
    ingredientA: "warfarin",
    ingredientB: "aspirin",
    severity: "red",
    summary: "Aspirin with warfarin greatly increases bleeding risk unless specifically directed by a doctor.",
    summaryUrdu: "وارفارن کے ساتھ ایسپرین لینے سے خون بہنے کا خطرہ بہت بڑھ جاتا ہے، جب تک کہ ڈاکٹر خاص طور پر نہ کہیں۔",
  },
  {
    ingredientA: "warfarin",
    ingredientB: "naproxen",
    severity: "red",
    summary: "Naproxen can increase bleeding risk when taken with warfarin.",
    summaryUrdu: "وارفارن کے ساتھ naproxen لینے سے خون بہنے کا خطرہ بڑھ سکتا ہے۔",
  },
  // ACE inhibitors/ARBs + potassium — hyperkalemia risk
  {
    ingredientA: "lisinopril",
    ingredientB: "potassium",
    severity: "red",
    summary: "Combining ACE inhibitors with potassium supplements can raise potassium to dangerous levels.",
    summaryUrdu: "ACE inhibitors کو پوٹاشیم سپلیمنٹس کے ساتھ لینے سے پوٹاشیم کا خطرناک سطح تک بڑھ سکتا ہے۔",
  },
  {
    ingredientA: "losartan",
    ingredientB: "potassium",
    severity: "red",
    summary: "Combining ARBs with potassium supplements can raise potassium to dangerous levels.",
    summaryUrdu: "ARBs کو پوٹاشیم سپلیمنٹس کے ساتھ لینے سے پوٹاشیم خطرناک سطح تک بڑھ سکتا ہے۔",
  },
  // Serotonergic combinations — serotonin syndrome
  {
    ingredientA: "sertraline",
    ingredientB: "tramadol",
    severity: "red",
    summary: "Sertraline and tramadol together increase the risk of serotonin syndrome.",
    summaryUrdu: "sertraline اور tramadol کو ایک ساتھ لینے سے serotonin syndrome کا خطرہ بڑھ جاتا ہے۔",
  },
  {
    ingredientA: "fluoxetine",
    ingredientB: "tramadol",
    severity: "red",
    summary: "Fluoxetine and tramadol together increase the risk of serotonin syndrome.",
    summaryUrdu: "fluoxetine اور tramadol کو ایک ساتھ لینے سے serotonin syndrome کا خطرہ بڑھ جاتا ہے۔",
  },
  // Nitrates + PDE5 inhibitors — severe hypotension
  {
    ingredientA: "nitroglycerin",
    ingredientB: "sildenafil",
    severity: "red",
    summary: "Nitrates with sildenafil can cause a dangerous drop in blood pressure.",
    summaryUrdu: "نائٹریٹس کو sildenafil کے ساتھ لینے سے بلڈ پریشر خطرناک حد تک گر سکتا ہے۔",
  },
  {
    ingredientA: "isosorbide mononitrate",
    ingredientB: "sildenafil",
    severity: "red",
    summary: "Nitrates with sildenafil can cause a dangerous drop in blood pressure.",
    summaryUrdu: "نائٹریٹس کو sildenafil کے ساتھ لینے سے بلڈ پریشر خطرناک حد تک گر سکتا ہے۔",
  },
  // Methotrexate + NSAIDs/trimethoprim — toxicity
  {
    ingredientA: "methotrexate",
    ingredientB: "ibuprofen",
    severity: "red",
    summary: "NSAIDs can increase methotrexate toxicity.",
    summaryUrdu: "NSAIDs methotrexate کی زہریلاہٹ بڑھا سکتے ہیں۔",
  },
  {
    ingredientA: "methotrexate",
    ingredientB: "trimethoprim",
    severity: "red",
    summary: "Trimethoprim with methotrexate can cause severe bone-marrow suppression.",
    summaryUrdu: "trimethoprim کو methotrexate کے ساتھ لینے سے ہڈی گودے کی شدید دباؤ پیدا ہو سکتی ہے۔",
  },
  // Statins + macrolides/azoles — myopathy/rhabdo
  {
    ingredientA: "atorvastatin",
    ingredientB: "clarithromycin",
    severity: "amber",
    summary: "Clarithromycin can raise atorvastatin levels, increasing muscle side effects.",
    summaryUrdu: "clarithromycin atorvastatin کی سطح بڑھا سکتی ہے، جس سے پٹھوں کے ضمنی اثرات بڑھ سکتے ہیں۔",
  },
  {
    ingredientA: "simvastatin",
    ingredientB: "clarithromycin",
    severity: "amber",
    summary: "Clarithromycin can raise simvastatin levels, increasing muscle side effects.",
    summaryUrdu: "clarithromycin simvastatin کی سطح بڑھا سکتی ہے، جس سے پٹھوں کے ضمنی اثرات بڑھ سکتے ہیں۔",
  },
  {
    ingredientA: "atorvastatin",
    ingredientB: "fluconazole",
    severity: "amber",
    summary: "Fluconazole can raise atorvastatin levels, increasing muscle side effects.",
    summaryUrdu: "fluconazole atorvastatin کی سطح بڑھا سکتی ہے، جس سے پٹھوں کے ضمنی اثرات بڑھ سکتے ہیں۔",
  },
  // Metformin + contrast/diuretics
  {
    ingredientA: "metformin",
    ingredientB: "furosemide",
    severity: "amber",
    summary: "Diuretics may affect kidney function, which matters for metformin safety.",
    summaryUrdu: "diuretics گردے کے کام کو متاثر کر سکتے ہیں، جو metformin کے لیے اہم ہے۔",
  },
  // Levothyroxine + calcium/iron — absorption
  {
    ingredientA: "levothyroxine",
    ingredientB: "calcium",
    severity: "amber",
    summary: "Calcium can reduce levothyroxine absorption; separate doses by at least 4 hours.",
    summaryUrdu: "کیلشیم levothyroxine کے جذب کو کم کر سکتا ہے؛ خوراک کم از کم 4 گھنٹے الگ کریں۔",
  },
  {
    ingredientA: "levothyroxine",
    ingredientB: "iron",
    severity: "amber",
    summary: "Iron can reduce levothyroxine absorption; separate doses by at least 4 hours.",
    summaryUrdu: "آئرن levothyroxine کے جذب کو کم کر سکتا ہے؛ خوراک کم از کم 4 گھنٹے الگ کریں۔",
  },
  // Quinolones + antacids
  {
    ingredientA: "ciprofloxacin",
    ingredientB: "calcium",
    severity: "amber",
    summary: "Calcium/antacids can reduce ciprofloxacin absorption; separate doses.",
    summaryUrdu: "کیلشیم/اینٹاسڈ ciprofloxacin کے جذب کو کم کر سکتے ہیں؛ خوراک الگ کریں۔",
  },
];

/**
 * Provides severity from the curated rule table. Uses case-insensitive
 * ingredient-name matching because RxNorm ingredient names can vary slightly.
 */
export function findCuratedInteraction(ingredientA: string, ingredientB: string): InteractionEvidence | null {
  const a = ingredientA.toLowerCase();
  const b = ingredientB.toLowerCase();

  for (const rule of RULES) {
    const ra = rule.ingredientA.toLowerCase();
    const rb = rule.ingredientB.toLowerCase();
    if ((a.includes(ra) && b.includes(rb)) || (a.includes(rb) && b.includes(ra))) {
      return {
        severity: rule.severity,
        summary: rule.summary,
        summaryUrdu: rule.summaryUrdu,
        source: "curated-rules",
      };
    }
  }

  return null;
}
