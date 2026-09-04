import { env } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";
import { fetchWithRetry } from "../../utils/fetchWithRetry.js";
import { logger } from "../../utils/logger.js";
import type { SpeechResponse } from "@rxmedlingo/shared";

const RV_BASE = "https://texttospeech.responsivevoice.org/v2";

/**
 * Synthesize Urdu speech using the ResponsiveVoice API v2.
 *
 * API KEY: see rxmedlingo/.env.example L10
 * API SECRET (optional): see rxmedlingo/.env.example L11
 * VOICE: see rxmedlingo/.env.example L17
 */
export async function synthesizeSpeech(text: string, _languageCode?: string): Promise<SpeechResponse> {
  const voice = env.RESPONSIVEVOICE_URDU_VOICE;

  const body = JSON.stringify({
    text,
    voice,
    format: "mp3",
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-API-Key": env.RESPONSIVEVOICE_API_KEY,
  };
  if (env.RESPONSIVEVOICE_API_SECRET) {
    headers["X-API-Secret"] = env.RESPONSIVEVOICE_API_SECRET;
  }

  const response = await fetchWithRetry(
    `${RV_BASE}/text:synthesize`,
    {
      method: "POST",
      headers,
      body,
    },
    { timeoutMs: 20000, retries: 1 }
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    logger.error("ResponsiveVoice request failed", { status: response.status, body: errorText });

    if (response.status === 401 || response.status === 403) {
      throw new AppError(
        "TTS_AUTH_ERROR",
        "tts",
        503,
        "The audio feature is not authorized. Please check your ResponsiveVoice API credentials.",
        "آڈیو فیچر مجاز نہیں ہے۔ براہ کرم ResponsiveVoice API credentials چیک کریں۔",
        false
      );
    }
    if (response.status === 429) {
      throw new AppError(
        "TTS_RATE_LIMIT",
        "tts",
        503,
        "The audio service is temporarily busy. Please try again in a moment.",
        "آڈیو سروس عارضی طور پر مصروف ہے۔ براہ کرم کچھ دیر بعد دوبارہ کوشش کریں۔",
        true
      );
    }
    throw new AppError(
      "TTS_API_ERROR",
      "tts",
      503,
      "The audio service is unavailable. Please try again later.",
      "آڈیو سروس دستیاب نہیں ہے۔ براہ کرم بعد میں دوبارہ کوشش کریں۔",
      true
    );
  }

  // ResponsiveVoice v2 returns the MP3 audio bytes directly on success.
  const audioBuffer = Buffer.from(await response.arrayBuffer());
  if (audioBuffer.length === 0) {
    throw new AppError(
      "TTS_EMPTY_RESPONSE",
      "tts",
      503,
      "The audio service returned an empty response.",
      "آڈیو سروس نے خالی جواب دیا۔",
      true
    );
  }

  return {
    audioContent: audioBuffer.toString("base64"),
    languageCode: "ur",
    voiceName: voice,
  };
}
