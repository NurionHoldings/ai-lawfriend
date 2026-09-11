/**
 * Phase B OpenMall AML HTTP client skeleton.
 * Default: not wired — throws unless explicitly force-enabled for isolated tests.
 * Must NOT be imported from payout execute paths while LIVE_GATE_WIRED=false.
 */

import {
  INICIS_OPENMALL_AML_LIVE_GATE_WIRED,
  isInicisOpenMallAmlEnabled,
  parseAmlStatus,
  type AmlStatus,
} from "./inicis-openmall-aml";

export class InicisAmlClientNotWiredError extends Error {
  constructor(message = "OpenMall AML HTTP client is not wired (Phase B skeleton)") {
    super(message);
    this.name = "InicisAmlClientNotWiredError";
  }
}

export type FetchAmlStatusInput = {
  idMall: string;
  requestId?: string;
  /** Test-only: allow calling fetch when LIVE_GATE still false. Never use in prod payout. */
  allowUnwiredNetworkForTest?: boolean;
};

function readBaseUrl(): string {
  return (
    process.env.INICIS_OPENMALL_API_BASE_URL?.trim() ||
    "https://apiwi.inicis.com"
  ).replace(/\/$/, "");
}

function readTimeoutMs(): number {
  const seconds = Number(process.env.INICIS_OPENMALL_TIMEOUT_SECONDS || "5");
  const safe = Number.isFinite(seconds) && seconds > 0 ? seconds : 5;
  return Math.min(30, Math.max(1, safe)) * 1000;
}

/**
 * Phase B readiness: network path stays closed unless LIVE_GATE_WIRED flips (Phase C)
 * or an explicit test harness flag is passed.
 */
export function assertAmlClientMayPerformNetwork(options?: {
  allowUnwiredNetworkForTest?: boolean;
}): void {
  if (INICIS_OPENMALL_AML_LIVE_GATE_WIRED) return;
  if (options?.allowUnwiredNetworkForTest) return;
  throw new InicisAmlClientNotWiredError(
    "INICIS_OPENMALL_AML_LIVE_GATE_WIRED=false — Phase C HQ PR required before network amlstatus",
  );
}

/**
 * Skeleton fetch. By default throws NotWiredError (no network).
 * When allowUnwiredNetworkForTest is set, performs HTTP GET and parses SM01 payload.
 */
export async function fetchAmlStatus(
  input: FetchAmlStatusInput,
  deps?: { fetchImpl?: typeof fetch },
): Promise<AmlStatus> {
  assertAmlClientMayPerformNetwork({
    allowUnwiredNetworkForTest: input.allowUnwiredNetworkForTest,
  });

  if (!isInicisOpenMallAmlEnabled()) {
    throw new InicisAmlClientNotWiredError(
      "INICIS_OPENMALL_AML_ENABLED is not true",
    );
  }

  const requestId =
    input.requestId?.trim() ||
    `aml-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const url = `${readBaseUrl()}/openmall/amlstatus`; // path placeholder — HQ confirms final path
  const fetchImpl = deps?.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), readTimeoutMs());

  try {
    const response = await fetchImpl(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-Request-ID": requestId,
        // API KEY must come from server env only — never log
      },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new InicisAmlClientNotWiredError(
        `amlstatus HTTP ${response.status}`,
      );
    }
    const payload = (await response.json()) as Record<string, unknown>;
    return parseAmlStatus(input.idMall, payload, { requestId });
  } finally {
    clearTimeout(timer);
  }
}

export function buildPhaseBcReadiness() {
  return {
    phaseA: "complete" as const,
    phaseB: {
      status: "skeleton" as const,
      httpClient: "present_not_wired",
      liveGateWired: INICIS_OPENMALL_AML_LIVE_GATE_WIRED,
      blockers: [
        "HQ_CONTRACT_MID_API_KEY",
        "HQ_WRITTEN_APPROVED_STATUSES",
        "PRISMA_IDMALL_PROFILE_PENDING_HQ",
      ],
    },
    phaseC: {
      status: "blocked" as const,
      liveGateWired: INICIS_OPENMALL_AML_LIVE_GATE_WIRED,
      blockers: [
        "PHASE_B_EXIT",
        "PAYOUT_HOOK_NOT_PRESENT",
        "HQ_SINGLE_PR_TO_FLIP_LIVE_GATE",
      ],
    },
  };
}
