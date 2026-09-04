import multer from "multer";
import { AppError } from "../utils/AppError.js";

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 8;

/**
 * In-memory multer instance. Files are kept as buffers and passed directly to
 * OCR.space; nothing is written to disk.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_SIZE_MB * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      
      const errorMessage = `Only ${ALLOWED_MIMES.map((m) => m.replace("image/", "")).join(", ")} images are supported.`;
      cb(new Error(errorMessage) as any, false);
    }
  },
});

export const uploadSingleImage = upload.single("image");

/**
 * Wrap multer errors into AppError so the central handler can serialize them.
 */
export function handleMulterError(err: unknown): AppError {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return new AppError(
        "FILE_TOO_LARGE",
        "upload",
        413,
        `Image must be smaller than ${MAX_SIZE_MB} MB.`,
        `تصویر ${MAX_SIZE_MB} MB سے چھوٹی ہونی چاہیے۔`,
        false
      );
    }
    return new AppError(
      "UPLOAD_ERROR",
      "upload",
      400,
      "There was a problem uploading the image.",
      "تصویر اپلوڈ کرنے میں مسئلہ ہوا۔",
      true
    );
  }

  if (err instanceof AppError) return err;

  return new AppError(
    "UPLOAD_ERROR",
    "upload",
    400,
    "There was a problem uploading the image.",
    "تصویر اپلوڈ کرنے میں مسئلہ ہوا۔",
    true
  );
}
