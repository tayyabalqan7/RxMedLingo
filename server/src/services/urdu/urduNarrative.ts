import type { DrugResult, InteractionResult, DuplicateResult } from "@rxmedlingo/shared";

const severityUrdu: Record<string, string> = {
  red: "سنگین",
  amber: "احتیاط",
  green: "محفوظ",
};

/**
 * Build a simple, spoken Urdu explanation of the prescription results.
 */
export function buildUrduNarrative(
  drugs: Pick<DrugResult, "matchedName" | "dosage">[],
  interactions: InteractionResult[],
  duplicates: DuplicateResult[]
): string {
  const parts: string[] = [];

  parts.push("آر ایکس میڈ لنگو کی رپورٹ۔");

  if (drugs.length === 0) {
    parts.push("کوئی دوا نہیں ملی۔");
    return parts.join(" ");
  }

  parts.push(`مجموعی طور پر ${drugs.length} دوائیں ملیں۔`);

  for (const drug of drugs) {
    const dosageParts = [drug.dosage.strength, drug.dosage.frequency, drug.dosage.duration].filter(Boolean);
    const dosageText = dosageParts.length > 0 ? `، ${dosageParts.join("، ")}` : "";
    parts.push(`${drug.matchedName}${dosageText}۔`);
  }

  if (duplicates.length > 0) {
    parts.push("خبردار: درج ذیل دوائیں ایک ہی Ingredient پر مشتمل ہیں۔");
    for (const dup of duplicates) {
      parts.push(`${dup.ingredient}، ${dup.products.join(" اور ")} میں موجود ہے۔ ${dup.messageUrdu}`);
    }
  }

  if (interactions.length > 0) {
    parts.push("مندرجہ ذیل دوائی تعاملات نوٹ کریں۔");
    for (const interaction of interactions) {
      parts.push(
        `${severityUrdu[interaction.severity] || interaction.severity}: ${interaction.drugA} اور ${interaction.drugB}۔ ${interaction.summaryUrdu}`
      );
    }
  }

  if (duplicates.length === 0 && interactions.length === 0) {
    parts.push("کوئی واضح خطرہ والا تعامل یا ڈپلیکیٹ دوا نہیں ملی۔");
  }

  parts.push("یاد رکھیں، یہ صرف معلوماتی ہے۔ ہمیشہ اپنے ڈاکٹر یا فارماسسٹ سے مشورہ کریں۔");

  return parts.join(" ");
}
