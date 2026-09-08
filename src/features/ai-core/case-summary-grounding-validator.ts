import type { CaseSummaryValidatedContent } from "./case-summary-output-validator";

export type CaseSummaryGroundingEntry = {
  claim: string;
  sources: Array<{ ref: string; quote: string }>;
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
  sourceTextByRef: Record<string, string>;
}): { passed: boolean; issues: string[] } {
  const issues: string[] = [];
  const groundingByClaim = new Map(
    input.grounding.map((entry) => [normalize(entry.claim), entry.sources]),
  );

  for (const claim of contentClaims(input.content)) {
    const sources = groundingByClaim.get(claim);
    if (!sources?.length) {
      issues.push(`ungrounded case summary claim: ${claim.slice(0, 120)}`);
      continue;
    }
    const invalidRefs = sources
      .filter((source) => !(source.ref in input.sourceTextByRef))
      .map((source) => source.ref);
    if (invalidRefs.length) {
      issues.push(`unknown case summary source refs: ${invalidRefs.join(", ")}`);
    }
    for (const source of sources) {
      const sourceText = input.sourceTextByRef[source.ref];
      const quote = normalize(source.quote);
      if (sourceText !== undefined && (!quote || !normalize(sourceText).includes(quote))) {
        issues.push(`case summary source quote not found: ${source.ref}`);
      }
    }
  }

  return { passed: issues.length === 0, issues: [...new Set(issues)] };
}
