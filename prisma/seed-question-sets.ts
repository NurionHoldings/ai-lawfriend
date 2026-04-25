import { Prisma, type PrismaClient, QuestionSetStatus } from "@prisma/client";
import { buildValidatedAQuestionsForQuestionSet } from "@/features/question-set/apply-definition-to-questions";
import { STATEMENT_DEFAULT_QUESTION_SET_V1 } from "@/lib/definitions/question-set.sample";

/** B §3.1 / [345] — `code`로 멱등(재실행 시 행 1개만 유지·내용은 샘플 정의로 수렴) */
export const DEFAULT_QUESTION_SET_CODE = "STATEMENT_DEFAULT_V1";

/**
 * [345] `publish`/`PATCH` 미호출 — HTTP 게시·재게시 경로와 직교.
 * `definitionJson` + A안 `questions` 는 (β) `buildValidatedAQuestionsForQuestionSet`로 publish와 동일 투영.
 */
export async function seedQuestionSets(client: PrismaClient): Promise<void> {
  const def = STATEMENT_DEFAULT_QUESTION_SET_V1;
  const existing = await client.questionSet.findFirst({
    where: { code: DEFAULT_QUESTION_SET_CODE },
  });

  const backfillContext = (id: string) => ({
    id,
    name: def.title,
    code: def.code,
    description: def.description ?? null,
    isActive: true,
  });

  const questions = buildValidatedAQuestionsForQuestionSet(
    def,
    backfillContext(existing?.id ?? "seed-question-set-new"),
  );

  const data: Prisma.QuestionSetUpdateInput = {
    name: def.title,
    code: def.code,
    description: def.description ?? null,
    isActive: true,
    version: def.version,
    catalogStatus: QuestionSetStatus.DRAFT,
    publishedAt: null,
    supportedDocumentTypes: def.supportedDocumentTypes as Prisma.InputJsonValue,
    visibleToRoles: def.visibleToRoles as Prisma.InputJsonValue,
    definitionJson: def as unknown as Prisma.InputJsonValue,
    questions: questions as unknown as Prisma.InputJsonValue,
  };

  if (existing) {
    await client.questionSet.update({
      where: { id: existing.id },
      data,
    });
  } else {
    await client.questionSet.create({
      data: {
        name: def.title,
        code: def.code,
        description: def.description ?? null,
        isActive: true,
        version: def.version,
        catalogStatus: QuestionSetStatus.DRAFT,
        publishedAt: null,
        supportedDocumentTypes: def.supportedDocumentTypes as Prisma.InputJsonValue,
        visibleToRoles: def.visibleToRoles as Prisma.InputJsonValue,
        definitionJson: def as unknown as Prisma.InputJsonValue,
        questions: questions as unknown as Prisma.InputJsonValue,
      },
    });
  }
}
