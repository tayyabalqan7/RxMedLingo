import { createApp } from "./app.js";
import { env, isOcrConfigured, isTtsConfigured } from "./config/env.js";
import { logger } from "./utils/logger.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`RxMedLingo API listening on port ${env.PORT}`, {
    environment: env.NODE_ENV,
    ocrConfigured: isOcrConfigured,
    ttsConfigured: isTtsConfigured,
  });
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  server.close(() => process.exit(0));
});
