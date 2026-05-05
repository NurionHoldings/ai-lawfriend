"use client";

import { useMemo, useState } from "react";
import { IllegalLendingAttachmentUploadForm } from "@/components/illegal-lending/illegal-lending-attachment-upload-form";
import { IllegalLendingReportFormAnalytics } from "@/components/illegal-lending/illegal-lending-report-form-analytics";
import { getCurrentIllegalLendingPromoVariant } from "@/features/illegal-lending/promo/illegal-lending-current-variant";
import { trackIllegalLendingPromoEvent } from "@/features/illegal-lending/promo/illegal-lending-promo-analytics";
import { ILLEGAL_LENDING_PROMO_EVENTS } from "@/features/illegal-lending/promo/illegal-lending-promo-events";

const damageOptions = [
  ["ULTRA_HIGH_INTEREST", "초고금리 또는 과도한 이자 요구"],
  ["ILLEGAL_COLLECTION", "불법추심"],
  ["THREAT_OR_INTIMIDATION", "협박·공포심 유발"],
  ["CONTACT_FAMILY_OR_WORKPLACE", "가족·직장·지인 연락"],
  ["PERSONAL_INFO_THREAT", "개인정보 유포 협박"],
  ["SEXUAL_IMAGE_THREAT", "성적 이미지·영상 유포 협박"],
  ["UNREGISTERED_LENDER", "미등록 대부업 의심"],
  ["FALSE_OR_MISLEADING_CONTRACT", "허위·기망성 계약"],
  ["OTHER", "기타"],
] as const;

type FormState = {
  reporterType: "VICTIM" | "FAMILY_OR_RELATED" | "THIRD_PARTY";
  reporterName: string;
  reporterPhone: string;
  reporterEmail: string;
  victimName: string;
  victimPhone: string;
  creditorName: string;
  creditorPhone: string;
  creditorBusinessName: string;
  creditorAccount: string;
  creditorMemo: string;
  loanDate: string;
  principalAmount: string;
  receivedAmount: string;
  repaidAmount: string;
  demandedAmount: string;
  interestRateMemo: string;
  damageTypes: string[];
  collectionMethods: string;
  damageSummary: string;
  requestedHelp: string;
  evidenceSummary: string;
  consentPrivacy: boolean;
  consentNoLegalAdvice: boolean;
  website: string;
};

const initialState: FormState = {
  reporterType: "VICTIM",
  reporterName: "",
  reporterPhone: "",
  reporterEmail: "",
  victimName: "",
  victimPhone: "",
  creditorName: "",
  creditorPhone: "",
  creditorBusinessName: "",
  creditorAccount: "",
  creditorMemo: "",
  loanDate: "",
  principalAmount: "",
  receivedAmount: "",
  repaidAmount: "",
  demandedAmount: "",
  interestRateMemo: "",
  damageTypes: [],
  collectionMethods: "",
  damageSummary: "",
  requestedHelp: "",
  evidenceSummary: "",
  consentPrivacy: false,
  consentNoLegalAdvice: false,
  website: "",
};

function FieldLabel({
  children,
  required,
}: Readonly<{
  children: React.ReactNode;
  required?: boolean;
}>) {
  return (
    <label className="mb-2 block text-sm font-semibold text-slate-200">
      {children}
      {required ? <span className="ml-1 text-cyan-300">*</span> : null}
    </label>
  );
}

function inputClass() {
  return "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300";
}

function textareaClass() {
  return "min-h-32 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-6 text-slate-100 outline-none transition focus:border-cyan-300";
}

