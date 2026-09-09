import { PrismaClient } from "@prisma/client";
import { resolvePrismaDatabaseUrl } from "@/lib/prisma-database-url";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const configuredDatabaseUrl =
  process.env.NETLIFY_DB_URL || process.env.DATABASE_URL;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(configuredDatabaseUrl
      ? { datasourceUrl: resolvePrismaDatabaseUrl().url }
      : {}),
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
