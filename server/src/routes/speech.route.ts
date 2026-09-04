import { Router } from "express";
import { synthesizeUrdu } from "../controllers/speech.controller.js";

const router = Router();

router.post("/", synthesizeUrdu);

export { router as speechRouter };
