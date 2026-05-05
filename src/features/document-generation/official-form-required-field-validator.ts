import {
  getOfficialFormRequiredFields,
  type MissingOfficialFormField,
  type OfficialFormRequiredField,
} from "./official-form-required-fields";

export type OfficialFormAnswerMap = Record<string, unknown>;

export type OfficialFormRequiredFieldValidationResult = {
  documentType: string;
  missingFields: MissingOfficialFormField[];
  blockingFields: MissingOfficialFormField[];
  warningFields: MissingOfficialFormField[];
  suggestedQuestions: string[];
  shouldBlockGeneration: boolean;
};

function hasMeaningfulValue(value: unknown): boolean {
  if (value == null) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.some((item) => hasMeaningfulValue(item));
  }

  if (typeof value === "object") {
    return Object.keys(value).length > 0;
  }

  return true;
}

function toSuggestedQuestions(field: OfficialFormRequiredField): string[] {
  return field.description ? [field.description] : [`${field.label} 정보를 입력해 주세요.`];
}

function toMissingField(field: OfficialFormRequiredField): MissingOfficialFormField {
  return {
    fieldKey: field.fieldKey,
    label: field.label,
    severity: field.severity,
    suggestedQuestions: toSuggestedQuestions(field),
  };
}

function hasAnyQuestionAnswer(field: OfficialFormRequiredField, answers: OfficialFormAnswerMap) {
  return field.questionKeys.some((questionKey) => hasMeaningfulValue(answers[questionKey]));
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values));
}

export function validateOfficialFormRequiredFields(params: {
  documentType: string;
  answers: OfficialFormAnswerMap;
}): OfficialFormRequiredFieldValidationResult {
  const fields = getOfficialFormRequiredFields(params.documentType);
  const missingFields = fields
    .filter((field) => !hasAnyQuestionAnswer(field, params.answers))
    .map((field) => toMissingField(field));

  const blockingFields = missingFields.filter((field) => field.severity === "BLOCKING");
  const warningFields = missingFields.filter((field) => field.severity === "WARNING");
  const suggestedQuestions = uniqueStrings(
    missingFields.flatMap((field) => field.suggestedQuestions),
  );

  return {
    documentType: params.documentType,
    missingFields,
    blockingFields,
    warningFields,
    suggestedQuestions,
    shouldBlockGeneration: blockingFields.length > 0,
  };
}

export function hasMeaningfulOfficialFormAnswer(value: unknown) {
  return hasMeaningfulValue(value);
}