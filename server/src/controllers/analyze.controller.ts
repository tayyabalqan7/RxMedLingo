import type { RequestHandler } from "express";
import "multer";
import crypto from "node:crypto";
import type { AnalyzeResponse } from "@rxmedlingo/shared";
import { isOcrConfigured } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";
import { extractTextFromImage } from "../services/ocr/ocrSpace.service.js";
import { extractDrugs } from "../services/extraction/drugExtractor.js";
import { normalizeDrugs } from "../services/rxnorm/rxnormNormalizer.js";
import { buildInteractions } from "../services/interactions/interactionEngine.js";
import { buildUrduNarrative } from "../services/urdu/urduNarrative.js";
import { getCommonUses } from "../services/ocr/commonUse.service.js";

export const analyzePrescription: RequestHandler<unknown, AnalyzeResponse | object> = async (
  req,
  res,
  next
) => {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  const timings: Record<string, number> = {};

  try {
    if (!isOcrConfigured) {
      return next(
        new AppError(
          "OCR_NOT_CONFIGURED",
          "ocr",
          503,
          "The prescription scanner is not configured. Please ask the administrator to add an OCR.space API key.",
          "نسخہ اسکینر کنفیگر نہیں ہے۔ براہ کرم منتظم سے OCR.space API key شامل کرنے کے لیے کہیں۔",
          false
        )
      );
    }

    if (!req.file) {
      return next(
        new AppError(
          "NO_IMAGE",
          "upload",
          400,
          "Please upload a prescription image.",
          "براہ کرم نسخے کی تصویر اپلوڈ کریں۔",
          false
        )
      );
    }

    const ocrStart = Date.now();
    const { text, confidence } = await extractTextFromImage(req.file.buffer);
    timings.ocr = Date.now() - ocrStart;

    if (!text || text.trim().length === 0) {
      return next(
        new AppError(
          "OCR_NO_TEXT",
          "ocr",
          422,
          "We could not read any text from this image. Please make sure the prescription is well-lit, flat, and fills the frame.",
          "اس تصویر سے کوئی متن نہیں پڑھا جا سکا۔ براہ کرم یقینی بنائیں کہ نسخہ روشن ہے، چپٹا ہے، اور فریم میں پوری طرح آتا ہے۔",
          true
        )
      );
    }

    const extractStart = Date.now();
    const extracted = extractDrugs(text);
    timings.extraction = Date.now() - extractStart;

    const normStart = Date.now();
    const { drugs: normalized, warnings: normalizationWarnings } = await normalizeDrugs(extracted);
    timings.normalization = Date.now() - normStart;

    const commonUseStart = Date.now();
    const commonUseMap = await getCommonUses(normalized.map((d) => d.matchedName));
    timings.commonUse = Date.now() - commonUseStart;

    const interactStart = Date.now();
    const { interactions, duplicates, warnings: interactionWarnings, sourceDegraded } = await buildInteractions(normalized);
    timings.interaction = Date.now() - interactStart;

    const narrativeStart = Date.now();
    const urduNarrative = buildUrduNarrative(normalized, interactions, duplicates);
    timings.narrative = Date.now() - narrativeStart;

    timings.total = Date.now() - startTime;

    const response: AnalyzeResponse = {
      requestId,
      drugs: normalized.map((d) => ({
        id: d.id,
        rawText: d.rawText,
        matchedName: d.matchedName,
        rxcui: d.rxcui,
        confidence: d.confidence,
        ingredients: d.ingredients,
        isCombination: d.isCombination,
        dosage: d.dosage,
        commonUse: commonUseMap[d.matchedName] ?? null,
      })),
      interactions,
      duplicates,
      urduNarrative,
      warnings: [...normalizationWarnings, ...interactionWarnings],
      meta: {
        ocrConfidence: confidence,
        stageTimingsMs: timings,
        interactionSourceDegraded: sourceDegraded,
      },
    };

    logger.info("Analysis completed", { requestId, drugCount: response.drugs.length, interactionCount: response.interactions.length });
    res.json(response);
  } catch (err) {
    logger.error("Analysis failed", { requestId, err });
    next(err);
  }
};