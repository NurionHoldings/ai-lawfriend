import { JeonseDamageLanding } from "@/components/jeonse-damage/jeonse-damage-landing";

export const metadata = {
  title: "전세사기·보증금 반환 피해 서류 정리센터 | AI법친",
  description:
    "전세사기·보증금 반환 피해자의 피해사실 요약서와 제출자료 체크리스트 작성을 무료로 도와드립니다.",
  openGraph: {
    title: "전세사기·보증금 반환 피해, 서류부터 정리하세요 | AI법친",
    description:
      "임대차계약, 보증금, 전입신고, 확정일자, 반환 요구 이력, 증거자료를 제출용 요약서와 체크리스트로 무료 정리합니다.",
    type: "website",
    url: "/jeonse-damage",
    images: [
      {
        url: "/og/jeonse-damage-report.png",
        width: 1200,
        height: 630,
        alt: "AI법친 전세사기·보증금 반환 피해 서류 정리센터",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "전세사기·보증금 반환 피해 서류 정리센터 | AI법친",
    description:
      "보증금 미반환 피해 자료를 피해사실 요약서와 제출자료 체크리스트로 무료 정리합니다.",
    images: ["/og/jeonse-damage-report.png"],
  },
};

export default function JeonseDamageLandingPage() {
  return <JeonseDamageLanding />;
}
