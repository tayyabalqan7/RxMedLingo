import { Router } from "express";
import { isOcrConfigured, isTtsConfigured } from "../config/env.js";

const router = Router();

router.get("/", (_req, res) => {
  const response = {
    status: "ok" as const,
    ocrConfigured: isOcrConfigured,
    ttsConfigured: isTtsConfigured,
    interactionProvider: "openfda+curated",
  };
  res.json(response);
});

export { router as healthRouter };
