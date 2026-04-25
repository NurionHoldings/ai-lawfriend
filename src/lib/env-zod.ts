import { z } from "zod";

const productionEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  CRON_SECRET: z.string().min(16),
});

/**
 * 배포 점검용(선택). 레이아웃에서 전역 import하지 마세요.
 */
export function parseProductionEnv() {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  return productionEnvSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    CRON_SECRET: process.env.CRON_SECRET,
  });
}
