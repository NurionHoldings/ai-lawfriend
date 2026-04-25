type LoggerMeta = Record<string, unknown>;

const currentLevel = process.env.LOG_LEVEL || "info";
const rank: Record<"debug" | "info" | "warn" | "error", number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function shouldLog(level: "debug" | "info" | "warn" | "error") {
  return rank[level] >= rank[(currentLevel as keyof typeof rank) || "info"];
}

function write(
  level: "debug" | "info" | "warn" | "error",
  message: string,
  meta?: LoggerMeta,
) {
  if (!shouldLog(level)) return;

  const payload = {
    level,
    message,
    ...meta,
    ts: new Date().toISOString(),
  };

  if (level === "error") {
    console.error(JSON.stringify(payload));
    return;
  }

  if (level === "warn") {
    console.warn(JSON.stringify(payload));
    return;
  }

  if (level === "debug") {
    console.debug(JSON.stringify(payload));
    return;
  }

  console.log(JSON.stringify(payload));
}

export const logger = {
  debug(message: string, meta?: LoggerMeta) {
    write("debug", message, meta);
  },
  info(message: string, meta?: LoggerMeta) {
    write("info", message, meta);
  },
  warn(message: string, meta?: LoggerMeta) {
    write("warn", message, meta);
  },
  error(message: string, meta?: LoggerMeta) {
    write("error", message, meta);
  },
};
