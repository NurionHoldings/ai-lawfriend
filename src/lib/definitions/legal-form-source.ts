import { z } from "zod";

export const LegalFormProviderEnum = z.enum([
  "SCOURT",
  "POLICE",
  "SPO",
  "LAW_GO_KR",
  "KLAC",
  "INTERNAL_STANDARD",
  "OTHER",
]);
export type LegalFormProvider = z.infer<typeof LegalFormProviderEnum>;

export const LegalFormSourceStatusEnum = z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]);
export type LegalFormSourceStatus = z.infer<typeof LegalFormSourceStatusEnum>;

export const LegalFormSourceCreateSchema = z.object({
  provider: LegalFormProviderEnum,
  sourceName: z.string().min(1),
  sourceUrl: z.string().url().or(z.literal("INTERNAL_STANDARD")),
  documentType: z.string().min(1),
  category: z.string().optional().nullable(),
  officialFormCode: z.string().optional().nullable(),
  fileName: z.string().optional().nullable(),
  fileMimeType: z.string().optional().nullable(),
  fileHash: z.string().optional().nullable(),
  storageKey: z.string().optional().nullable(),
  licenseNote: z.string().optional().nullable(),
  downloadedAt: z.string().datetime().optional().nullable(),
  effectiveDate: z.string().datetime().optional().nullable(),
  parsedText: z.string().optional().nullable(),
  memo: z.string().optional().nullable(),
});

export const LegalFormSourceUpdateSchema = LegalFormSourceCreateSchema.partial().extend({
  status: LegalFormSourceStatusEnum.optional(),
});

export type LegalFormSourceCreateInput = z.infer<typeof LegalFormSourceCreateSchema>;
export type LegalFormSourceUpdateInput = z.infer<typeof LegalFormSourceUpdateSchema>;

export const LEGAL_FORM_PROVIDER_LABELS: Record<LegalFormProvider, string> = {
  SCOURT: "대한민국 법원/대법원",
  POLICE: "경찰청/경찰민원24",
  SPO: "검찰청",
  LAW_GO_KR: "국가법령정보센터",
  KLAC: "대한법률구조공단",
  INTERNAL_STANDARD: "AI법친 내부 표준",
  OTHER: "기타",
};