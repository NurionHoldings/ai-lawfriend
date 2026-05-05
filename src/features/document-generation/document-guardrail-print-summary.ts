import type { PublicSafeDocumentGenerationGuardrailTrace } from "./document-generation-guardrail-trace";

export type GuardrailPrintSummary = {
  generationPolicy: string;
  guardrailCheckStatusLabel: string;
  checkedAtLabel: string;
  warningMissingFieldCount: number;
};

function getGuardrailCheckStatusLabel(status: string): string {
  switch (status) {
    case "PASSED":
      return "통과";

    case "FAILED":
      return "차단";

    case "SKIPPED":
      return "건너뜀";

    default:
      return "확인 불가";
  }
}

function formatCheckedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function buildGuardrailPrintSummary(
  guardrailTrace: PublicSafeDocumentGenerationGuardrailTrace | null | undefined,
): GuardrailPrintSummary | null {
  if (!guardrailTrace) {
    return null;
  }

  return {
    generationPolicy: guardrailTrace.generationPolicy,
    guardrailCheckStatusLabel: getGuardrailCheckStatusLabel(
      guardrailTrace.guardrailCheckStatus,
    ),
    checkedAtLabel: formatCheckedAt(guardrailTrace.checkedAt),
    warningMissingFieldCount: guardrailTrace.warningMissingFields.length,
  };
}