import { JeonseDamageLanding } from "@/components/jeonse-damage/jeonse-damage-landing";
import { JeonseDamageShortLinkAnalytics } from "@/components/jeonse-damage/jeonse-damage-short-link-analytics";

export const metadata = {
  title: "무료 전세사기·보증금 반환 피해 서류 정리 | AI법친",
  description:
    "전세사기·보증금 미반환 피해 자료를 요약서와 제출자료 체크리스트로 무료 정리해드립니다.",
  openGraph: {
    title: "무료 전세사기·보증금 반환 피해 서류 정리 | AI법친",
    description:
      "임대차계약, 보증금, 전입신고, 확정일자, 반환 요구 이력, 증거자료를 제출용으로 정리합니다.",
    type: "website",
    url: "/free/jeonse-damage-report",
    images: [
      {
        url: "/og/jeonse-damage-report.png",
        width: 1200,
        height: 630,
        alt: "무료 전세사기·보증금 반환 피해 서류 정리",
      },
    ],
  },
};

export default function FreeJeonseDamageReportPage() {
  return (
    <>
      <JeonseDamageShortLinkAnalytics />
      <JeonseDamageLanding />
    </>
  );
}
