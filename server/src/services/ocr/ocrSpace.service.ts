import { AppError } from "../../utils/AppError.js";
import { logger } from "../../utils/logger.js";

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

/**
 * Extract text from an image buffer using Google Gemini vision model.
 *
 * API KEY: add GEMINI_API_KEY to rxmedlingo/.env
 */
export async function extractTextFromImage(buffer: Buffer): Promise<{ text: string; confidence: number }> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new AppError(
      "OCR_AUTH_ERROR",
      "ocr",
      503,
      "The prescription scanner is not authorized. Please check the Gemini API key.",
      "نسخہ اسکینر مجاز نہیں ہے۔ براہ کرم Gemini API key چیک کریں۔",
      false
    );
  }

  const base64Image = buffer.toString("base64");

    const prompt =
    "This is a photo of a handwritten or printed medical prescription. " +
    "Carefully read it and extract ONLY the actual medicine names and their dosages/instructions. " +
    "Completely ignore and do NOT include: clinic names, clinic logos or slogans, doctor names, " +
    "doctor qualifications (MBBS, MD, etc.), patient name, registration numbers, dates, addresses, " +
    "phone numbers, diagnosis or symptoms (e.g. 'Renal Calculus', 'Motions', vitals like BP or temperature), " +
    "and any advice or follow-up instructions that are not medicines. " +
    "Output ONLY one medicine per line, in the format: MedicineName Dosage (if visible). " +
    "If you are unsure about a word, make your best guess based on common medicine names — " +
    "do not output clinic slogans or non-medicine text as if they were medicines. " +
    "If no medicines are found, output nothing.";

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: "image/png",
              data: base64Image,
            },
          },
        ],
      },
    ],
  };

  let response: Response;
  try {
    response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
  } catch (err) {
    logger.error("Gemini request failed", { error: err });
    throw new AppError(
      "OCR_API_ERROR",
      "ocr",
      503,
      "The scanner service is unavailable. Please try again later.",
      "اسکین سروس دستیاب نہیں ہے۔ براہ کرم بعد میں دوبارہ کوشش کریں۔",
      true
    );
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    logger.error("Gemini returned an error", { status: response.status, errorText });

    if (response.status === 401 || response.status === 403) {
      throw new AppError(
        "OCR_AUTH_ERROR",
        "ocr",
        503,
        "The prescription scanner is not authorized. Please check the Gemini API key.",
        "نسخہ اسکینر مجاز نہیں ہے۔ براہ کرم Gemini API key چیک کریں۔",
        false
      );
    }

    throw new AppError(
      "OCR_API_ERROR",
      "ocr",
      503,
      "The scanner could not read the image. Please try again with a clearer photo.",
      "اسکینر تصویر نہیں پڑھ سکا۔ براہ کرم واضح تصویر کے ساتھ دوبارہ کوشش کریں۔",
      true
    );
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const confidence = text.trim().length > 0 ? 90 : 0;

  return { text, confidence };
}