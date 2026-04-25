import type { DocumentTemplateType } from "@/features/question-set/question-set.types";
import type { DocumentTemplateConfig } from "./document-template.types";

export const DOCUMENT_TEMPLATE_CONFIG: Record<DocumentTemplateType, DocumentTemplateConfig> = {
  STATEMENT: {
    type: "STATEMENT",
    titleSuffix: "진술서",
    defaultSections: [
      "1. 인적사항",
      "2. 사건 개요",
      "3. 사실관계",
      "4. 피해 및 영향",
      "5. 요청사항",
    ],
  },
  LEGAL_OPINION: {
    type: "LEGAL_OPINION",
    titleSuffix: "의견서",
    defaultSections: [
      "1. 사건 개요",
      "2. 기초 사실관계",
      "3. 법률상 쟁점",
      "4. 검토 의견",
      "5. 결론",
    ],
  },
  CONSULTATION_NOTE: {
    type: "CONSULTATION_NOTE",
    titleSuffix: "상담기록서",
    defaultSections: [
      "1. 상담 기본정보",
      "2. 상담 요청 내용",
      "3. 사실관계 요약",
      "4. 안내 및 설명",
      "5. 후속 조치",
    ],
  },
};
