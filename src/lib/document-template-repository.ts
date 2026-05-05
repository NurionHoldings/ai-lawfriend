import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import {
  DocumentTemplateDefinitionSchema,
  type DocumentTemplateDefinition,
} from "@/lib/definitions";

export type PublishedDocumentTemplateRecord = Prisma.DocumentTemplateGetPayload<{
  include: {
    source: true;
  };
}>;

export function getDocumentTemplateDefinitionFromRecord(item: {
  definitionJson: unknown;
}): DocumentTemplateDefinition | null {
  const parsed = DocumentTemplateDefinitionSchema.safeParse(item.definitionJson);
  return parsed.success ? parsed.data : null;
}

export function getDocumentTemplateSourceBlockerMessage(params: {
  sourceProvider?: string | null;
  sourceId?: string | null;
  sourceUrl?: string | null;
}): string | null {
  const provider = params.sourceProvider ?? "INTERNAL_STANDARD";

  if (provider === "INTERNAL_STANDARD") {
    return null;
  }

  if (!params.sourceId) {
    return "게시를 막았습니다: 공식서식 기반 템플릿은 LegalFormSource 연결이 필요합니다.";
  }

  if (!params.sourceUrl) {
    return "게시를 막았습니다: 공식서식 기반 템플릿은 출처 URL이 필요합니다.";
  }

  return null;
}

/**
 * 게시 시 최소 구조: `DocumentTemplateDefinition`(정의서 스키마) 충족 + 섹션 ≥1 + 전체 문단 ≥1.
 * 편집기(`document-template-editor`) 트리와 동일한 `definitionJson` 기준.
 */
export function getDocumentTemplatePublishBlockerMessage(params: {
  definitionJson: unknown;
}): string | null {
  const parsed = DocumentTemplateDefinitionSchema.safeParse(params.definitionJson);
  if (!parsed.success) {
    return "게시를 막았습니다: 저장된 정의가 템플릿 스키마와 맞지 않습니다. 편집기에서 항목을 고친 뒤 「저장」하고 다시 게시해 주세요. (저장하지 않은 화면만 고치면 서버 검사에 반영되지 않습니다.)";
  }
  const { sections } = parsed.data;
  if (sections.length < 1) {
    return "게시를 막았습니다: 섹션이 1개 이상 있어야 합니다. 섹션을 추가한 뒤 「저장」하고 다시 게시해 주세요.";
  }
  const paragraphTotal = sections.reduce((acc, s) => acc + s.paragraphs.length, 0);
  if (paragraphTotal < 1) {
    return "게시를 막았습니다: 문단이 최소 1개 이상(어느 섹션에든) 있어야 합니다. 문단을 추가한 뒤 「저장」하고 다시 게시해 주세요.";
  }
  return null;
}

export async function getDocumentTemplateDefinitionByCodeVersion(
  code: string,
  version: string,
): Promise<DocumentTemplateDefinition | null> {
  const item = await getPublishedDocumentTemplateByCodeVersion(code, version);

  if (!item) return null;

  return getDocumentTemplateDefinitionFromRecord(item);
}

export async function getPublishedDocumentTemplateByCodeVersion(
  code: string,
  version: string,
): Promise<PublishedDocumentTemplateRecord | null> {
  return prisma.documentTemplate.findFirst({
    where: {
      code,
      version,
      catalogStatus: "PUBLISHED",
    },
    include: {
      source: true,
    },
  });
}
