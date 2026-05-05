import { IllegalLendingLanding } from "@/components/illegal-lending/illegal-lending-landing";

export const metadata = {
  title: "불법사금융 피해 신고서 무료 작성센터 | AI법친",
  description:
    "초고금리·불법추심·협박·개인정보 유포 협박 피해를 신고서 형식으로 무료 정리해드립니다.",
  openGraph: {
    title: "불법사금융 피해, 혼자 정리하지 마세요 | AI법친",
    description:
      "AI법친이 불법사금융 피해 신고서 초안과 증거자료 목록 정리를 무료로 도와드립니다.",
    type: "website",
    url: "/illegal-lending",
    images: [
      {
        url: "/og/illegal-lending-report.png",
        width: 1200,
        height: 630,
        alt: "AI법친 불법사금융 피해 신고서 무료 작성센터",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "불법사금융 피해 신고서 무료 작성센터 | AI법친",
    description:
      "초고금리·불법추심·협박 피해를 신고서 형식으로 무료 정리해드립니다.",
    images: ["/og/illegal-lending-report.png"],
  },
};

export default function IllegalLendingLandingPage() {
  return <IllegalLendingLanding />;
}