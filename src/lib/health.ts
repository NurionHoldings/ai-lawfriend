import { prisma } from "@/lib/prisma";

export async function getHealthStatus() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      ok: true as const,
      status: "ok" as const,
      ts: new Date().toISOString(),
    };
  } catch {
    return {
      ok: false as const,
      status: "db_error" as const,
      ts: new Date().toISOString(),
    };
  }
}
