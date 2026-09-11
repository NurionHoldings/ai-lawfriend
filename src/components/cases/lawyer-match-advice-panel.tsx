"use client";

import { useEffect, useState } from "react";

type Candidate = {
  lawyerUserId: string;
  displayName: string;
  score: number;
  reasons: string[];
  disqualify?: string;
};

type Advice = {
  mode: "advice_only";
  candidates: Candidate[];
  policy: { autoAssignEnabled: false; createsAssignment: false };
};

type Props = {
  caseId: string;
  onPickLawyer?: (lawyerUserId: string) => void;
};

export function LawyerMatchAdvicePanel({ caseId, onPickLawyer }: Props) {
  const [advice, setAdvice] = useState<Advice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void fetch(`/api/cases/${caseId}/lawyer-match-advice`)
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json?.success) {
          throw new Error(json?.error?.message ?? json?.message ?? `HTTP ${res.status}`);
        }
        if (!cancelled) setAdvice(json.data as Advice);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "추천을 불러오지 못했습니다.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [caseId]);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-aibeop-text">매칭 추천 (advice-only)</h3>
        <span className="text-[11px] font-medium uppercase tracking-wide text-aibeop-subtle">
          자동 배정 없음
        </span>
      </div>
      <p className="mt-1 text-xs text-aibeop-subtle">
        점수는 참고용입니다. 최종 배정은 아래 폼에서 관리자가 선택합니다.
      </p>

      {loading ? <p className="mt-3 text-sm text-aibeop-subtle">불러오는 중…</p> : null}
      {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}

      {!loading && !error && advice ? (
        <ul className="mt-3 space-y-2">
          {advice.candidates.slice(0, 5).map((c) => (
            <li
              key={c.lawyerUserId}
              className="flex items-center justify-between gap-3 rounded-lg border bg-white px-3 py-2 text-sm"
            >
              <div>
                <div className="font-medium text-aibeop-text">
                  {c.displayName || c.lawyerUserId}
                  {c.disqualify ? (
                    <span className="ml-2 text-xs font-normal text-amber-700">({c.disqualify})</span>
                  ) : null}
                </div>
                <div className="text-xs text-aibeop-subtle">
                  score {c.score} · {c.reasons.slice(0, 2).join(", ")}
                </div>
              </div>
              {!c.disqualify && onPickLawyer ? (
                <button
                  type="button"
                  className="shrink-0 rounded-lg border px-2.5 py-1 text-xs font-semibold text-aibeop-text hover:bg-slate-50"
                  onClick={() => onPickLawyer(c.lawyerUserId)}
                >
                  선택
                </button>
              ) : null}
            </li>
          ))}
          {advice.candidates.length === 0 ? (
            <li className="text-sm text-aibeop-subtle">추천 후보가 없습니다.</li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
