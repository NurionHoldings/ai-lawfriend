"use client";

import { useMemo, useState } from "react";
import { JeonseDamageAttachmentUploadForm } from "@/components/jeonse-damage/jeonse-damage-attachment-upload-form";
import { JeonseDamageReportFormAnalytics } from "@/components/jeonse-damage/jeonse-damage-report-form-analytics";
import { getCurrentJeonseDamagePromoVariant } from "@/features/jeonse-damage/promo/jeonse-damage-current-variant";
import { trackJeonseDamagePromoEvent } from "@/features/jeonse-damage/promo/jeonse-damage-promo-analytics";
import { JEONSE_DAMAGE_PROMO_EVENTS } from "@/features/jeonse-damage/promo/jeonse-damage-promo-events";

const damageOptions = [
  ["DEPOSIT_NOT_RETURNED", "보증금 미반환"],
  ["AUCTION_OR_PUBLIC_SALE", "경매·공매 진행 또는 예정"],
  ["LANDLORD_BANKRUPTCY_OR_REHABILITATION", "임대인 파산·회생 관련 정황"],
  ["MULTIPLE_TENANT_DAMAGE", "다수 임차인 피해 의심"],
  ["DOUBLE_CONTRACT_OR_FALSE_CONTRACT", "이중계약·허위계약 의심"],
  ["EXCESSIVE_SENIOR_DEBT", "과도한 선순위 권리·담보 의심"],
  ["TAX_ARREARS_OR_SEIZURE", "세금 체납·압류 의심"],
  ["LANDLORD_DISAPPEARED", "임대인 연락두절"],
  ["BROKER_INVOLVEMENT_SUSPECTED", "공인중개사 관여 의심"],
  ["OTHER", "기타"],
] as const;

type FormState = {
  reporterType: "TENANT" | "FAMILY_OR_RELATED" | "REPRESENTATIVE" | "OTHER";
  reporterName: string;
  reporterPhone: string;
  reporterEmail: string;
  tenantName: string;
  tenantPhone: string;
  propertyAddress: string;
  propertyType: string;
  moveInDate: string;
  fixedDate: string;
  hasMoveInReport: boolean;
  hasFixedDate: boolean;
  hasPossession: boolean;
  hasLeaseRegistration: boolean;
  hasJeonseRight: boolean;
  leaseStartDate: string;
  leaseEndDate: string;
  depositAmount: string;
  monthlyRentAmount: string;
  contractMemo: string;
  landlordName: string;
  landlordPhone: string;
  landlordAddress: string;
  landlordMemo: string;
  brokerName: string;
  brokerOfficeName: string;
  brokerPhone: string;
  brokerMemo: string;
  damageTypes: string[];
  returnRequestHistory: string;
  auctionOrSaleStatus: string;
  investigationStatus: string;
  damageSummary: string;
  requestedHelp: string;
  evidenceSummary: string;
  consentPrivacy: boolean;
  consentNoLegalAdvice: boolean;
  website: string;
};

