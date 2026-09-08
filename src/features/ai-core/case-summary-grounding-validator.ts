import type { CaseSummaryValidatedContent } from "./case-summary-output-validator";

export type CaseSummaryGroundingEntry = {
  claim: string;
  sourceRefs: string[];
};

function normalize(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function contentClaims(content: CaseSummaryValidatedContent): string[] {
  return [
    content.caseOverview,
    ...content.timeline,
    ...content.issues,
    ...content.riskNotes,
    ...content.checklist,
    ...(content.contractSections?.flatMap((section) => [section.heading, section.body]) ?? []),
  ].map(normalize).filter(Boolean);
}

export function validateCaseSummaryGrounding(input: {
  content: CaseSummaryValidatedContent;
  grounding: CaseSummaryGroundingEntry[];
  allowedSourceRefs: string[];
}): { passed: boolean; issues: string[] } {
  const issues: string[] = [];
  const allowed = new Set(input.allowedSourceRefs);
  const groundingByClaim = new Map(
    input.grounding.map((entry) => [normalize(entry.claim), entry.sourceRefs]),
  );

  for (const claim of contentClaims(input.content)) {
    const refs = groundingByClaim.get(claim);
    if (!refs?.length) {
      issues.push(`ungrounded case summary claim: ${claim.slice(0, 120)}`);
      continue;
    }
    const invalidRefs = refs.filter((ref) => !allowed.has(ref));
    if (invalidRefs.length) {
      issues.push(`unknown case summary source refs: ${invalidRefs.join(", ")}`);
    }
  }

  return { passed: issues.length === 0, issues: [...new Set(issues)] };
}
