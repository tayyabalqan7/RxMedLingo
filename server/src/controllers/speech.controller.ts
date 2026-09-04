import type { RequestHandler } from "express";
import { z } from "zod";
import { AppError } from "../utils/AppError.js";
import { synthesizeSpeech } from "../services/tts/responsiveVoice.service.js";
import type { SpeechRequest, SpeechResponse } from "@rxmedlingo/shared";

const speechRequestSchema = z.object({
  text: z.string().min(1).max(5000),
  languageCode: z.string().optional(),
});

export const synthesizeUrdu: RequestHandler<unknown, SpeechResponse | object, SpeechRequest> = async (req, res, next) => {
  try {
    const parsed = speechRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(
        new AppError(
          "INVALID_SPEECH_REQUEST",
          "tts",
          400,
          "Please provide text to speak.",
          "براہ کرم بولنے کے لیے متن فراہم کریں۔",
          false
        )
      );
    }

    const result = await synthesizeSpeech(parsed.data.text, parsed.data.languageCode);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
