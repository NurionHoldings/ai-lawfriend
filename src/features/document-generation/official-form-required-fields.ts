export type SupportedOfficialFormDocumentType =
  | "STATEMENT"
  | "OPINION"
  | "CONSULT_NOTE";

export type OfficialFormRequiredFieldSeverity = "BLOCKING" | "WARNING";

export type OfficialFormRequiredField = {
  documentType: SupportedOfficialFormDocumentType;
  fieldKey: string;
  label: string;
  severity: OfficialFormRequiredFieldSeverity;
  questionKeys: string[];
  description?: string;
};

export type MissingOfficialFormField = {
  fieldKey: string;
  label: string;
  severity: OfficialFormRequiredFieldSeverity;
  suggestedQuestions: string[];
};

export const OFFICIAL_FORM_REQUIRED_FIELD_REGISTRY: Record<
  SupportedOfficialFormDocumentType,
  OfficialFormRequiredField[]
> = {
  STATEMENT: [
    {
      documentType: "STATEMENT",
      fieldKey: "statement.incident_date",
      label: "사건 발생일",
      severity: "BLOCKING",
      questionKeys: ["incident_date"],
      description: "진술서에 반영할 사건 발생일을 입력해 주세요.",
    },
    {
      documentType: "STATEMENT",
      fieldKey: "statement.incident_place",
      label: "사건 발생 장소",
      severity: "BLOCKING",
      questionKeys: ["incident_place"],
      description: "진술서에 반영할 사건 발생 장소를 입력해 주세요.",
    },
    {
      documentType: "STATEMENT",
      fieldKey: "statement.incident_timeline",
      label: "사건 경위",
      severity: "BLOCKING",
      questionKeys: ["incident_timeline"],
      description: "사건 경위를 시간순으로 자세히 입력해 주세요.",
    },
    {
      documentType: "STATEMENT",
      fieldKey: "statement.witness_detail",
      label: "목격자/증거 보강 정보",
      severity: "WARNING",
      questionKeys: ["witness_detail", "evidence_summary"],
      description: "목격자 정보나 추가 증거 요약이 있으면 입력해 주세요.",
    },
  ],
  OPINION: [
    {
      documentType: "OPINION",
      fieldKey: "opinion.issue_summary",
      label: "쟁점 요약",
      severity: "BLOCKING",
      questionKeys: ["incident_timeline", "current_status", "case_background"],
      description: "의견서의 핵심 쟁점을 설명할 사실관계를 입력해 주세요.",
    },
    {
      documentType: "OPINION",
      fieldKey: "opinion.legal_basis_context",
      label: "기초 사실관계",
      severity: "BLOCKING",
      questionKeys: ["incident_date", "incident_place", "incident_timeline"],
      description: "의견서의 기초가 되는 사실관계를 입력해 주세요.",
    },
    {
      documentType: "OPINION",
      fieldKey: "opinion.supporting_context",
      label: "보강 자료",
      severity: "WARNING",
      questionKeys: ["witness_detail", "evidence_summary", "people_involved"],
      description: "관련 증거나 이해관계자 정보가 있으면 입력해 주세요.",
    },
  ],
  CONSULT_NOTE: [
    {
      documentType: "CONSULT_NOTE",
      fieldKey: "consult.summary",
      label: "상담 요약",
      severity: "BLOCKING",
      questionKeys: ["incident_timeline", "case_background", "current_status"],
      description: "상담기록서의 핵심 상담 내용을 입력해 주세요.",
    },
    {
      documentType: "CONSULT_NOTE",
      fieldKey: "consult.context",
      label: "기초 맥락",
      severity: "BLOCKING",
      questionKeys: ["incident_date", "incident_place", "incident_timeline"],
      description: "상담이 이루어진 사건의 기본 맥락을 입력해 주세요.",
    },
    {
      documentType: "CONSULT_NOTE",
      fieldKey: "consult.requested_action",
      label: "요청사항",
      severity: "WARNING",
      questionKeys: ["desired_result", "current_status", "witness_detail"],
      description: "원하는 조치나 추가 요청사항이 있으면 입력해 주세요.",
    },
  ],
};

export function getOfficialFormRequiredFields(documentType: string) {
  return OFFICIAL_FORM_REQUIRED_FIELD_REGISTRY[
    documentType as SupportedOfficialFormDocumentType
  ] ?? [];
}