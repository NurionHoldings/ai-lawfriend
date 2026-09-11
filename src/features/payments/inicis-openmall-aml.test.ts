import { describe, expect, it } from "vitest";
import {
  INICIS_OPENMALL_AML_LIVE_GATE_WIRED,
  decideAmlEligibility,
  parseAmlStatus,
  readApprovedStatusesFromEnv,
  seoulToday,
  type AmlStatus,
} from "./inicis-openmall-aml";

function baseStatus(overrides: Partial<AmlStatus> = {}): AmlStatus {
  return {
    requestId: "req-1",
    idMall: "mall-1",
    examinationStatus: "Y",
    authValid: true,
    validFrom: "2026-01-01",
    validTo: "2026-12-31",
    reexaminationStatus: null,
    examinedOn: "2026-01-01",
    companyNumber: null,
    companyName: null,
    ceoName: null,
    rawCode: "SM01",
    ...overrides,
  };
}

describe("inicis-openmall-aml Phase A stub", () => {
  it("keeps live gate unwired", () => {
    expect(INICIS_OPENMALL_AML_LIVE_GATE_WIRED).toBe(false);
  });

  it("fail-closes when allowlist is empty", () => {
    expect(decideAmlEligibility(baseStatus(), []).reason).toBe(
      "approved_status_allowlist_empty",
    );
    expect(readApprovedStatusesFromEnv("")).toEqual([]);
    expect(readApprovedStatusesFromEnv(" , ")).toEqual([]);
  });

  it("rejects expired auth flag", () => {
    expect(
      decideAmlEligibility(baseStatus({ authValid: false }), ["Y"], "2026-06-01").reason,
    ).toBe("aml_auth_expired");
  });

  it("rejects examination status outside allowlist", () => {
    expect(
      decideAmlEligibility(baseStatus({ examinationStatus: "N" }), ["Y"], "2026-06-01")
        .reason,
    ).toBe("aml_examination_not_approved");
  });

  it("uses Asia/Seoul calendar dates for validity window", () => {
    expect(
      decideAmlEligibility(baseStatus(), ["Y"], "2025-12-31").reason,
    ).toBe("aml_validity_not_started");
    expect(
      decideAmlEligibility(baseStatus(), ["Y"], "2027-01-01").reason,
    ).toBe("aml_validity_expired");
    expect(
      decideAmlEligibility(baseStatus(), ["Y"], "2026-06-15"),
    ).toEqual({ eligible: true, reason: "eligible" });
  });

  it("parses SM01 payload without calling the network", () => {
    const status = parseAmlStatus(
      "mall-9",
      {
        code: "SM01",
        data: {
          amlExmnYn: "y",
          amlAuthExpiredYn: "Y",
          amlReExecFromDt: "20260101",
          amlReExecToDt: "20261231",
          amlTransmDt: "20260102",
        },
      },
      { requestId: "corr-1" },
    );
    expect(status.requestId).toBe("corr-1");
    expect(status.examinationStatus).toBe("Y");
    expect(status.validFrom).toBe("2026-01-01");
    expect(status.validTo).toBe("2026-12-31");
  });

  it("exposes seoulToday as YYYY-MM-DD", () => {
    expect(seoulToday(new Date("2026-09-11T15:00:00Z"))).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
