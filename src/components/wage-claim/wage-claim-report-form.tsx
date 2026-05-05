"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";

const damageOptions = [
  ["UNPAID_WAGES", "임금 미지급"],
  ["UNPAID_SEVERANCE", "퇴직금 미지급"],
  ["UNPAID_OVERTIME", "연장근로수당 미지급"],
  ["UNPAID_NIGHT_HOLIDAY", "야간·휴일근로수당 미지급"],
  ["UNPAID_ALLOWANCE", "각종 수당 미지급"],
  ["MINIMUM_WAGE_VIOLATION", "최저임금 위반 의심"],
  ["WAGE_STATEMENT_NOT_PROVIDED", "임금명세서 미교부"],
  ["DELAYED_PAYMENT_AFTER_RESIGNATION", "퇴사 후 지급 지연"],
  ["OTHER", "기타"],
] as const;

type FormState = {
  reporterType: "WORKER" | "FAMILY_OR_RELATED" | "REPRESENTATIVE" | "OTHER";
  reporterName: string;
  reporterPhone: string;
  reporterEmail: string;

  workerName: string;
  workerPhone: string;

  employerName: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  workplaceAddress: string;

  employmentType:
    | "FULL_TIME"
    | "PART_TIME"
    | "CONTRACT"
    | "DAILY"
    | "FREELANCER_DISPUTED"
    | "OTHER";
  jobDescription: string;
  hireDate: string;
  resignationDate: string;
  isResigned: boolean;

  monthlyWageAmount: string;
  dailyWageAmount: string;
  hourlyWageAmount: string;
  agreedPayMemo: string;

  unpaidWageAmount: string;
  unpaidSeveranceAmount: string;
  unpaidAllowanceAmount: string;
  unpaidTotalAmount: string;
  unpaidPeriod: string;
  paymentDueDate: string;

  damageTypes: string[];
  requestHistory: string;
  evidenceSummary: string;
  damageSummary: string;
  requestedHelp: string;

  consentPrivacy: boolean;
  consentNoLegalAdvice: boolean;
  website: string;
};

const initialState: FormState = {
  reporterType: "WORKER",
  reporterName: "",
  reporterPhone: "",
  reporterEmail: "",

  workerName: "",
  workerPhone: "",

  employerName: "",
  companyName: "",
  companyAddress: "",
  companyPhone: "",
  workplaceAddress: "",

  employmentType: "FULL_TIME",
  jobDescription: "",
  hireDate: "",
  resignationDate: "",
  isResigned: false,

  monthlyWageAmount: "",
  dailyWageAmount: "",
  hourlyWageAmount: "",
  agreedPayMemo: "",

  unpaidWageAmount: "",
  unpaidSeveranceAmount: "",
  unpaidAllowanceAmount: "",
  unpaidTotalAmount: "",
  unpaidPeriod: "",
  paymentDueDate: "",

  damageTypes: [],
  requestHistory: "",
  evidenceSummary: "",
  damageSummary: "",
  requestedHelp: "",

  consentPrivacy: false,
  consentNoLegalAdvice: false,
  website: "",
};

function inputClass() {
  return "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300";
}

function textareaClass() {
  return "min-h-28 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-6 text-slate-100 outline-none transition focus:border-cyan-300";
}

function FieldLabel({
  children,
  required,
}: Readonly<{
  children: ReactNode;
  required?: boolean;
}>) {
  return (
    <label className="mb-2 block text-sm font-semibold text-slate-200">
      {children}
      {required ? <span className="ml-1 text-cyan-300">*</span> : null}
    </label>
  );
}

