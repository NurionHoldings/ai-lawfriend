import type { GuardrailSuggestion } from "./document-generation-guardrail-suggestions";

export type DocumentGenerationGuardrailCheckStatus =
  | "PASSED"
  | "FAILED"
  | "SKIPPED";

export type PublicSafeGuardrailSuggestion = {
  type: string;
  issue: string;
  suggestedQuestions: string[];
};

export type DocumentGenerationGuardrailTrace = {
  generationPolicy: string;
  guardrailCheckStatus: DocumentGenerationGuardrailCheckStatus;
  guardrailIssues: string[];
  guardrailSuggestions: PublicSafeGuardrailSuggestion[];
  warningMissingFields: Array<{
    fieldKey: string;
    label: string;
    severity: "WARNING";
    suggestedQuestions: string[];
  }>;
  checkedAt: string;
};

export type PublicSafeDocumentGenerationGuardrailTrace = {
  generationPolicy: string;
  guardrailCheckStatus: DocumentGenerationGuardrailCheckStatus;
  guardrailIssues: string[];
  warningMissingFields: Array<{
    fieldKey: string;
    label: string;
    severity: "WARNING";
    suggestedQuestions: string[];
  }>;
  checkedAt: string;
};

export type BuildGuardrailTraceInput = {
  generationPolicy: string;
  guardrailCheckStatus: DocumentGenerationGuardrailCheckStatus;
  guardrailIssues?: string[];
  guardrailSuggestions?: GuardrailSuggestion[];
  warningMissingFields?: Array<{
    fieldKey: string;
    label: string;
    severity: "WARNING" | "BLOCKING";
    suggestedQuestions?: string[];
  }>;
  checkedAt?: Date;
};

function asTraceRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function toPublicSafeGuardrailSuggestions(
  suggestions: readonly GuardrailSuggestion[] | undefined,
): PublicSafeGuardrailSuggestion[] {
  if (!Array.isArray(suggestions)) {
    return [];
  }

  return suggestions.map((suggestion) => ({
    type: suggestion.type,
    issue: suggestion.issue,
    suggestedQuestions: normalizeStringArray(suggestion.suggestedQuestions),
  }));
}

function toWarningMissingFields(
  fields: BuildGuardrailTraceInput["warningMissingFields"],
): DocumentGenerationGuardrailTrace["warningMissingFields"] {
  if (!Array.isArray(fields)) {
    return [];
  }

  return fields
    .filter((field) => field.severity === "WARNING")
    .map((field) => ({
      fieldKey: field.fieldKey,
      label: field.label,
      severity: "WARNING",
      suggestedQuestions: normalizeStringArray(field.suggestedQuestions),
    }));
}

function normalizeWarningMissingFields(
  value: unknown,
): DocumentGenerationGuardrailTrace["warningMissingFields"] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    const record = asTraceRecord(item);

    if (
      typeof record.fieldKey !== "string" ||
      typeof record.label !== "string" ||
      record.severity !== "WARNING"
    ) {
      return [];
    }

    return [
      {
        fieldKey: record.fieldKey,
        label: record.label,
        severity: "WARNING" as const,
        suggestedQuestions: normalizeStringArray(record.suggestedQuestions),
      },
    ];
  });
}

export function buildDocumentGenerationGuardrailTrace(
  input: BuildGuardrailTraceInput,
): DocumentGenerationGuardrailTrace {
  return {
    generationPolicy: input.generationPolicy,
    guardrailCheckStatus: input.guardrailCheckStatus,
    guardrailIssues: normalizeStringArray(input.guardrailIssues),
    guardrailSuggestions: toPublicSafeGuardrailSuggestions(input.guardrailSuggestions),
    warningMissingFields: toWarningMissingFields(input.warningMissingFields),
    checkedAt: (input.checkedAt ?? new Date()).toISOString(),
  };
}

export function toPublicSafeGuardrailTrace(
  trace: DocumentGenerationGuardrailTrace | null | undefined,
): PublicSafeDocumentGenerationGuardrailTrace | null {
  if (!trace) {
    return null;
  }

  return {
    generationPolicy: trace.generationPolicy,
    guardrailCheckStatus: trace.guardrailCheckStatus,
    guardrailIssues: trace.guardrailIssues,
    warningMissingFields: trace.warningMissingFields,
    checkedAt: trace.checkedAt,
  };
}

export function readGuardrailTraceFromSnapshot(
  snapshot: unknown,
): DocumentGenerationGuardrailTrace | null {
  const record = asTraceRecord(snapshot);
  const maybeTrace = record.guardrailTrace;

  if (typeof maybeTrace !== "object" || maybeTrace === null || Array.isArray(maybeTrace)) {
    return null;
  }

  const traceRecord = maybeTrace as Record<string, unknown>;
  const generationPolicy = traceRecord.generationPolicy;
  const guardrailCheckStatus = traceRecord.guardrailCheckStatus;
  const checkedAt = traceRecord.checkedAt;

  if (
    typeof generationPolicy !== "string" ||
    typeof checkedAt !== "string" ||
    (guardrailCheckStatus !== "PASSED" &&
      guardrailCheckStatus !== "FAILED" &&
      guardrailCheckStatus !== "SKIPPED")
  ) {
    return null;
  }

  return {
    generationPolicy,
    guardrailCheckStatus,
    guardrailIssues: normalizeStringArray(traceRecord.guardrailIssues),
    guardrailSuggestions: [],
    warningMissingFields: normalizeWarningMissingFields(traceRecord.warningMissingFields),
    checkedAt,
  };
}