type RequiredEnvKey =
  | "DATABASE_URL"
  | "JWT_SECRET"
  | "CRON_SECRET"
  | "NEXT_PUBLIC_APP_VERSION";

function readEnv(key: RequiredEnvKey): string {
  const value = process.env[key];
  if (!value || !value.trim()) {
    if (
      process.env.NODE_ENV !== "production" &&
      key === "NEXT_PUBLIC_APP_VERSION"
    ) {
      return "dev";
    }
    throw new Error(`Missing required env: ${key}`);
  }
  return value;
}

/** 서버에서 필요 시점에 접근(게터). import 시점에 전부 검증하지 않습니다. */
export const env = {
  get DATABASE_URL() {
    return readEnv("DATABASE_URL");
  },
  get JWT_SECRET() {
    return readEnv("JWT_SECRET");
  },
  get CRON_SECRET() {
    return readEnv("CRON_SECRET");
  },
  get NEXT_PUBLIC_APP_VERSION() {
    return readEnv("NEXT_PUBLIC_APP_VERSION");
  },
  get APP_ENV() {
    return process.env.NEXT_PUBLIC_APP_ENV || "development";
  },
  get APP_BASE_URL() {
    return process.env.APP_BASE_URL || "http://localhost:3000";
  },
  get SENTRY_DSN() {
    return process.env.SENTRY_DSN || "";
  },
  get LOG_LEVEL() {
    return process.env.LOG_LEVEL || "info";
  },
};
