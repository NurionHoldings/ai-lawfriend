import type { JeonseDamagePromoVariant } from "./jeonse-damage-promo-events";

export type JeonseDamagePromoCopy = {
  variant: JeonseDamagePromoVariant;
  badge: string;
  headline: string;
  subheadline: string;
  cta: string;
  secondaryCta: string;
  popupHeadline: string;
  popupBody: string;
};

export const JEONSE_DAMAGE_PROMO_COPIES: Record<
  JeonseDamagePromoVariant,
  JeonseDamagePromoCopy
> = {
  A: {
    variant: "A",
    badge: "AI법친 무료 유입 서비스 2호",
    headline: "전세사기·보증금 반환 피해,\n서류부터 정리하세요.",
    subheadline:
      "임대차계약, 보증금, 전입신고, 확정일자, 반환 요구 이력, 증거자료를 AI법친이 피해사실 요약서와 제출자료 체크리스트로 무료 정리해드립니다.",
    cta: "무료 서류 정리 시작하기",
    secondaryCta: "어떻게 정리하나요?",
    popupHeadline: "전세보증금을\n돌려받지 못하고 계신가요?",
    popupBody:
      "임대차계약, 전입신고, 확정일자, 반환 요구 이력, 증거자료를 서류 형식으로 무료 정리해드립니다.",
  },
  B: {
    variant: "B",
    badge: "전세사기·보증금 미반환 피해 정리",
    headline: "보증금 반환 문제,\n혼자 자료를 모으지 마세요.",
    subheadline:
      "계약서, 등기부등본, 이체내역, 내용증명, 문자·카카오톡 대화, 경매·공매 자료를 제출용 요약서와 체크리스트로 정리합니다.",
    cta: "피해자료 무료로 정리하기",
    secondaryCta: "준비자료 확인하기",
    popupHeadline: "보증금 반환이\n지연되고 있나요?",
    popupBody:
      "계약서, 확정일자, 등기부등본, 반환 요구 내역을 바탕으로 피해사실 요약서와 제출자료 체크리스트를 무료 생성합니다.",
  },
};

const STORAGE_KEY = "aibeopchin-jeonse-damage-promo-variant-v1";

export function getConfiguredJeonseDamagePromoVariant():
  | JeonseDamagePromoVariant
  | "auto" {
  const raw = process.env.NEXT_PUBLIC_JEONSE_DAMAGE_PROMO_VARIANT;

  if (raw === "A" || raw === "B") {
    return raw;
  }

  return "auto";
}

export function getClientJeonseDamagePromoVariant(): JeonseDamagePromoVariant {
  const configured = getConfiguredJeonseDamagePromoVariant();

  if (configured !== "auto") {
    return configured;
  }

  if (typeof window === "undefined") {
    return "A";
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (stored === "A" || stored === "B") {
    return stored;
  }

  const variant: JeonseDamagePromoVariant = Math.random() < 0.5 ? "A" : "B";
  window.localStorage.setItem(STORAGE_KEY, variant);

  return variant;
}

export function getJeonseDamagePromoCopy(variant: JeonseDamagePromoVariant) {
  return JEONSE_DAMAGE_PROMO_COPIES[variant];
}
