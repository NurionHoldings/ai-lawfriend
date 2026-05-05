import { IllegalLendingShortLinkAnalytics } from "@/components/illegal-lending/illegal-lending-short-link-analytics";
import { IllegalLendingLanding } from "@/components/illegal-lending/illegal-lending-landing";

export const metadata = {
  title: "무료 불법사금융 피해 신고서 작성 | AI법친",
  description:
    "불법사금융 피해 사실과 증거자료를 신고서 형식으로 무료 정리해드립니다.",
  openGraph: {
    title: "무료 불법사금융 피해 신고서 작성 | AI법친",
    description:
      "초고금리·불법추심·협박 피해를 AI법친이 신고서 형식으로 무료 정리해드립니다.",
    type: "website",
    url: "/free/illegal-lending-report",
    images: [
      {
        url: "/og/illegal-lending-report.png",
        width: 1200,
        height: 630,
        alt: "무료 불법사금융 피해 신고서 작성",
      },
    ],
  },
};

export default function FreeIllegalLendingReportPage() {
  return (
    <>
      <IllegalLendingShortLinkAnalytics />
      <IllegalLendingLanding />
    </>
  );
}