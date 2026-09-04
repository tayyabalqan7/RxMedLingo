import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { healthRouter } from "./routes/health.route.js";
import { analyzeRouter } from "./routes/analyze.route.js";
import { speechRouter } from "./routes/speech.route.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiRateLimiter } from "./middleware/rateLimit.middleware.js";

export function createApp() {
  const app = express();

  // 
  app.use(helmet());  

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

  app.use("/api", apiRateLimiter);
  app.use("/api/health", healthRouter);
  app.use("/api/analyze", analyzeRouter);
  app.use("/api/speech", speechRouter);

  app.get("/", (_req, res) => {
    res.json({ name: "RxMedLingo API", status: "ok" });
  });

  app.use(errorHandler);

  return app;
}
