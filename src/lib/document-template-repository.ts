import { prisma } from "@/lib/prisma";
import {
  DocumentTemplateDefinitionSchema,
  type DocumentTemplateDefinition,
} from "@/lib/definitions";

/**
 * 게시 시 최소 구조: `DocumentTemplateDefinition`(정의서 스키마) 충족 + 섹션 ≥1 + 전체 문단 ≥1.
 * 편집기(`document-template-editor`) 트리와 동일한 `definitionJson` 기준.
 */
export function getDocumentTemplatePublishBlockerMessage(definitionJson: unknown): string | null {
  const parsed = DocumentTemplateDefinitionSchema.safeParse(definitionJson);
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
  const item = await prisma.documentTemplate.findFirst({
    where: {
      code,
      version,
      catalogStatus: "PUBLISHED",
    },
  });

  if (!item) return null;

  return item.definitionJson as DocumentTemplateDefinition;
}
