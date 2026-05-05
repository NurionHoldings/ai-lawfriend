import { z } from "zod";

export const ReporterTypeSchema = z.enum([
  "VICTIM",
  "FAMILY_OR_RELATED",
  "THIRD_PARTY",
]);

export const DamageTypeSchema = z.enum([
  "ULTRA_HIGH_INTEREST",
  "ILLEGAL_COLLECTION",
  "THREAT_OR_INTIMIDATION",
  "CONTACT_FAMILY_OR_WORKPLACE",
  "PERSONAL_INFO_THREAT",
  "SEXUAL_IMAGE_THREAT",
  "UNREGISTERED_LENDER",
  "FALSE_OR_MISLEADING_CONTRACT",
  "OTHER",
]);

const optionalAmount = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((value) => {
    if (value === null || value === undefined || value === "") return null;
    const normalized = Number(String(value).replaceAll(",", ""));
    if (Number.isNaN(normalized)) return null;
    return Math.max(0, Math.floor(normalized));
  });

const optionalDate = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date;
  });

export const CreateIllegalLendingReportSchema = z.object({
  reporterType: ReporterTypeSchema,
  reporterName: z.string().min(1, "신고인 성명을 입력해 주세요.").max(50),
  reporterPhone: z.string().min(8, "연락처를 입력해 주세요.").max(30),
  reporterEmail: z.string().email().optional().or(z.literal("")),

  victimName: z.string().max(50).optional().or(z.literal("")),
  victimPhone: z.string().max(30).optional().or(z.literal("")),

  creditorName: z.string().max(80).optional().or(z.literal("")),
  creditorPhone: z.string().max(50).optional().or(z.literal("")),
  creditorBusinessName: z.string().max(100).optional().or(z.literal("")),
  creditorAccount: z.string().max(100).optional().or(z.literal("")),
  creditorMemo: z.string().max(1000).optional().or(z.literal("")),

  loanDate: optionalDate,
  principalAmount: optionalAmount,
  receivedAmount: optionalAmount,
  repaidAmount: optionalAmount,
  demandedAmount: optionalAmount,
  interestRateMemo: z.string().max(1000).optional().or(z.literal("")),

  damageTypes: z.array(DamageTypeSchema).min(1, "피해 유형을 1개 이상 선택해 주세요."),
  collectionMethods: z.string().max(1000).optional().or(z.literal("")),
  damageSummary: z
    .string()
    .min(20, "피해 내용을 20자 이상 작성해 주세요.")
    .max(5000),
  requestedHelp: z.string().max(2000).optional().or(z.literal("")),

  evidenceSummary: z.string().max(3000).optional().or(z.literal("")),

  consentPrivacy: z.literal(true, {
    errorMap: () => ({ message: "개인정보 수집·이용 동의가 필요합니다." }),
  }),
  consentNoLegalAdvice: z.literal(true, {
    errorMap: () => ({ message: "법률판단 제공 아님에 대한 확인이 필요합니다." }),
  }),

  website: z.string().optional().or(z.literal("")), // honeypot
});

export type CreateIllegalLendingReportInput = z.infer<
  typeof CreateIllegalLendingReportSchema
>;

export const DAMAGE_TYPE_LABEL: Record<
  z.infer<typeof DamageTypeSchema>,
  string
> = {
  ULTRA_HIGH_INTEREST: "초고금리 또는 과도한 이자 요구",
  ILLEGAL_COLLECTION: "불법추심",
  THREAT_OR_INTIMIDATION: "협박·공포심 유발",
  CONTACT_FAMILY_OR_WORKPLACE: "가족·직장·지인 연락",
  PERSONAL_INFO_THREAT: "개인정보 유포 협박",
  SEXUAL_IMAGE_THREAT: "성적 이미지·영상 유포 협박",
  UNREGISTERED_LENDER: "미등록 대부업 의심",
  FALSE_OR_MISLEADING_CONTRACT: "허위·기망성 계약",
  OTHER: "기타",
};

export const REPORTER_TYPE_LABEL: Record<
  z.infer<typeof ReporterTypeSchema>,
  string
> = {
  VICTIM: "피해자 본인",
  FAMILY_OR_RELATED: "피해자의 가족 또는 관계인",
  THIRD_PARTY: "제3자 신고",
};
