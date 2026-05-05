import {
  CASE_PACKAGE_FORBIDDEN_MARKETING_PHRASES,
  CASE_PACKAGE_FORBIDDEN_OUTPUT_FIELDS,
} from "./case-package-privacy-security-policy";

export type CasePackagePolicyCheckResult = {
  passed: boolean;
  violations: string[];
};

export function checkForbiddenOutputFieldNames(
  fieldNames: string[],
): CasePackagePolicyCheckResult {
  const forbiddenSet = new Set<string>(CASE_PACKAGE_FORBIDDEN_OUTPUT_FIELDS);
  const violations = fieldNames.filter((fieldName) => forbiddenSet.has(fieldName));

  return {
    passed: violations.length === 0,
    violations,
  };
}

export function checkForbiddenMarketingPhrases(
  text: string,
): CasePackagePolicyCheckResult {
  const violations = CASE_PACKAGE_FORBIDDEN_MARKETING_PHRASES.filter((phrase) =>
    text.includes(phrase),
  );

  return {
    passed: violations.length === 0,
    violations,
  };
}

export function maskCasePackageDisplayName(value?: string | null): string {
  const trimmed = value?.trim();

  if (!trimmed) {
    return "의뢰인";
  }

  if (trimmed.length <= 1) {
    return "*";
  }

  return `${trimmed[0]}${"*".repeat(Math.max(trimmed.length - 1, 1))}`;
}

export function sanitizeCasePackageLogForClient<T extends Record<string, unknown>>(
  log: T,
): Omit<T, "ip" | "userAgent"> {
  const safeLog = { ...log } as Record<string, unknown>;
  delete safeLog["ip"];
  delete safeLog["userAgent"];
  return safeLog as Omit<T, "ip" | "userAgent">;
}
