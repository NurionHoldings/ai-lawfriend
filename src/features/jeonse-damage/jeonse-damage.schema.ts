import { z } from "zod";

export const JeonseReporterTypeSchema = z.enum([
  "TENANT",
  "FAMILY_OR_RELATED",
  "REPRESENTATIVE",
  "OTHER",
]);

export const JeonseDamageTypeSchema = z.enum([
  "DEPOSIT_NOT_RETURNED",
  "AUCTION_OR_PUBLIC_SALE",
  "LANDLORD_BANKRUPTCY_OR_REHABILITATION",
  "MULTIPLE_TENANT_DAMAGE",
  "DOUBLE_CONTRACT_OR_FALSE_CONTRACT",
  "EXCESSIVE_SENIOR_DEBT",
  "TAX_ARREARS_OR_SEIZURE",
  "LANDLORD_DISAPPEARED",
  "BROKER_INVOLVEMENT_SUSPECTED",
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

export const CreateJeonseDamageReportSchema = z.object({
  reporterType: JeonseReporterTypeSchema,
  reporterName: z.string().min(1, "신고인 성명을 입력해 주세요.").max(50),
  reporterPhone: z.string().min(8, "연락처를 입력해 주세요.").max(30),
  reporterEmail: z.string().email().optional().or(z.literal("")),
  tenantName: z.string().max(50).optional().or(z.literal("")),
  tenantPhone: z.string().max(30).optional().or(z.literal("")),
  propertyAddress: z.string().min(5, "임차주택 주소를 입력해 주세요.").max(300),
  propertyType: z.string().max(80).optional().or(z.literal("")),
  moveInDate: optionalDate,
  fixedDate: optionalDate,
  hasMoveInReport: z.boolean().default(false),
  hasFixedDate: z.boolean().default(false),
  hasPossession: z.boolean().default(false),
  hasLeaseRegistration: z.boolean().default(false),
  hasJeonseRight: z.boolean().default(false),
  leaseStartDate: optionalDate,
  leaseEndDate: optionalDate,
  depositAmount: optionalAmount,
  monthlyRentAmount: optionalAmount,
  contractMemo: z.string().max(1500).optional().or(z.literal("")),
  landlordName: z.string().max(80).optional().or(z.literal("")),
  landlordPhone: z.string().max(50).optional().or(z.literal("")),
  landlordAddress: z.string().max(300).optional().or(z.literal("")),
  landlordMemo: z.string().max(1500).optional().or(z.literal("")),
  brokerName: z.string().max(80).optional().or(z.literal("")),
  brokerOfficeName: z.string().max(120).optional().or(z.literal("")),
  brokerPhone: z.string().max(50).optional().or(z.literal("")),
  brokerMemo: z.string().max(1500).optional().or(z.literal("")),
  damageTypes: z
    .array(JeonseDamageTypeSchema)
    .min(1, "피해 유형을 1개 이상 선택해 주세요."),
  returnRequestHistory: z.string().max(3000).optional().or(z.literal("")),
  auctionOrSaleStatus: z.string().max(2000).optional().or(z.literal("")),
  investigationStatus: z.string().max(2000).optional().or(z.literal("")),
  damageSummary: z.string().min(20, "피해 내용을 20자 이상 작성해 주세요.").max(6000),
  requestedHelp: z.string().max(2000).optional().or(z.literal("")),
  evidenceSummary: z.string().max(4000).optional().or(z.literal("")),
  consentPrivacy: z.literal(true, {
    errorMap: () => ({ message: "개인정보 수집·이용 동의가 필요합니다." }),
  }),
  consentNoLegalAdvice: z.literal(true, {
    errorMap: () => ({ message: "법률판단 제공 아님에 대한 확인이 필요합니다." }),
  }),
  website: z.string().optional().or(z.literal("")),
});

export type CreateJeonseDamageReportInput = z.infer<
  typeof CreateJeonseDamageReportSchema
>;

export const JEONSE_REPORTER_TYPE_LABEL: Record<
  z.infer<typeof JeonseReporterTypeSchema>,
  string
> = {
  TENANT: "임차인 본인",
  FAMILY_OR_RELATED: "가족 또는 관계인",
  REPRESENTATIVE: "대리 작성자",
  OTHER: "기타",
};

export const JEONSE_DAMAGE_TYPE_LABEL: Record<
  z.infer<typeof JeonseDamageTypeSchema>,
  string
> = {
  DEPOSIT_NOT_RETURNED: "보증금 미반환",
  AUCTION_OR_PUBLIC_SALE: "경매·공매 진행 또는 예정",
  LANDLORD_BANKRUPTCY_OR_REHABILITATION: "임대인 파산·회생 관련 정황",
  MULTIPLE_TENANT_DAMAGE: "다수 임차인 피해 의심",
  DOUBLE_CONTRACT_OR_FALSE_CONTRACT: "이중계약·허위계약 의심",
  EXCESSIVE_SENIOR_DEBT: "과도한 선순위 권리·담보 의심",
  TAX_ARREARS_OR_SEIZURE: "세금 체납·압류 의심",
  LANDLORD_DISAPPEARED: "임대인 연락두절",
  BROKER_INVOLVEMENT_SUSPECTED: "공인중개사 관여 의심",
  OTHER: "기타",
};
