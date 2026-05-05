import { PrismaClient } from "@prisma/client";

export async function seedLegalFormSources(prisma: PrismaClient) {
  await prisma.legalFormSource.upsert({
    where: { id: "internal-standard-source" },
    update: {
      provider: "INTERNAL_STANDARD",
      sourceName: "AI법친 내부 표준 문서 템플릿",
      sourceUrl: "INTERNAL_STANDARD",
      documentType: "INTERNAL_STANDARD",
      status: "ACTIVE",
      memo: "Phase 1 기준: 공식기관 원문 연결 전 기존 템플릿의 안전한 기본 출처 표기용",
    },
    create: {
      id: "internal-standard-source",
      provider: "INTERNAL_STANDARD",
      sourceName: "AI법친 내부 표준 문서 템플릿",
      sourceUrl: "INTERNAL_STANDARD",
      documentType: "INTERNAL_STANDARD",
      status: "ACTIVE",
      memo: "Phase 1 기준: 공식기관 원문 연결 전 기존 템플릿의 안전한 기본 출처 표기용",
    },
  });
}