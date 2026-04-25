import type { DocumentTemplateType } from "@/features/question-set/question-set.types";
import type { DraftPreviewParagraph } from "./document-draft.types";

function templateLabel(templateType: DocumentTemplateType) {
  switch (templateType) {
    case "STATEMENT":
      return "진술서";
    case "LEGAL_OPINION":
      return "의견서";
    case "CONSULTATION_NOTE":
      return "상담기록서";
    default:
      return "문서";
  }
}

export function buildParagraphRewriteInstructions(params: {
  templateType: DocumentTemplateType;
}) {
  return [
    "당신은 법률 문서 작성 보조 AI다.",
    "역할은 문단 재작성 보조이며, 최종 판단이나 법적 확정 표현은 하지 않는다.",
    "입력된 문단의 의미를 유지하면서 더 정돈된 문장으로 재작성한다.",
    "추정 사실, 새로운 사실, 없는 증거, 단정적 법률결론을 임의 추가하지 않는다.",
    "출력은 문단 본문 텍스트만 반환한다.",
    `현재 문서 유형은 ${templateLabel(params.templateType)}다.`,
  ].join(" ");
}

export function buildParagraphRewriteInput(params: {
  templateType: DocumentTemplateType;
  title: string;
  paragraph: DraftPreviewParagraph;
  userInstruction?: string | null;
}) {
  return [
    `문서 유형: ${templateLabel(params.templateType)}`,
    `문서 제목: ${params.title}`,
    `문단 ID: ${params.paragraph.id}`,
    `섹션 제목: ${params.paragraph.sectionTitle ?? ""}`,
    `문단 라벨: ${params.paragraph.label ?? ""}`,
    `문단 형식: ${params.paragraph.format}`,
    `질문 키: ${params.paragraph.sourceQuestionKey}`,
    `현재 문단 내용:\n${params.paragraph.content}`,
    `추가 지시:\n${params.userInstruction ?? "없음"}`,
    "요청: 위 문단만 더 정돈된 한국어 문체로 재작성하되, 사실관계와 의미를 바꾸지 말고 새 정보는 추가하지 마라.",
  ].join("\n\n");
}
