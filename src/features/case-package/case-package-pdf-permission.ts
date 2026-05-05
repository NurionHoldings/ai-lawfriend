import type { CasePackageShareStatus } from "./case-package-share-policy";
import { resolveCasePackageShareStatus } from "./case-package-share-policy-utils";

type PdfPermissionInput = {
  status: CasePackageShareStatus;
  expiresAt?: Date | string | null;
  revokedAt?: Date | string | null;
  allowPackagePdf: boolean;
};

export type PdfPermissionDecision = {
  allowed: boolean;
  code: "ALLOW" | "SHARE_EXPIRED" | "SHARE_REVOKED" | "PACKAGE_PDF_DENIED";
  message: string;
};

export function evaluateCasePackagePdfPermission(
  input: PdfPermissionInput,
): PdfPermissionDecision {
  const resolvedStatus = resolveCasePackageShareStatus({
    status: input.status,
    expiresAt: input.expiresAt,
    revokedAt: input.revokedAt,
  });

  if (resolvedStatus === "EXPIRED") {
    return {
      allowed: false,
      code: "SHARE_EXPIRED",
      message: "사건 패키지 공유 기간이 만료되었습니다.",
    };
  }

  if (resolvedStatus === "REVOKED") {
    return {
      allowed: false,
      code: "SHARE_REVOKED",
      message: "사건 패키지 공유가 취소되었습니다.",
    };
  }

  if (!input.allowPackagePdf) {
    return {
      allowed: false,
      code: "PACKAGE_PDF_DENIED",
      message: "사건 패키지 PDF 다운로드 권한이 없습니다.",
    };
  }

  return {
    allowed: true,
    code: "ALLOW",
    message: "사건 패키지 PDF 다운로드가 허용되었습니다.",
  };
}
