type AdminRiskShare = {
  status: "ACTIVE" | "EXPIRED" | "REVOKED";
  lawyerUserId?: string | null;
  expiresAt?: Date | string | null;
  allowAttachmentDownload: boolean;
  allowPackagePdf: boolean;
  accessLogs?: Array<{
    action: "VIEW" | "DOWNLOAD" | "DENIED" | "EXPIRED" | "REVOKED";
  }>;
};

export type CasePackageAdminRiskBadge = {
  code:
    | "EXPIRING_SOON"
    | "DOWNLOAD_ALLOWED"
    | "PACKAGE_PDF_ALLOWED"
    | "LAWYER_UNASSIGNED"
    | "REPEATED_DENIED"
    | "INACTIVE_SHARE";
  label: string;
  tone: "amber" | "emerald" | "rose" | "slate";
};

function getExpiresAtDate(value?: Date | string | null): Date | null {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function isExpiringSoon(value?: Date | string | null): boolean {
  const date = getExpiresAtDate(value);

  if (!date) {
    return false;
  }

  const now = Date.now();
  const diffMs = date.getTime() - now;
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

  return diffMs > 0 && diffMs <= threeDaysMs;
}

function countDeniedLogs(share: AdminRiskShare): number {
  return (
    share.accessLogs?.filter(
      (log) =>
        log.action === "DENIED" ||
        log.action === "EXPIRED" ||
        log.action === "REVOKED",
    ).length ?? 0
  );
}

export function buildCasePackageAdminRiskBadges(
  share: AdminRiskShare,
): CasePackageAdminRiskBadge[] {
  const badges: CasePackageAdminRiskBadge[] = [];

  if (share.status !== "ACTIVE") {
    badges.push({
      code: "INACTIVE_SHARE",
      label: share.status === "EXPIRED" ? "만료 공유" : "취소 공유",
      tone: "slate",
    });
  }

  if (share.status === "ACTIVE" && isExpiringSoon(share.expiresAt)) {
    badges.push({
      code: "EXPIRING_SOON",
      label: "만료 임박",
      tone: "amber",
    });
  }

  if (share.allowAttachmentDownload) {
    badges.push({
      code: "DOWNLOAD_ALLOWED",
      label: "첨부 다운로드 허용",
      tone: "emerald",
    });
  }

  if (share.allowPackagePdf) {
    badges.push({
      code: "PACKAGE_PDF_ALLOWED",
      label: "요약본 출력 허용",
      tone: "emerald",
    });
  }

  if (!share.lawyerUserId) {
    badges.push({
      code: "LAWYER_UNASSIGNED",
      label: "변호사 미지정",
      tone: "amber",
    });
  }

  if (countDeniedLogs(share) >= 3) {
    badges.push({
      code: "REPEATED_DENIED",
      label: "차단 로그 반복",
      tone: "rose",
    });
  }

  return badges;
}
