export const documentVerificationConfig = {
  publicBaseUrl: process.env.NEXT_PUBLIC_APP_URL ?? "",
  verificationPagePath: "/document-verification",
  qrLabel: "문서 검증 QR",
  mobileHelpText: "QR 스캔 또는 검증코드 입력으로 승인본 진위를 확인할 수 있습니다.",
};
