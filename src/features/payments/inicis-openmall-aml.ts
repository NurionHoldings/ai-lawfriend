/**
 * KG Inicis OpenMall AML — Phase A pure policy stub (no network I/O).
 *
 * Port of MJN `app/integrations/inicis_openmall_aml.py` decision layer.
 * Live `amlstatus` client and payout wiring are Phase B/C — do not import
 * this into disbursement/execute paths until HQ enables them.
 */

export type AmlStatus = {
  requestId: string | null;
  idMall: string;
  examinationStatus: string | null;
  authValid: boolean;
  validFrom: string | null; // YYYY-MM-DD (Asia/Seoul business date)
  validTo: string | null;
  reexaminationStatus: string | null;
  examinedOn: string | null;
  companyNumber: string | null;
  companyName: string | null;
  ceoName: string | null;
  rawCode: string;
};

export type AmlDecision = {
  eligible: boolean;
  reason: string;
};

export class InicisAmlResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InicisAmlResponseError";
  }
}

/** Calendar date in Asia/Seoul as YYYY-MM-DD. */
export function seoulToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function readApprovedStatusesFromEnv(
  raw: string | undefined = process.env.INICIS_OPENMALL_AML_APPROVED_STATUSES,
): string[] {
  return String(raw ?? "")
    .split(",")
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean);
}

export function isInicisOpenMallAmlEnabled(
  raw: string | undefined = process.env.INICIS_OPENMALL_AML_ENABLED,
): boolean {
  return String(raw ?? "")
    .trim()
    .toLowerCase() === "true";
}

/** Phase A: live gate must stay unwired even if env flag is flipped accidentally. */
export const INICIS_OPENMALL_AML_LIVE_GATE_WIRED = false as const;

function yyyymmddToIso(value: unknown): string | null {
  const text = String(value ?? "").trim();
  if (!text) return null;
  if (!/^\d{8}$/.test(text)) {
    throw new InicisAmlResponseError("KG이니시스 AML 응답 날짜 형식이 올바르지 않습니다.");
  }
  return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`;
}

function compareIsoDates(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

export function parseAmlStatus(
  idMall: string,
  payload: Record<string, unknown>,
  options?: { requestId?: string | null },
): AmlStatus {
  if (String(payload.code ?? "") !== "SM01") {
    throw new InicisAmlResponseError("KG이니시스 AML 상태조회가 정상 처리되지 않았습니다.");
  }
  let data: unknown = payload.data;
  if (Array.isArray(data)) {
    data = data[0];
  }
  if (!data || typeof data !== "object") {
    throw new InicisAmlResponseError("KG이니시스 AML 상태 응답에 data가 없습니다.");
  }
  const row = data as Record<string, unknown>;
  const authFlag = String(row.amlAuthExpiredYn ?? "").toUpperCase();
  return {
    requestId: options?.requestId ?? null,
    idMall,
    examinationStatus: String(row.amlExmnYn ?? "").toUpperCase() || null,
    authValid: authFlag === "Y",
    validFrom: yyyymmddToIso(row.amlReExecFromDt),
    validTo: yyyymmddToIso(row.amlReExecToDt),
    reexaminationStatus: String(row.reAmlExmnYn ?? "").toUpperCase() || null,
    examinedOn: yyyymmddToIso(row.amlTransmDt),
    companyNumber: String(row.amlDtsNo ?? "") || null,
    companyName: String(row.amlConm ?? "") || null,
    ceoName: String(row.amlCeoNm ?? "") || null,
    rawCode: "SM01",
  };
}

export function decideAmlEligibility(
  status: AmlStatus,
  approvedExaminationStatuses: Iterable<string>,
  today?: string,
): AmlDecision {
  const approved = new Set(
    [...approvedExaminationStatuses]
      .map((value) => String(value).trim().toUpperCase())
      .filter(Boolean),
  );
  const current = today ?? seoulToday();

  if (approved.size === 0) {
    return { eligible: false, reason: "approved_status_allowlist_empty" };
  }
  if (!status.authValid) {
    return { eligible: false, reason: "aml_auth_expired" };
  }
  if (!status.examinationStatus || !approved.has(status.examinationStatus)) {
    return { eligible: false, reason: "aml_examination_not_approved" };
  }
  if (!status.validFrom || !status.validTo) {
    return { eligible: false, reason: "aml_validity_period_missing" };
  }
  if (compareIsoDates(current, status.validFrom) < 0) {
    return { eligible: false, reason: "aml_validity_not_started" };
  }
  if (compareIsoDates(current, status.validTo) > 0) {
    return { eligible: false, reason: "aml_validity_expired" };
  }
  return { eligible: true, reason: "eligible" };
}
