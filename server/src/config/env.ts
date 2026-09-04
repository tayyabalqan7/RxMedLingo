import { z } from "zod";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from the monorepo root so one file configures both server and web.
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

/**
 * Central environment configuration. All API keys are read here.
 *
 * API KEY PLACEHOLDERS: see rxmedlingo/.env.example
 *   - OCR_SPACE_API_KEY            => .env.example L5
 *   - RESPONSIVEVOICE_API_KEY      => .env.example L10
 *   - RESPONSIVEVOICE_API_SECRET   => .env.example L11
 *   - OPENFDA_API_KEY              => .env.example L20
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(5000),

  // Required for OCR. Replace placeholder from .env.example L5.
  OCR_SPACE_API_KEY: z.string().min(1, "OCR_SPACE_API_KEY is required"),

  // Required for Urdu TTS. Replace placeholder from .env.example L10.
  // Secret is optional; some accounts only provide a single key.
  RESPONSIVEVOICE_API_KEY: z.string().min(1, "RESPONSIVEVOICE_API_KEY is required"),
  RESPONSIVEVOICE_API_SECRET: z.string().optional(),

  // Optional openFDA key. Blank is valid; see .env.example L20.
  OPENFDA_API_KEY: z.string().optional(),

  // ResponsiveVoice voice name for Urdu. See .env.example L16.
  RESPONSIVEVOICE_URDU_VOICE: z.string().default("Urdu Female"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // In development we still want the server to boot so the UI can render the
  // "API key not configured" state. In production/test we fail fast.
  if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "test") {
    console.error("Invalid environment variables:", parsed.error.format());
    process.exit(1);
  }
}

const data = parsed.success ? parsed.data : ({} as z.infer<typeof envSchema>);

export const env = {
  NODE_ENV: data.NODE_ENV ?? "development",
  PORT: data.PORT ?? 5000,
  OCR_SPACE_API_KEY: data.OCR_SPACE_API_KEY ?? "",
  RESPONSIVEVOICE_API_KEY: data.RESPONSIVEVOICE_API_KEY ?? "",
  RESPONSIVEVOICE_API_SECRET: data.RESPONSIVEVOICE_API_SECRET ?? "",
  OPENFDA_API_KEY: data.OPENFDA_API_KEY ?? "",
  RESPONSIVEVOICE_URDU_VOICE: data.RESPONSIVEVOICE_URDU_VOICE ?? "Urdu Female",
};

const placeholderOcr = "YOUR_OCR_SPACE_API_KEY_HERE";
const placeholderRvKey = "YOUR_RESPONSIVEVOICE_API_KEY_HERE";

export const isOcrConfigured = Boolean(
  env.OCR_SPACE_API_KEY && env.OCR_SPACE_API_KEY !== placeholderOcr
);
export const isTtsConfigured = Boolean(
  env.RESPONSIVEVOICE_API_KEY && env.RESPONSIVEVOICE_API_KEY !== placeholderRvKey
);
