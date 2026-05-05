"use client";

import { useCallback, useEffect, useState } from "react";

type RiskBadge = {
  code: string;
  label: string;
  tone: "amber" | "emerald" | "rose" | "slate";
};

type AccessLogItem = {
  id: string;
  action: "VIEW" | "DOWNLOAD" | "DENIED" | "EXPIRED" | "REVOKED";
  targetType: string;
  targetId?: string | null;
  resultMessage?: string | null;
  createdAt: string;
  actorUserId?: string | null;
  actor?: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
};

type AdminShareDetail = {
  id: string;
  publicCode: string;
  status: "ACTIVE" | "EXPIRED" | "REVOKED";
  allowSummary: boolean;
  allowInterview: boolean;
  allowAttachmentList: boolean;
  allowAttachmentDownload: boolean;
  allowDocumentDraft: boolean;
  allowPackagePdf: boolean;
  consentText: string;
  consentedAt: string;
  expiresAt?: string | null;
  revokedAt?: string | null;
  revokeReason?: string | null;
  case: {
    id: string;
    title: string;
    category?: string | null;
    status: string;
    description?: string | null;
  };
  owner: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
  lawyer?: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
  accessLogs: AccessLogItem[];
  riskBadges: RiskBadge[];
};

type AdminCasePackageShareDetailClientProps = {
  shareId: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function normalizeString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function normalizeBoolean(value: unknown): boolean {
  return typeof value === "boolean" ? value : false;
}

function normalizeLogAction(value: unknown): AccessLogItem["action"] {
  if (
    value === "VIEW" ||
    value === "DOWNLOAD" ||
    value === "DENIED" ||
    value === "EXPIRED" ||
    value === "REVOKED"
  ) {
    return value;
  }

  return "DENIED";
}

function normalizeUser(value: unknown) {
  const record = asRecord(value);

  if (typeof record.id !== "string") {
    return null;
  }

  return {
    id: record.id,
    name: normalizeNullableString(record.name),
    email: normalizeNullableString(record.email),
    role: normalizeNullableString(record.role),
  };
}

function normalizeAccessLog(value: unknown): AccessLogItem | null {
  const record = asRecord(value);
  const actor = normalizeUser(record.actor);

  if (typeof record.id !== "string" || typeof record.targetType !== "string") {
    return null;
  }

  return {
    id: record.id,
    action: normalizeLogAction(record.action),
    targetType: record.targetType,
    targetId: normalizeNullableString(record.targetId),
    resultMessage: normalizeNullableString(record.resultMessage),
    createdAt: normalizeString(record.createdAt),
    actorUserId: normalizeNullableString(record.actorUserId),
    actor,
  };
}

function normalizeRiskBadge(value: unknown): RiskBadge | null {
  const record = asRecord(value);

  if (typeof record.code !== "string" || typeof record.label !== "string") {
    return null;
  }

  const tone =
    record.tone === "amber" ||
    record.tone === "emerald" ||
    record.tone === "rose" ||
    record.tone === "slate"
      ? record.tone
      : "slate";

  return {
    code: record.code,
    label: record.label,
    tone,
  };
}

function normalizeDetail(value: unknown): AdminShareDetail | null {
  const record = asRecord(value);
  const caseRecord = asRecord(record.case);
  const owner = normalizeUser(record.owner);
  const lawyer = normalizeUser(record.lawyer);

  if (
    typeof record.id !== "string" ||
    typeof record.publicCode !== "string" ||
    typeof caseRecord.id !== "string" ||
    typeof caseRecord.title !== "string" ||
    !owner
  ) {
    return null;
  }

  return {
    id: record.id,
    publicCode: record.publicCode,
    status:
      record.status === "EXPIRED" || record.status === "REVOKED"
        ? record.status
        : "ACTIVE",
    allowSummary: normalizeBoolean(record.allowSummary),
    allowInterview: normalizeBoolean(record.allowInterview),
    allowAttachmentList: normalizeBoolean(record.allowAttachmentList),
    allowAttachmentDownload: normalizeBoolean(record.allowAttachmentDownload),
    allowDocumentDraft: normalizeBoolean(record.allowDocumentDraft),
    allowPackagePdf: normalizeBoolean(record.allowPackagePdf),
    consentText: normalizeString(record.consentText),
    consentedAt: normalizeString(record.consentedAt),
    expiresAt: normalizeNullableString(record.expiresAt),
    revokedAt: normalizeNullableString(record.revokedAt),
    revokeReason: normalizeNullableString(record.revokeReason),
    case: {
      id: caseRecord.id,
      title: caseRecord.title,
      category: normalizeNullableString(caseRecord.category),
      status: normalizeString(caseRecord.status),
      description: normalizeNullableString(caseRecord.description),
    },
    owner,
    lawyer,
    accessLogs: Array.isArray(record.accessLogs)
      ? record.accessLogs.flatMap((log) => {
          const normalized = normalizeAccessLog(log);

          return normalized ? [normalized] : [];
        })
      : [],
    riskBadges: Array.isArray(record.riskBadges)
      ? record.riskBadges.flatMap((badge) => {
          const normalized = normalizeRiskBadge(badge);

          return normalized ? [normalized] : [];
        })
      : [],
  };
}

function formatDateTime(value?: string | null): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getActionLabel(action: AccessLogItem["action"]): string {
  switch (action) {
    case "VIEW":
      return "열람";
    case "DOWNLOAD":
      return "다운로드";
    case "DENIED":
      return "차단";
    case "EXPIRED":
      return "만료 차단";
    case "REVOKED":
      return "취소 차단";
  }
}

export function AdminCasePackageShareDetailClient({
  shareId,
}: AdminCasePackageShareDetailClientProps) {
  const [detail, setDetail] = useState<AdminShareDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/admin/case-package-shares/${shareId}`);
      const result: unknown = await response.json();
      const record = asRecord(result);

      if (!response.ok) {
        throw new Error(
          normalizeString(record.message, "공유 상세를 불러오지 못했습니다."),
        );
      }

      const normalized = normalizeDetail(record.share);

      if (!normalized) {
        throw new Error("공유 상세 응답이 올바르지 않습니다.");
      }

      setDetail(normalized);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "공유 상세를 불러오지 못했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [shareId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          사건 패키지 공유 상세를 불러오는 중입니다.
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-900">
          {errorMessage}
        </div>
      </main>
    );
  }

  if (!detail) {
    return null;
  }

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="font-mono text-sm font-semibold text-slate-500">
          {detail.publicCode}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">
          {detail.case.title}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {detail.case.category ?? "미분류"} · {detail.case.status} · 공유 상태{" "}
          {detail.status}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold text-slate-500">의뢰인</p>
          <p className="mt-2 font-semibold text-slate-950">
            {detail.owner.name ?? detail.owner.email ?? detail.owner.id}
          </p>
          <p className="mt-1 text-xs text-slate-500">{detail.owner.role ?? "-"}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold text-slate-500">변호사</p>
          <p className="mt-2 font-semibold text-slate-950">
            {detail.lawyer?.name ?? detail.lawyer?.email ?? "미지정"}
          </p>
          <p className="mt-1 text-xs text-slate-500">{detail.lawyer?.role ?? "-"}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold text-slate-500">공유 기간</p>
          <p className="mt-2 text-sm text-slate-700">
            동의 {formatDateTime(detail.consentedAt)}
          </p>
          <p className="mt-1 text-sm text-slate-700">
            만료 {formatDateTime(detail.expiresAt)}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="font-semibold text-slate-950">권한 / 위험 상태</p>
        <div className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-3">
          <p>요약: {detail.allowSummary ? "허용" : "불허"}</p>
          <p>인터뷰: {detail.allowInterview ? "허용" : "불허"}</p>
          <p>첨부 목록: {detail.allowAttachmentList ? "허용" : "불허"}</p>
          <p>첨부 다운로드: {detail.allowAttachmentDownload ? "허용" : "불허"}</p>
          <p>문서 초안: {detail.allowDocumentDraft ? "허용" : "불허"}</p>
          <p>요약본 출력: {detail.allowPackagePdf ? "허용" : "불허"}</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {detail.riskBadges.length === 0 ? (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500">
              위험 배지 없음
            </span>
          ) : (
            detail.riskBadges.map((badge) => (
              <span
                key={badge.code}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
              >
                {badge.label}
              </span>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="font-semibold text-slate-950">동의문구 / 취소 사유</p>
        <p className="mt-3 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-700">
          {detail.consentText}
        </p>
        {detail.revokeReason ? (
          <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
            취소 사유: {detail.revokeReason}
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="font-semibold text-slate-950">접근 로그</p>

        {detail.accessLogs.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            접근 로그가 없습니다.
          </p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">시각</th>
                  <th className="px-3 py-2">행위</th>
                  <th className="px-3 py-2">대상</th>
                  <th className="px-3 py-2">행위자</th>
                  <th className="px-3 py-2">결과</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {detail.accessLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-3 py-2 text-slate-600">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-3 py-2 font-semibold text-slate-900">
                      {getActionLabel(log.action)}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {log.targetType}
                      {log.targetId ? ` / ${log.targetId}` : ""}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {log.actor?.name ??
                        log.actor?.email ??
                        log.actorUserId ??
                        "미확인"}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {log.resultMessage ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
