import { z } from "zod";

export const WageClaimReporterTypeSchema = z.enum([
  "WORKER",
  "FAMILY_OR_RELATED",
  "REPRESENTATIVE",
  "OTHER",
]);

export const WageClaimEmploymentTypeSchema = z.enum([
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "DAILY",
  "FREELANCER_DISPUTED",
  "OTHER",
]);

export const WageClaimDamageTypeSchema = z.enum([
  "UNPAID_WAGES",
  "UNPAID_SEVERANCE",
  "UNPAID_OVERTIME",
  "UNPAID_NIGHT_HOLIDAY",
  "UNPAID_ALLOWANCE",
  "MINIMUM_WAGE_VIOLATION",
  "WAGE_STATEMENT_NOT_PROVIDED",
  "DELAYED_PAYMENT_AFTER_RESIGNATION",
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

export const CreateWageClaimReportSchema = z.object({
  reporterType: WageClaimReporterTypeSchema,
  reporterName: z.string().min(1, "작성자 성명을 입력해 주세요.").max(50),
  reporterPhone: z.string().min(8, "연락처를 입력해 주세요.").max(30),
  reporterEmail: z.string().email().optional().or(z.literal("")),

  workerName: z.string().max(50).optional().or(z.literal("")),
  workerPhone: z.string().max(30).optional().or(z.literal("")),

  employerName: z.string().max(80).optional().or(z.literal("")),
  companyName: z.string().min(1, "사업장명을 입력해 주세요.").max(150),
  companyAddress: z.string().max(300).optional().or(z.literal("")),
  companyPhone: z.string().max(50).optional().or(z.literal("")),
  workplaceAddress: z.string().max(300).optional().or(z.literal("")),

  employmentType: WageClaimEmploymentTypeSchema,
  jobDescription: z.string().max(1000).optional().or(z.literal("")),
  hireDate: optionalDate,
  resignationDate: optionalDate,
  isResigned: z.boolean().default(false),

  monthlyWageAmount: optionalAmount,
  dailyWageAmount: optionalAmount,
  hourlyWageAmount: optionalAmount,
  agreedPayMemo: z.string().max(1500).optional().or(z.literal("")),

  unpaidWageAmount: optionalAmount,
  unpaidSeveranceAmount: optionalAmount,
  unpaidAllowanceAmount: optionalAmount,
  unpaidTotalAmount: optionalAmount,
  unpaidPeriod: z.string().max(1000).optional().or(z.literal("")),
  paymentDueDate: optionalDate,

  damageTypes: z
    .array(WageClaimDamageTypeSchema)
    .min(1, "체불 유형을 1개 이상 선택해 주세요."),
  requestHistory: z.string().max(3000).optional().or(z.literal("")),
  evidenceSummary: z.string().max(4000).optional().or(z.literal("")),
  damageSummary: z
    .string()
    .min(20, "피해 내용을 20자 이상 작성해 주세요.")
    .max(6000),
  requestedHelp: z.string().max(2000).optional().or(z.literal("")),

  consentPrivacy: z.literal(true, {
    errorMap: () => ({ message: "개인정보 수집·이용 동의가 필요합니다." }),
  }),
  consentNoLegalAdvice: z.literal(true, {
    errorMap: () => ({ message: "법률판단 제공 아님에 대한 확인이 필요합니다." }),
  }),

  website: z.string().optional().or(z.literal("")),
});

export type CreateWageClaimReportInput = z.infer<
  typeof CreateWageClaimReportSchema
>;

export const WAGE_REPORTER_TYPE_LABEL: Record<
  z.infer<typeof WageClaimReporterTypeSchema>,
  string
> = {
  WORKER: "근로자 본인",
  FAMILY_OR_RELATED: "가족 또는 관계인",
  REPRESENTATIVE: "대리 작성자",
  OTHER: "기타",
};

export const WAGE_EMPLOYMENT_TYPE_LABEL: Record<
  z.infer<typeof WageClaimEmploymentTypeSchema>,
  string
> = {
  FULL_TIME: "정규직",
  PART_TIME: "아르바이트·파트타임",
  CONTRACT: "계약직",
  DAILY: "일용직",
  FREELANCER_DISPUTED: "프리랜서이나 근로자성 다툼 가능",
  OTHER: "기타",
};

export const WAGE_DAMAGE_TYPE_LABEL: Record<
  z.infer<typeof WageClaimDamageTypeSchema>,
  string
> = {
  UNPAID_WAGES: "임금 미지급",
  UNPAID_SEVERANCE: "퇴직금 미지급",
  UNPAID_OVERTIME: "연장근로수당 미지급",
  UNPAID_NIGHT_HOLIDAY: "야간·휴일근로수당 미지급",
  UNPAID_ALLOWANCE: "각종 수당 미지급",
  MINIMUM_WAGE_VIOLATION: "최저임금 위반 의심",
  WAGE_STATEMENT_NOT_PROVIDED: "임금명세서 미교부",
  DELAYED_PAYMENT_AFTER_RESIGNATION: "퇴사 후 지급 지연",
  OTHER: "기타",
};