const initialState: FormState = {
  reporterType: "TENANT",
  reporterName: "",
  reporterPhone: "",
  reporterEmail: "",
  tenantName: "",
  tenantPhone: "",
  propertyAddress: "",
  propertyType: "",
  moveInDate: "",
  fixedDate: "",
  hasMoveInReport: false,
  hasFixedDate: false,
  hasPossession: false,
  hasLeaseRegistration: false,
  hasJeonseRight: false,
  leaseStartDate: "",
  leaseEndDate: "",
  depositAmount: "",
  monthlyRentAmount: "",
  contractMemo: "",
  landlordName: "",
  landlordPhone: "",
  landlordAddress: "",
  landlordMemo: "",
  brokerName: "",
  brokerOfficeName: "",
  brokerPhone: "",
  brokerMemo: "",
  damageTypes: [],
  returnRequestHistory: "",
  auctionOrSaleStatus: "",
  investigationStatus: "",
  damageSummary: "",
  requestedHelp: "",
  evidenceSummary: "",
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

function CheckField({
  checked,
  label,
  onChange,
}: Readonly<{
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}>) {
  return (
    <label className="rounded-2xl border border-slate-700 bg-slate-950/40 p-4 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="ml-2">{label}</span>
    </label>
  );
}

export function JeonseDamageReportForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState("");
  const [generatedChecklist, setGeneratedChecklist] = useState("");
  const [error, setError] = useState("");
  const [createdReportId, setCreatedReportId] = useState("");
  const [uploadToken, setUploadToken] = useState("");
  const [hasStarted, setHasStarted] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      Boolean(form.reporterName.trim()) &&
      Boolean(form.reporterPhone.trim()) &&
      Boolean(form.propertyAddress.trim()) &&
      form.damageTypes.length > 0 &&
      form.damageSummary.trim().length >= 20 &&
      form.consentPrivacy &&
      form.consentNoLegalAdvice
    );
  }, [form]);

  function trackFormStartOnce() {
    if (hasStarted) return;

    setHasStarted(true);

    trackJeonseDamagePromoEvent(JEONSE_DAMAGE_PROMO_EVENTS.REPORT_FORM_START, {
      source: "report_form",
      variant: getCurrentJeonseDamagePromoVariant(),
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
    trackJeonseDamagePromoEvent(
      JEONSE_DAMAGE_PROMO_EVENTS.REPORT_SUBMIT_ATTEMPT,
      {
        source: "report_form",
        variant: getCurrentJeonseDamagePromoVariant(),
        damageTypeCount: form.damageTypes.length,
      },
    );

    setLoading(true);
    setError("");
    setGeneratedSummary("");
    setGeneratedChecklist("");
    setCreatedReportId("");
    setUploadToken("");

    try {
      const res = await fetch("/api/public/jeonse-damage-reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        trackJeonseDamagePromoEvent(JEONSE_DAMAGE_PROMO_EVENTS.REPORT_SUBMIT_FAIL, {
          source: "report_form",
          variant: getCurrentJeonseDamagePromoVariant(),
          reason: data.message || "response_not_ok",
        });
        setError(data.message || "서류 정리 요약서 생성에 실패했습니다.");
        return;
      }

      trackJeonseDamagePromoEvent(
        JEONSE_DAMAGE_PROMO_EVENTS.REPORT_SUBMIT_SUCCESS,
        {
          source: "report_form",
          variant: getCurrentJeonseDamagePromoVariant(),
          reportId: data.id,
          hasUploadToken: Boolean(data.uploadToken),
          damageTypeCount: form.damageTypes.length,
        },
      );

      setGeneratedSummary(data.generatedSummary);
      setGeneratedChecklist(data.generatedChecklist);
      setCreatedReportId(data.id);
      setUploadToken(data.uploadToken || "");
    } catch {
      trackJeonseDamagePromoEvent(JEONSE_DAMAGE_PROMO_EVENTS.REPORT_SUBMIT_FAIL, {
        source: "report_form",
        variant: getCurrentJeonseDamagePromoVariant(),
        reason: "network_error",
      });
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function copyAll() {
    const text = `${generatedSummary}\n\n${generatedChecklist}`;
    void navigator.clipboard.writeText(text);
  }

  return (
    <>
      <JeonseDamageReportFormAnalytics />
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
          <h2 className="mb-4 text-xl font-bold">1. 작성자·임차인 정보</h2>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ["TENANT", "임차인 본인"],
              ["FAMILY_OR_RELATED", "가족·관계인"],
              ["REPRESENTATIVE", "대리 작성자"],
              ["OTHER", "기타"],
            ].map(([value, label]) => (
              <label
                key={value}
                className="rounded-2xl border border-slate-700 p-4 text-sm"
              >
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
              <FieldLabel>임차인 성명</FieldLabel>
              <input
                className={inputClass()}
                value={form.tenantName}
                onChange={(event) => update("tenantName", event.target.value)}
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold">2. 임차주택·대항력 관련 정보</h2>
          <div className="grid gap-4">
            <div>
              <FieldLabel required>임차주택 주소</FieldLabel>
              <input
                className={inputClass()}
                value={form.propertyAddress}
                onChange={(event) => update("propertyAddress", event.target.value)}
              />
            </div>
            <div>
              <FieldLabel>주택 유형</FieldLabel>
              <input
                className={inputClass()}
                placeholder="아파트, 오피스텔, 다가구, 빌라 등"
                value={form.propertyType}
                onChange={(event) => update("propertyType", event.target.value)}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <CheckField
                checked={form.hasMoveInReport}
                label="전입신고를 했습니다"
                onChange={(checked) => update("hasMoveInReport", checked)}
              />
              <CheckField
                checked={form.hasFixedDate}
                label="확정일자를 받았습니다"
                onChange={(checked) => update("hasFixedDate", checked)}
              />
              <CheckField
                checked={form.hasPossession}
                label="실제 거주·점유 중입니다"
                onChange={(checked) => update("hasPossession", checked)}
              />
              <CheckField
                checked={form.hasLeaseRegistration}
                label="임차권등기를 했습니다"
                onChange={(checked) => update("hasLeaseRegistration", checked)}
              />
              <CheckField
                checked={form.hasJeonseRight}
                label="전세권이 설정되어 있습니다"
                onChange={(checked) => update("hasJeonseRight", checked)}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <FieldLabel>전입신고일</FieldLabel>
                <input
                  type="date"
                  className={inputClass()}
                  value={form.moveInDate}
                  onChange={(event) => update("moveInDate", event.target.value)}
                />
              </div>
              <div>
                <FieldLabel>확정일자</FieldLabel>
                <input
                  type="date"
                  className={inputClass()}
                  value={form.fixedDate}
                  onChange={(event) => update("fixedDate", event.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold">3. 임대차계약 정보</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel>계약 시작일</FieldLabel>
              <input
                type="date"
                className={inputClass()}
                value={form.leaseStartDate}
                onChange={(event) => update("leaseStartDate", event.target.value)}
              />
            </div>
            <div>
              <FieldLabel>계약 종료일</FieldLabel>
              <input
                type="date"
                className={inputClass()}
                value={form.leaseEndDate}
                onChange={(event) => update("leaseEndDate", event.target.value)}
              />
            </div>
            <div>
              <FieldLabel>임대차보증금</FieldLabel>
              <input
                className={inputClass()}
                placeholder="예: 250000000"
                value={form.depositAmount}
                onChange={(event) => update("depositAmount", event.target.value)}
              />
            </div>
            <div>
              <FieldLabel>월 차임</FieldLabel>
              <input
                className={inputClass()}
                value={form.monthlyRentAmount}
                onChange={(event) =>
                  update("monthlyRentAmount", event.target.value)
                }
              />
            </div>
          </div>
          <div className="mt-4">
            <FieldLabel>계약 관련 특이사항</FieldLabel>
            <textarea
              className={textareaClass()}
              placeholder="재계약, 특약, 보증보험, 선순위 권리 설명, 중개 과정에서 들은 설명 등"
              value={form.contractMemo}
              onChange={(event) => update("contractMemo", event.target.value)}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold">4. 임대인·중개 관련 정보</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel>임대인 성명 또는 명칭</FieldLabel>
              <input
                className={inputClass()}
                value={form.landlordName}
                onChange={(event) => update("landlordName", event.target.value)}
              />
            </div>
            <div>
              <FieldLabel>임대인 연락처</FieldLabel>
              <input
                className={inputClass()}
                value={form.landlordPhone}
                onChange={(event) => update("landlordPhone", event.target.value)}
              />
            </div>
            <div>
              <FieldLabel>중개사 성명</FieldLabel>
              <input
                className={inputClass()}
                value={form.brokerName}
                onChange={(event) => update("brokerName", event.target.value)}
              />
            </div>
            <div>
              <FieldLabel>중개사무소명</FieldLabel>
              <input
                className={inputClass()}
                value={form.brokerOfficeName}
                onChange={(event) =>
                  update("brokerOfficeName", event.target.value)
                }
              />
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel>임대인 관련 특이사항</FieldLabel>
              <textarea
                className={textareaClass()}
                value={form.landlordMemo}
                onChange={(event) => update("landlordMemo", event.target.value)}
              />
            </div>
            <div>
              <FieldLabel>중개 관련 특이사항</FieldLabel>
              <textarea
                className={textareaClass()}
                value={form.brokerMemo}
                onChange={(event) => update("brokerMemo", event.target.value)}
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold">5. 피해 유형</h2>
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
          <h2 className="mb-4 text-xl font-bold">6. 피해사실·자료</h2>
          <div className="grid gap-4">
            <div>
              <FieldLabel>보증금 반환 요구 이력</FieldLabel>
              <textarea
                className={textareaClass()}
                placeholder="언제, 누구에게, 어떤 방식으로 반환을 요구했는지 작성"
                value={form.returnRequestHistory}
                onChange={(event) =>
                  update("returnRequestHistory", event.target.value)
                }
              />
            </div>
            <div>
              <FieldLabel>경매·공매·압류 등 진행 상황</FieldLabel>
              <textarea
                className={textareaClass()}
                value={form.auctionOrSaleStatus}
                onChange={(event) =>
                  update("auctionOrSaleStatus", event.target.value)
                }
              />
            </div>
            <div>
              <FieldLabel>수사·고소·고발 관련 상황</FieldLabel>
              <textarea
                className={textareaClass()}
                value={form.investigationStatus}
                onChange={(event) =>
                  update("investigationStatus", event.target.value)
                }
              />
            </div>
            <div>
              <FieldLabel required>피해 사실 상세</FieldLabel>
              <textarea
                className={textareaClass()}
                placeholder="계약 체결부터 현재까지의 상황을 시간순으로 작성해 주세요."
                value={form.damageSummary}
                onChange={(event) => update("damageSummary", event.target.value)}
              />
            </div>
            <div>
              <FieldLabel>증거자료 목록</FieldLabel>
              <textarea
                className={textareaClass()}
                placeholder="임대차계약서, 확정일자, 주민등록초본, 등기부등본, 이체내역, 문자, 내용증명 등"
                value={form.evidenceSummary}
                onChange={(event) =>
                  update("evidenceSummary", event.target.value)
                }
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
            <span>
              서류 정리 및 관리자 확인을 위한 개인정보 수집·이용에 동의합니다.
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
          {loading ? "서류 정리 중..." : "무료 서류 정리 시작하기"}
        </button>
      </form>

      <aside className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
        <h2 className="text-xl font-bold">생성 결과</h2>

        {generatedSummary ? (
          <>
            <button
              type="button"
              onClick={copyAll}
              className="mt-4 w-full rounded-xl border border-cyan-300/50 px-4 py-3 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/10"
            >
              요약서·체크리스트 복사하기
            </button>
            <pre className="mt-4 max-h-[430px] overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-700 bg-slate-950 p-4 text-xs leading-6 text-slate-200">
              {generatedSummary}
            </pre>
            <pre className="mt-4 max-h-[430px] overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-700 bg-slate-950 p-4 text-xs leading-6 text-slate-200">
              {generatedChecklist}
            </pre>
          </>
        ) : (
          <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-950/50 p-5 text-sm leading-7 text-slate-300">
            입력을 완료하면 이곳에 피해사실 요약서와 제출자료 체크리스트가
            생성됩니다.
          </div>
        )}

        {createdReportId && uploadToken ? (
          <JeonseDamageAttachmentUploadForm
            reportId={createdReportId}
            uploadToken={uploadToken}
          />
        ) : null}
      </aside>
      </div>
    </>
  );
}
