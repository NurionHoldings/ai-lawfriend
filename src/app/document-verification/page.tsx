import DocumentVerificationClient from "@/components/cases/document-verification-client";

export const metadata = {
  title: "문서 검증",
  description: "승인본 PDF 또는 출력본의 검증코드를 입력해 진위를 확인합니다.",
};

export default function DocumentVerificationPage() {
  return <DocumentVerificationClient />;
}
