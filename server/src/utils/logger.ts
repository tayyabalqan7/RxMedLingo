/**
 * Tiny structured logger. In production we emit JSON; in development, pretty strings.
 */
export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    log("info", message, meta);
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    log("warn", message, meta);
  },
  error: (message: string, meta?: Record<string, unknown>) => {
    log("error", message, meta);
  },
};

function log(level: "info" | "warn" | "error", message: string, meta?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "production") {
    console.log(JSON.stringify({ level, message, ...meta, timestamp: new Date().toISOString() }));
  } else {
    const prefix = `[${new Date().toLocaleTimeString()}] ${level.toUpperCase()}`;
    if (meta && Object.keys(meta).length > 0) {
      console.log(prefix, message, meta);
    } else {
      console.log(prefix, message);
    }
  }
}
