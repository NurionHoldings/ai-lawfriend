/**
 * B §3 / §4.2: 기존 `QuestionSet` 행에 대해 `definitionJson` → A안 `questions` 만 갱신한다.
 * - (β) `buildValidatedAQuestionsForQuestionSet` 재사용 — `publish` HTTP **호출 없음**
 * - `catalogStatus` / `publishedAt` 은 **건드리지 않음** (백필 = 비게시 궤도 보정)
 * - 멱등: 같은 `definitionJson`이면 투영 결과가 동일
 *
 * 사용: npx tsx src/scripts/backfill-question-set-questions.ts
 *      npx tsx src/scripts/backfill-question-set-questions.ts --id=<questionSetId>
 *      npx tsx src/scripts/backfill-question-set-questions.ts --dry-run
 */
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildValidatedAQuestionsForQuestionSet } from "@/features/question-set/apply-definition-to-questions";

const qSelect = {
  id: true,
  name: true,
  code: true,
  description: true,
  isActive: true,
  definitionJson: true,
  questions: true,
} as const;

function argValue(prefix: string): string | null {
  const a = process.argv.find((s) => s.startsWith(prefix));
  if (!a) return null;
  const v = a.slice(prefix.length);
  return v.trim() ? v : null;
}

async function main() {
  const idFilter = argValue("--id=");
  const dryRun = process.argv.includes("--dry-run");

  const rows = idFilter
    ? await prisma.questionSet.findMany({
        where: { id: idFilter },
        select: qSelect,
      })
    : await prisma.questionSet.findMany({
        select: qSelect,
        orderBy: { updatedAt: "desc" },
      });

  if (idFilter && rows.length === 0) {
    console.error(`[backfill-question-set-questions] id not found: ${idFilter}`);
    process.exit(1);
  }

  let updated = 0;
  for (const row of rows) {
    const next = buildValidatedAQuestionsForQuestionSet(row.definitionJson, {
      id: row.id,
      name: row.name,
      code: row.code,
      description: row.description,
      isActive: row.isActive,
    });
    const same =
      JSON.stringify(row.questions) === JSON.stringify(next);
    if (same) {
      console.log(
        `[skip] id=${row.id} name=${row.name} (questions already match projection)`,
      );
      continue;
    }
    if (dryRun) {
      console.log(
        `[dry-run] id=${row.id} name=${row.name} would set ${next.length} question(s)`,
      );
      continue;
    }
    await prisma.questionSet.update({
      where: { id: row.id },
      data: { questions: next as unknown as Prisma.InputJsonValue },
    });
    updated += 1;
    console.log(`[ok] id=${row.id} name=${row.name} questions=${next.length}`);
  }

  console.log(
    `[backfill-question-set-questions] done updated=${updated} total=${rows.length} dryRun=${dryRun}`,
  );
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