export function WageClaimReportForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [generatedStatement, setGeneratedStatement] = useState("");
  const [generatedTable, setGeneratedTable] = useState("");
  const [generatedChecklist, setGeneratedChecklist] = useState("");
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    return Boolean(
      form.reporterName.trim() &&
        form.reporterPhone.trim() &&
        form.companyName.trim() &&
        form.damageTypes.length > 0 &&
        form.damageSummary.trim().length >= 20 &&
        form.consentPrivacy &&
        form.consentNoLegalAdvice,
    );
  }, [form]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleDamageType(value: string) {
    setForm((prev) => {
      const exists = prev.damageTypes.includes(value);

      return {
        ...prev,
        damageTypes: exists
          ? prev.damageTypes.filter((item) => item !== value)
          : [...prev.damageTypes, value],
      };
    });
  }

  async function submit() {
    setLoading(true);
    setError("");
    setGeneratedStatement("");
    setGeneratedTable("");
    setGeneratedChecklist("");

    try {
      const res = await fetch("/api/public/wage-claim-reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.message || "진정서 초안 생성에 실패했습니다.");
        return;
      }

      setGeneratedStatement(data.generatedStatement);
      setGeneratedTable(data.generatedTable);
      setGeneratedChecklist(data.generatedChecklist);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function copyAll() {
    const text = `${generatedStatement}\n\n${generatedTable}\n\n${generatedChecklist}`;
    void navigator.clipboard.writeText(text);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form
        className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-6"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <input
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          value={form.website}
          onChange={(event) => update("website", event.target.value)}
        />

        <section>
          <h2 className="mb-4 text-xl font-bold">1. 작성자·근로자 정보</h2>

          <div className="grid gap-4 md:grid-cols-4">
            {[
              ["WORKER", "근로자 본인"],
              ["FAMILY_OR_RELATED", "가족·관계인"],
              ["REPRESENTATIVE", "대리 작성자"],
              ["OTHER", "기타"],
            ].map(([value, label]) => (
              <label key={value} className="rounded-2xl border border-slate-700 p-4 text-sm">
                <input
                  type="radio"
                  name="reporterType"
                  checked={form.reporterType === value}
                  onChange={() =>
                    update("reporterType", value as FormState["reporterType"])
                  }
                />
                <span className="ml-2">{label}</span>
              </label>
            ))}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel required>작성자 성명</FieldLabel>
              <input
                className={inputClass()}
                value={form.reporterName}
                onChange={(event) => update("reporterName", event.target.value)}
              />
            </div>

            <div>
              <FieldLabel required>작성자 연락처</FieldLabel>
              <input
                className={inputClass()}
                value={form.reporterPhone}
                onChange={(event) => update("reporterPhone", event.target.value)}
              />
            </div>

            <div>
              <FieldLabel>이메일</FieldLabel>
              <input
                className={inputClass()}
                value={form.reporterEmail}
                onChange={(event) => update("reporterEmail", event.target.value)}
              />
            </div>

            <div>
              <FieldLabel>근로자 성명</FieldLabel>
              <input
                className={inputClass()}
                value={form.workerName}
                onChange={(event) => update("workerName", event.target.value)}
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold">2. 사업장 정보</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel required>사업장명</FieldLabel>
              <input
                className={inputClass()}
                value={form.companyName}
                onChange={(event) => update("companyName", event.target.value)}
              />
            </div>

            <div>
              <FieldLabel>대표자 또는 사업주</FieldLabel>
              <input
                className={inputClass()}
                value={form.employerName}
                onChange={(event) => update("employerName", event.target.value)}
              />
            </div>

            <div>
              <FieldLabel>사업장 주소</FieldLabel>
              <input
                className={inputClass()}
                value={form.companyAddress}
                onChange={(event) => update("companyAddress", event.target.value)}
              />
            </div>

            <div>
              <FieldLabel>사업장 연락처</FieldLabel>
              <input
                className={inputClass()}
                value={form.companyPhone}
                onChange={(event) => update("companyPhone", event.target.value)}
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold">3. 근무 정보</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel>고용 형태</FieldLabel>
              <select
                className={inputClass()}
                value={form.employmentType}
                onChange={(event) =>
                  update(
                    "employmentType",
                    event.target.value as FormState["employmentType"],
                  )
                }
              >
                <option value="FULL_TIME">정규직</option>
                <option value="PART_TIME">아르바이트·파트타임</option>
                <option value="CONTRACT">계약직</option>
                <option value="DAILY">일용직</option>
                <option value="FREELANCER_DISPUTED">
                  프리랜서이나 근로자성 다툼 가능
                </option>
                <option value="OTHER">기타</option>
              </select>
            </div>

            <div>
              <FieldLabel>담당 업무</FieldLabel>
              <input
                className={inputClass()}
                value={form.jobDescription}
                onChange={(event) => update("jobDescription", event.target.value)}
              />
            </div>

            <div>
              <FieldLabel>입사일</FieldLabel>
              <input
                type="date"
                className={inputClass()}
                value={form.hireDate}
                onChange={(event) => update("hireDate", event.target.value)}
              />
            </div>

            <div>
              <FieldLabel>퇴사일</FieldLabel>
              <input
                type="date"
                className={inputClass()}
                value={form.resignationDate}
                onChange={(event) => update("resignationDate", event.target.value)}
              />
            </div>
          </div>

          <label className="mt-4 block rounded-2xl border border-slate-700 bg-slate-950/40 p-4 text-sm">
            <input
              type="checkbox"
              checked={form.isResigned}
              onChange={(event) => update("isResigned", event.target.checked)}
            />
            <span className="ml-2">이미 퇴사했습니다</span>
          </label>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold">4. 임금·체불 내역</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <FieldLabel>월급</FieldLabel>
              <input
                className={inputClass()}
                value={form.monthlyWageAmount}
                onChange={(event) => update("monthlyWageAmount", event.target.value)}
              />
            </div>

            <div>
              <FieldLabel>일급</FieldLabel>
              <input
                className={inputClass()}
                value={form.dailyWageAmount}
                onChange={(event) => update("dailyWageAmount", event.target.value)}
              />
            </div>

            <div>
              <FieldLabel>시급</FieldLabel>
              <input
                className={inputClass()}
                value={form.hourlyWageAmount}
                onChange={(event) => update("hourlyWageAmount", event.target.value)}
              />
            </div>
          </div>

          <div className="mt-4">
            <FieldLabel>임금 약정 설명</FieldLabel>
            <textarea
              className={textareaClass()}
              value={form.agreedPayMemo}
              onChange={(event) => update("agreedPayMemo", event.target.value)}
            />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel>미지급 임금</FieldLabel>
              <input
                className={inputClass()}
                value={form.unpaidWageAmount}
                onChange={(event) => update("unpaidWageAmount", event.target.value)}
              />
            </div>

            <div>
              <FieldLabel>미지급 퇴직금</FieldLabel>
              <input
                className={inputClass()}
                value={form.unpaidSeveranceAmount}
                onChange={(event) =>
                  update("unpaidSeveranceAmount", event.target.value)
                }
              />
            </div>

            <div>
              <FieldLabel>미지급 수당</FieldLabel>
              <input
                className={inputClass()}
                value={form.unpaidAllowanceAmount}
                onChange={(event) =>
                  update("unpaidAllowanceAmount", event.target.value)
                }
              />
            </div>

            <div>
              <FieldLabel>총 미지급액</FieldLabel>
              <input
                className={inputClass()}
                value={form.unpaidTotalAmount}
                onChange={(event) => update("unpaidTotalAmount", event.target.value)}
              />
            </div>
          </div>

          <div className="mt-4">
            <FieldLabel>체불 기간</FieldLabel>
            <input
              className={inputClass()}
              placeholder="예: 2026년 1월 급여부터 2026년 3월 급여까지"
              value={form.unpaidPeriod}
              onChange={(event) => update("unpaidPeriod", event.target.value)}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold">5. 체불 유형</h2>

          <div className="grid gap-3 md:grid-cols-2">
            {damageOptions.map(([value, label]) => (
              <label
                key={value}
                className="rounded-2xl border border-slate-700 bg-slate-950/40 p-4 text-sm"
              >
                <input
                  type="checkbox"
                  checked={form.damageTypes.includes(value)}
                  onChange={() => toggleDamageType(value)}
                />
                <span className="ml-2">{label}</span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold">6. 피해사실·증거자료</h2>

          <div className="grid gap-4">
            <div>
              <FieldLabel>사업주에게 지급을 요구한 이력</FieldLabel>
              <textarea
                className={textareaClass()}
                value={form.requestHistory}
                onChange={(event) => update("requestHistory", event.target.value)}
              />
            </div>

            <div>
              <FieldLabel required>피해 사실 상세</FieldLabel>
              <textarea
                className={textareaClass()}
                placeholder="언제부터 어떤 임금이 지급되지 않았는지 시간순으로 작성해 주세요."
                value={form.damageSummary}
                onChange={(event) => update("damageSummary", event.target.value)}
              />
            </div>

            <div>
              <FieldLabel>증거자료 목록</FieldLabel>
              <textarea
                className={textareaClass()}
                placeholder="근로계약서, 임금명세서, 입금내역, 출퇴근기록, 문자, 카카오톡, 업무지시 자료 등"
                value={form.evidenceSummary}
                onChange={(event) => update("evidenceSummary", event.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-700 bg-slate-950/50 p-4 text-sm leading-6 text-slate-300">
          <label className="flex gap-3">
            <input
              type="checkbox"
              checked={form.consentPrivacy}
              onChange={(event) => update("consentPrivacy", event.target.checked)}
            />
            <span>서류 정리 및 관리자 확인을 위한 개인정보 수집·이용에 동의합니다.</span>
          </label>

          <label className="flex gap-3">
            <input
              type="checkbox"
              checked={form.consentNoLegalAdvice}
              onChange={(event) =>
                update("consentNoLegalAdvice", event.target.checked)
              }
            />
            <span>
              본 서비스는 법률대리·수임·최종 법률판단이 아니라 서류 정리 보조
              서비스임을 확인합니다.
            </span>
          </label>
        </section>

        {error ? (
          <div className="rounded-2xl border border-red-400/30 bg-red-950/40 p-4 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit || loading}
          className="w-full rounded-2xl bg-cyan-300 px-5 py-4 font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "진정서 초안 생성 중..." : "무료 진정서 초안 만들기"}
        </button>
      </form>

      <aside className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
        <h2 className="text-xl font-bold">생성 결과</h2>

        {!generatedStatement ? (
          <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-950/50 p-5 text-sm leading-7 text-slate-300">
            입력을 완료하면 이곳에 진정서 초안, 체불내역 정리표, 제출자료
            체크리스트가 생성됩니다.
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={copyAll}
              className="mt-4 w-full rounded-xl border border-cyan-300/50 px-4 py-3 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/10"
            >
              전체 복사하기
            </button>

            <pre className="mt-4 max-h-[360px] overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-700 bg-slate-950 p-4 text-xs leading-6 text-slate-200">
              {generatedStatement}
            </pre>

            <pre className="mt-4 max-h-[360px] overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-700 bg-slate-950 p-4 text-xs leading-6 text-slate-200">
              {generatedTable}
            </pre>

            <pre className="mt-4 max-h-[360px] overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-700 bg-slate-950 p-4 text-xs leading-6 text-slate-200">
              {generatedChecklist}
            </pre>
          </>
        )}
      </aside>
    </div>
  );
}
