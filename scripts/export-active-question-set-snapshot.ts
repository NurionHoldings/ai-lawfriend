/**
 * One-off / evidence: export active QuestionSet row (same selection as getActiveQuestionSetRepository).
 * Usage: DATABASE_URL=... npx tsx scripts/export-active-question-set-snapshot.ts
 */
import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  try {
    const row = await prisma.questionSet.findFirst({
      where: { isActive: true },
      orderBy: [{ updatedAt: "desc" }],
    });
    console.log(JSON.stringify(row, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(String(e));
  process.exit(1);
});
