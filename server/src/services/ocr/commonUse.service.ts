import { logger } from "../../utils/logger.js";

const GEMINI_TEXT_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

/**
 * Given a list of medicine names, ask Gemini for a short one-line description
 * of what each medicine is commonly used for. Best-effort: if it fails for
 * any reason, an empty map is returned and the UI simply omits that line.
 */
export async function getCommonUses(drugNames: string[]): Promise<Record<string, string>> {
  const apiKey = process.env.GEMINI_API_KEY;
  const uniqueNames = Array.from(new Set(drugNames.filter((n) => n && n.trim().length > 0)));

  if (!apiKey || uniqueNames.length === 0) {
    return {};
  }

  const prompt =
    "For each of the following medicine names, give a very short (under 8 words) " +
    "plain description of what it is commonly used for. " +
    "Respond with ONLY a single JSON object and absolutely nothing else — " +
    "no markdown, no bullet points, no explanation, no preamble, no code fences. " +
    "Exact format: {\"MedicineName1\": \"short description\", \"MedicineName2\": \"short description\"}. " +
    "Medicines: " +
    uniqueNames.join(", ");

  try {
    const response = await fetch(`${GEMINI_TEXT_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!response.ok) {
      logger.warn("Gemini common-use lookup failed", { status: response.status });
      return {};
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    let raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Strip markdown code fences if present.
    raw = raw.replace(/```json/gi, "").replace(/```/g, "").trim();

    // Extract only the JSON object substring, ignoring any preamble/explanation text.
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      logger.warn("Gemini common-use response had no JSON object", { raw: raw.slice(0, 200) });
      return {};
    }

    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;

    // Only keep string values, and strip any stray markdown bullets/asterisks.
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "string") {
        result[key] = value.replace(/^\*+\s*/, "").replace(/\*\*/g, "").trim();
      }
    }

    return result;
  } catch (err) {
    logger.warn("Gemini common-use lookup failed", { err });
    return {};
  }
}