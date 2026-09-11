export type LawyerArgumentSocialProofInput = {
  themeLabel: string;
  supportingCaseTitles: string[];
  lawyerDisplayName?: string;
  clientEmail?: string;
};

export type LawyerArgumentSocialProof = {
  themeLabel: string;
  anonymizedTheme: string;
  summary: string;
  evidenceCountBand: "none" | "few" | "many";
};

const EMAIL_PATTERN = /@[\w.-]+\.\w+/;
const PHONE_PATTERN = /\d{2,4}-\d{3,4}-\d{4}/;

export function anonymizeLawyerArgumentTheme(label: string): string {
  return label
    .replace(EMAIL_PATTERN, "@***")
    .replace(PHONE_PATTERN, "***-****-****")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildLawyerArgumentSocialProof(
  input: LawyerArgumentSocialProofInput,
): LawyerArgumentSocialProof {
  const count = input.supportingCaseTitles.length;
  const evidenceCountBand =
    count === 0 ? "none" : count <= 2 ? "few" : "many";

  return {
    themeLabel: input.themeLabel,
    anonymizedTheme: anonymizeLawyerArgumentTheme(input.themeLabel),
    summary:
      "유사 사례 흐름을 익명 테마로 요약합니다. 개별 사건명·의뢰인 식별자·원문은 포함하지 않습니다.",
    evidenceCountBand,
  };
}

export function assertLawyerArgumentSocialProofPrivacy(
  proof: LawyerArgumentSocialProof,
  input: LawyerArgumentSocialProofInput,
): boolean {
  const serialized = JSON.stringify(proof);
  if (input.clientEmail && serialized.includes(input.clientEmail)) return false;
  if (input.lawyerDisplayName && serialized.includes(input.lawyerDisplayName)) {
    return false;
  }
  for (const title of input.supportingCaseTitles) {
    if (title && serialized.includes(title)) return false;
  }
  return true;
}
