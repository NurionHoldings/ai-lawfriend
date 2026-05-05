"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type ShareStatus = "ACTIVE" | "EXPIRED" | "REVOKED";

type RiskBadge = {
  code: string;
  label: string;
  tone: "amber" | "emerald" | "rose" | "slate";
};

type AdminShareItem = {
  id: string;
  publicCode: string;
  status: ShareStatus;
  allowAttachmentDownload: boolean;
  allowPackagePdf: boolean;
  expiresAt?: string | null;
  revokedAt?: string | null;
  createdAt: string;
  case: {
    id: string;
    title: string;
    category?: string | null;
    status: string;
  };
  owner: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
  lawyer?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
  _count?: {
    accessLogs: number;
  };
  riskBadges: RiskBadge[];
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

function normalizeBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeStatus(value: unknown): ShareStatus {
  if (value === "ACTIVE" || value === "EXPIRED" || value === "REVOKED") {
    return value;
  }

  return "ACTIVE";
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

function normalizeUser(value: unknown) {
  const record = asRecord(value);

  if (typeof record.id !== "string") {
    return null;
  }

  return {
    id: record.id,
    name: normalizeNullableString(record.name),
    email: normalizeNullableString(record.email),
  };
}

function normalizeShare(value: unknown): AdminShareItem | null {
  const record = asRecord(value);
  const caseRecord = asRecord(record.case);
  const owner = normalizeUser(record.owner);
  const lawyer = normalizeUser(record.lawyer);
  const count = asRecord(record._count);

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
    status: normalizeStatus(record.status),
    allowAttachmentDownload: normalizeBoolean(record.allowAttachmentDownload),
    allowPackagePdf: normalizeBoolean(record.allowPackagePdf),
    expiresAt: normalizeNullableString(record.expiresAt),
    revokedAt: normalizeNullableString(record.revokedAt),
    createdAt: normalizeString(record.createdAt),
    case: {
      id: caseRecord.id,
      title: caseRecord.title,
      category: normalizeNullableString(caseRecord.category),
      status: normalizeString(caseRecord.status),
    },
    owner,
    lawyer,
    _count: {
      accessLogs:
        typeof count.accessLogs === "number" ? count.accessLogs : 0,
    },
    riskBadges: Array.isArray(record.riskBadges)
      ? record.riskBadges.flatMap((badge) => {
          const normalized = normalizeRiskBadge(badge);

          return normalized ? [normalized] : [];
        })
      : [],
  };
}

function normalizeShareList(value: unknown): AdminShareItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    const normalized = normalizeShare(item);

    return normalized ? [normalized] : [];
  });
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

function getStatusLabel(status: ShareStatus): string {
  switch (status) {
    case "ACTIVE":
      return "활성";
    case "EXPIRED":
      return "만료";
    case "REVOKED":
      return "취소";
  }
}

function getBadgeClassName(tone: RiskBadge["tone"]): string {
  switch (tone) {
    case "amber":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "emerald":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "rose":
      return "border-rose-200 bg-rose-50 text-rose-900";
    case "slate":
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

export function AdminCasePackageShareListClient() {
  const [shares, setShares] = useState<AdminShareItem[]>([]);
  const [status, setStatus] = useState<"ALL" | ShareStatus>("ALL");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const summary = useMemo(
    () => ({
      total: shares.length,
      active: shares.filter((share) => share.status === "ACTIVE").length,
      expired: shares.filter((share) => share.status === "EXPIRED").length,
      revoked: shares.filter((share) => share.status === "REVOKED").length,
      risk: shares.filter((share) => share.riskBadges.length > 0).length,
    }),
    [shares],
  );

  const loadShares = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const params = new URLSearchParams();

      params.set("status", status);

      if (query.trim()) {
        params.set("query", query.trim());
      }

      const response = await fetch(`/api/admin/case-package-shares?${params}`);

      const result: unknown = await response.json();
      const record = asRecord(result);

      if (!response.ok) {
        throw new Error(
          normalizeString(record.message, "공유 현황을 불러오지 못했습니다."),
        );
      }

      setShares(normalizeShareList(record.shares));
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "공유 현황을 불러오지 못했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [query, status]);

  useEffect(() => {
    void loadShares();
  }, [loadShares]);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-slate-500">
          AI법친 관리자
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
          사건 패키지 공유 현황
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          의뢰인이 발급한 사건 패키지 공유 상태, 열람/다운로드 로그 요약,
          위험 상태를 운영 관점에서 확인합니다.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-5">
        {[
          ["전체", summary.total],
          ["활성", summary.active],
          ["만료", summary.expired],
          ["취소", summary.revoked],
          ["위험 배지", summary.risk],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[180px_1fr_auto]">
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "ALL" | ShareStatus)
            }
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="ALL">전체 상태</option>
            <option value="ACTIVE">활성</option>
            <option value="EXPIRED">만료</option>
            <option value="REVOKED">취소</option>
          </select>

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="고유번호, 사건명, 분류, 의뢰인/변호사 이메일 검색"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />

          <button
            type="button"
            onClick={() => void loadShares()}
            disabled={isLoading}
            className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isLoading ? "조회 중..." : "조회"}
          </button>
        </div>
      </section>

      {errorMessage ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          {errorMessage}
        </section>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">공유</th>
              <th className="px-4 py-3">사건</th>
              <th className="px-4 py-3">의뢰인 / 변호사</th>
              <th className="px-4 py-3">권한</th>
              <th className="px-4 py-3">로그</th>
              <th className="px-4 py-3">위험</th>
              <th className="px-4 py-3">상세</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {shares.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  조회된 사건 패키지 공유가 없습니다.
                </td>
              </tr>
            ) : (
              shares.map((share) => (
                <tr key={share.id} className="align-top">
                  <td className="px-4 py-3">
                    <p className="font-mono font-semibold text-slate-950">
                      {share.publicCode}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {getStatusLabel(share.status)} · 생성{" "}
                      {formatDateTime(share.createdAt)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      만료 {formatDateTime(share.expiresAt)}
                    </p>
                  </td>

                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-950">
                      {share.case.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {share.case.category ?? "미분류"} · {share.case.status}
                    </p>
                  </td>

                  <td className="px-4 py-3 text-xs text-slate-600">
                    <p>
                      의뢰인: {share.owner.name ?? share.owner.email ?? share.owner.id}
                    </p>
                    <p className="mt-1">
                      변호사:{" "}
                      {share.lawyer?.name ??
                        share.lawyer?.email ??
                        "미지정"}
                    </p>
                  </td>

                  <td className="px-4 py-3 text-xs text-slate-600">
                    <p>첨부 다운로드: {share.allowAttachmentDownload ? "허용" : "불허"}</p>
                    <p className="mt-1">요약본 출력: {share.allowPackagePdf ? "허용" : "불허"}</p>
                  </td>

                  <td className="px-4 py-3 text-xs text-slate-600">
                    {share._count?.accessLogs ?? 0}건
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {share.riskBadges.length === 0 ? (
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-500">
                          정상
                        </span>
                      ) : (
                        share.riskBadges.map((badge) => (
                          <span
                            key={`${share.id}-${badge.code}`}
                            className={`rounded-full border px-2 py-1 text-xs font-semibold ${getBadgeClassName(
                              badge.tone,
                            )}`}
                          >
                            {badge.label}
                          </span>
                        ))
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/case-package-shares/${share.id}`}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      상세
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
