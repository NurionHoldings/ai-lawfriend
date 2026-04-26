import type { CaseAttachmentCategory } from "@prisma/client";
import { z } from "zod";

export const CASE_ATTACHMENT_CATEGORY_VALUES = [
  "EVIDENCE",
  "IDENTITY_DOC",
  "CONTRACT",
  "CORRESPONDENCE",
  "COURT_FILING",
  "FINANCIAL",
  "OTHER",
] as const satisfies readonly CaseAttachmentCategory[];

export const caseAttachmentCategorySchema = z.enum(CASE_ATTACHMENT_CATEGORY_VALUES);

export const CASE_ATTACHMENT_CATEGORY_LABELS: Record<
  CaseAttachmentCategory,
  string
> = {
  EVIDENCE: "증거·사실관계",
  IDENTITY_DOC: "신분·등록",
  CONTRACT: "계약·합의",
  CORRESPONDENCE: "통신·협의 내역",
  COURT_FILING: "법원·소송 서류",
  FINANCIAL: "금융·정산",
  OTHER: "기타",
};

export function parseCaseAttachmentCategoryInput(
  raw: FormDataEntryValue | null | undefined,
): CaseAttachmentCategory {
  if (raw === null || raw === undefined || raw === "") {
    return "OTHER";
  }
  const s = typeof raw === "string" ? raw : String(raw);
  const parsed = caseAttachmentCategorySchema.safeParse(s);
  return parsed.success ? parsed.data : "OTHER";
}
