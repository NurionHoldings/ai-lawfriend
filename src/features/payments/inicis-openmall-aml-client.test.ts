import { describe, expect, it, vi } from "vitest";
import {
  InicisAmlClientNotWiredError,
  assertAmlClientMayPerformNetwork,
  buildPhaseBcReadiness,
  fetchAmlStatus,
} from "./inicis-openmall-aml-client";
import { INICIS_OPENMALL_AML_LIVE_GATE_WIRED } from "./inicis-openmall-aml";

describe("inicis-openmall-aml-client Phase B", () => {
  it("keeps live gate unwired", () => {
    expect(INICIS_OPENMALL_AML_LIVE_GATE_WIRED).toBe(false);
  });

  it("blocks network by default", () => {
    expect(() => assertAmlClientMayPerformNetwork()).toThrow(
      InicisAmlClientNotWiredError,
    );
  });

  it("fetchAmlStatus throws NotWired without test flag", async () => {
    await expect(fetchAmlStatus({ idMall: "mall-1" })).rejects.toBeInstanceOf(
      InicisAmlClientNotWiredError,
    );
  });

  it("reports phase B skeleton / C blocked", () => {
    const readiness = buildPhaseBcReadiness();
    expect(readiness.phaseA).toBe("complete");
    expect(readiness.phaseB.status).toBe("skeleton");
    expect(readiness.phaseC.status).toBe("blocked");
    expect(readiness.phaseB.liveGateWired).toBe(false);
  });

  it("does not call fetchImpl when unwired", async () => {
    const fetchImpl = vi.fn();
    await expect(
      fetchAmlStatus({ idMall: "mall-1" }, { fetchImpl: fetchImpl as unknown as typeof fetch }),
    ).rejects.toBeInstanceOf(InicisAmlClientNotWiredError);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