export function IllegalLendingReportForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [generatedReport, setGeneratedReport] = useState("");
  const [createdReportId, setCreatedReportId] = useState("");
  const [uploadToken, setUploadToken] = useState("");
  const [error, setError] = useState("");
  const [hasStarted, setHasStarted] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      form.reporterName.trim().length > 0 &&
      form.reporterPhone.trim().length > 0 &&
      form.damageTypes.length > 0 &&
      form.damageSummary.trim().length >= 20 &&
      form.consentPrivacy &&
      form.consentNoLegalAdvice
    );
  }, [form]);

  function trackFormStartOnce() {
    if (hasStarted) return;

    setHasStarted(true);
    trackIllegalLendingPromoEvent(ILLEGAL_LENDING_PROMO_EVENTS.REPORT_FORM_START, {
      source: "report_form",
      variant: getCurrentIllegalLendingPromoVariant(),
    });
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    trackFormStartOnce();
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleDamageType(value: string) {
    trackFormStartOnce();
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
    trackIllegalLendingPromoEvent(
      ILLEGAL_LENDING_PROMO_EVENTS.REPORT_SUBMIT_ATTEMPT,
      {
        source: "report_form",
        variant: getCurrentIllegalLendingPromoVariant(),
        damageTypeCount: form.damageTypes.length,
      },
    );

    setLoading(true);
    setError("");
    setGeneratedReport("");
    setCreatedReportId("");
    setUploadToken("");

    try {
      const res = await fetch("/api/public/illegal-lending-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = (await res.json()) as {
        ok: boolean;
        id?: string;
        message?: string;
        uploadToken?: string;
        generatedReport?: string;
      };

      if (!res.ok || !data.ok) {
        trackIllegalLendingPromoEvent(
          ILLEGAL_LENDING_PROMO_EVENTS.REPORT_SUBMIT_FAIL,
          {
            source: "report_form",
            variant: getCurrentIllegalLendingPromoVariant(),
            reason: data.message || "response_not_ok",
          },
        );
        setError(data.message ?? "신고서 생성에 실패했습니다.");
        return;
      }

      trackIllegalLendingPromoEvent(
        ILLEGAL_LENDING_PROMO_EVENTS.REPORT_SUBMIT_SUCCESS,
        {
          source: "report_form",
          variant: getCurrentIllegalLendingPromoVariant(),
          reportId: data.id,
          hasUploadToken: Boolean(data.uploadToken),
          damageTypeCount: form.damageTypes.length,
        },
      );

      setGeneratedReport(data.generatedReport ?? "");
      setCreatedReportId(data.id ?? "");
      setUploadToken(data.uploadToken ?? "");
    } catch {
      trackIllegalLendingPromoEvent(ILLEGAL_LENDING_PROMO_EVENTS.REPORT_SUBMIT_FAIL, {
        source: "report_form",
        variant: getCurrentIllegalLendingPromoVariant(),
        reason: "network_error",
      });
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function copyReport() {
    if (!generatedReport) return;
    void navigator.clipboard.writeText(generatedReport);
  }

  return (
    <>
      <IllegalLendingReportFormAnalytics />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form
          className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-6"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
        {/* honeypot — hidden from real users */}
        <input
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
          value={form.website}
          onChange={(event) => update("website", event.target.value)}
        />

        <section>
          <h2 className="mb-4 text-xl font-bold">1. 신고인 정보</h2>

          <div className="grid gap-4 md:grid-cols-3">
            {(
              [
                ["VICTIM", "피해자 본인"],
                ["FAMILY_OR_RELATED", "가족·관계인"],
                ["THIRD_PARTY", "제3자 신고"],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className="rounded-2xl border border-slate-700 p-4 text-sm"
              >
                <input
                  type="radio"
                  name="reporterType"
                  checked={form.reporterType === value}
                  onChange={() => update("reporterType", value)}
                />
                <span className="ml-2">{label}</span>
              </label>
            ))}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel required>신고인 성명</FieldLabel>
              <input
                className={inputClass()}
                value={form.reporterName}
                onChange={(event) =>
                  update("reporterName", event.target.value)
                }
              />
            </div>

            <div>
              <FieldLabel required>신고인 연락처</FieldLabel>
              <input
                className={inputClass()}
                value={form.reporterPhone}
                onChange={(event) =>
                  update("reporterPhone", event.target.value)
                }
              />
            </div>

            <div>
              <FieldLabel>이메일</FieldLabel>
              <input
                type="email"
                className={inputClass()}
                value={form.reporterEmail}
                onChange={(event) =>
                  update("reporterEmail", event.target.value)
                }
              />
            </div>

            <div>
              <FieldLabel>피해자 성명</FieldLabel>
              <input
                className={inputClass()}
                value={form.victimName}
                onChange={(event) => update("victimName", event.target.value)}
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold">
            2. 채권자·불법사금융업자 정보
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel>성명 또는 명칭</FieldLabel>
              <input
                className={inputClass()}
                value={form.creditorName}
                onChange={(event) =>
                  update("creditorName", event.target.value)
                }
              />
            </div>

            <div>
              <FieldLabel>연락처</FieldLabel>
              <input
                className={inputClass()}
                value={form.creditorPhone}
                onChange={(event) =>
                  update("creditorPhone", event.target.value)
                }
              />
            </div>

            <div>
              <FieldLabel>상호 또는 업체명</FieldLabel>
              <input
                className={inputClass()}
                value={form.creditorBusinessName}
                onChange={(event) =>
                  update("creditorBusinessName", event.target.value)
                }
              />
            </div>

            <div>
              <FieldLabel>입금계좌 또는 관련 계좌</FieldLabel>
              <input
                className={inputClass()}
                value={form.creditorAccount}
                onChange={(event) =>
                  update("creditorAccount", event.target.value)
                }
              />
            </div>
          </div>

          <div className="mt-4">
            <FieldLabel>기타 식별정보</FieldLabel>
            <textarea
              className={textareaClass()}
              placeholder="카카오톡 ID, 텔레그램 ID, 업체 주소, 차량번호, 광고 링크 등"
              value={form.creditorMemo}
              onChange={(event) =>
                update("creditorMemo", event.target.value)
              }
            />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold">3. 대출·상환 정보</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel>최초 대출일 또는 거래일</FieldLabel>
              <input
                type="date"
                className={inputClass()}
                value={form.loanDate}
                onChange={(event) => update("loanDate", event.target.value)}
              />
            </div>

            <div>
              <FieldLabel>약정 원금</FieldLabel>
              <input
                className={inputClass()}
                placeholder="숫자만 입력 (예: 500000)"
                value={form.principalAmount}
                onChange={(event) =>
                  update("principalAmount", event.target.value)
                }
              />
            </div>

            <div>
              <FieldLabel>실제 수령액</FieldLabel>
              <input
                className={inputClass()}
                placeholder="숫자만 입력"
                value={form.receivedAmount}
                onChange={(event) =>
                  update("receivedAmount", event.target.value)
                }
              />
            </div>

            <div>
              <FieldLabel>이미 변제한 금액</FieldLabel>
              <input
                className={inputClass()}
                placeholder="숫자만 입력"
                value={form.repaidAmount}
                onChange={(event) =>
                  update("repaidAmount", event.target.value)
                }
              />
            </div>

            <div>
              <FieldLabel>현재 요구받는 금액</FieldLabel>
              <input
                className={inputClass()}
                placeholder="숫자만 입력"
                value={form.demandedAmount}
                onChange={(event) =>
                  update("demandedAmount", event.target.value)
                }
              />
            </div>
          </div>

          <div className="mt-4">
            <FieldLabel>이자율·상환조건 설명</FieldLabel>
            <textarea
              className={textareaClass()}
              placeholder="예: 50만 원을 빌렸는데 일주일 뒤 80만 원 상환을 요구받음"
              value={form.interestRateMemo}
              onChange={(event) =>
                update("interestRateMemo", event.target.value)
              }
            />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold">4. 피해 유형</h2>

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

          <div className="mt-4">
            <FieldLabel>불법추심 방식</FieldLabel>
            <textarea
              className={textareaClass()}
              placeholder="전화, 문자, 카카오톡, 가족 연락, 직장 연락, 협박 문구 등"
              value={form.collectionMethods}
              onChange={(event) =>
                update("collectionMethods", event.target.value)
              }
            />
          </div>

          <div className="mt-4">
            <FieldLabel required>피해 사실 상세</FieldLabel>
            <textarea
              className={textareaClass()}
              placeholder="언제, 누구에게, 얼마를 빌렸고, 어떤 방식으로 추심·협박을 받았는지 시간순으로 적어주세요."
              value={form.damageSummary}
              onChange={(event) =>
                update("damageSummary", event.target.value)
              }
            />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold">5. 요청사항·증거자료</h2>

          <div>
            <FieldLabel>요청하거나 희망하는 조치</FieldLabel>
            <textarea
              className={textareaClass()}
              placeholder="불법추심 중단, 전화번호 차단, 채무자대리인 지원, 수사의뢰, 변호사 상담 등"
              value={form.requestedHelp}
              onChange={(event) =>
                update("requestedHelp", event.target.value)
              }
            />
          </div>

          <div className="mt-4">
            <FieldLabel>증거자료 목록</FieldLabel>
            <textarea
              className={textareaClass()}
              placeholder="문자, 카톡, 통화녹음, 계좌이체내역, 계약서, 차용증, 협박 메시지 캡처 등"
              value={form.evidenceSummary}
              onChange={(event) =>
                update("evidenceSummary", event.target.value)
              }
            />
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-700 bg-slate-950/50 p-4 text-sm leading-6 text-slate-300">
          <label className="flex gap-3">
            <input
              type="checkbox"
              checked={form.consentPrivacy}
              onChange={(event) =>
                update("consentPrivacy", event.target.checked)
              }
            />
            <span>
              신고서 초안 생성 및 관리자 확인을 위한 개인정보 수집·이용에
              동의합니다.
            </span>
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
              본 서비스는 법률대리·수임·최종 법률판단이 아니라 신고서 작성
              보조 서비스임을 확인합니다.
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
          {loading ? "신고서 초안 생성 중..." : "무료 신고서 초안 생성하기"}
        </button>
        </form>

        <aside className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          <h2 className="text-xl font-bold">생성 결과</h2>

          {generatedReport ? (
            <>
              <button
                type="button"
                onClick={copyReport}
                className="mt-4 w-full rounded-xl border border-cyan-300/50 px-4 py-3 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/10"
              >
                신고서 초안 복사하기
              </button>

              <pre className="mt-4 max-h-[720px] overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-700 bg-slate-950 p-4 text-xs leading-6 text-slate-200">
                {generatedReport}
              </pre>
            </>
          ) : (
            <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-950/50 p-5 text-sm leading-7 text-slate-300">
              입력을 완료하면 이곳에 신고서 초안이 생성됩니다.
              <br />
              생성된 문서는 복사하여 공식기관 신고, 상담, 변호사 검토 자료로
              활용할 수 있습니다.
            </div>
          )}

          {createdReportId && uploadToken ? (
            <IllegalLendingAttachmentUploadForm
              reportId={createdReportId}
              uploadToken={uploadToken}
            />
          ) : null}
        </aside>
      </div>
    </>
  );
}
