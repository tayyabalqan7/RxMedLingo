import { Router } from "express";
import { analyzePrescription } from "../controllers/analyze.controller.js";
import { handleMulterError, uploadSingleImage } from "../middleware/upload.middleware.js";

const router = Router();

router.post("/", (req, res, next) => {
  uploadSingleImage(req, res, (err) => {
    if (err) {
      next(handleMulterError(err));
      return;
    }
    analyzePrescription(req, res, next);
  });
});

export { router as analyzeRouter };
