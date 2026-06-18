/**
 * P6 — Case-scoped real-time legal signal bridge.
 *
 * 외부 법령·판례·운영 신호를 59-B `RealTimeLegalSignal`로 정규화하고,
 * 상태 전이를 policy gate로 검증한다. 저장/수집 인프라는 호출자가 담당한다.
 */
import { createHash } from "node:crypto";
import {
  assertRealTimeLegalSignalScope,
  assertRealTimeLegalSignalSourceTrace,
  assertRealTimeLegalSignalTransitionAllowed,
} from "./phase59b-real-time-legal-signal.policy";
import {
  realTimeLegalSignalSchema,
  type RealTimeLegalSignal,
  type RealTimeLegalSignalLifecycleStatus,
} from "./phase59b-real-time-legal-signal.schema";

export const CASE_REAL_TIME_LEGAL_SIGNAL_BRIDGE_SERVICE_MARKER =
  "case-real-time-legal-signal-bridge-service" as const;

export type BuildCaseRealTimeLegalSignalInput = {
  caseId: string;
  tenantId: string;
  signalKind: RealTimeLegalSignal["signalKind"];
  title: string;
  summaryPointer: string;
  canonicalSourceRef: string;
  sourceReliability?: RealTimeLegalSignal["sourceReliability"];
  conflictStatus?: RealTimeLegalSignal["conflictStatus"];
  caseRelevanceScore?: number;
  status?: RealTimeLegalSignalLifecycleStatus;
  lawyerReviewed?: boolean;
  compilerPolicyApplied?: boolean;
  fetchedAt?: Date;
  staleAfter?: Date;
};

function stableId(prefix: string, ...parts: string[]) {
  return `${prefix}-${createHash("sha1").update(parts.join("|")).digest("hex").slice(0, 14)}`;
}

export function buildCaseRealTimeLegalSignal(
  input: BuildCaseRealTimeLegalSignalInput,
): RealTimeLegalSignal {
  const fetchedAt = input.fetchedAt ?? new Date();
  const staleAfter =
    input.staleAfter ?? new Date(fetchedAt.getTime() + 1000 * 60 * 60 * 24 * 180);
  const status = input.status ?? "FETCHED";

  const signal = realTimeLegalSignalSchema.parse({
    signalId: stableId("rtls", input.caseId, input.canonicalSourceRef, input.summaryPointer),
    caseId: input.caseId,
    tenantId: input.tenantId,
    title: input.title,
    summaryPointer: input.summaryPointer,
    signalKind: input.signalKind,
    status,
    sourceReliability: input.sourceReliability ?? "MEDIUM",
    conflictStatus: input.conflictStatus ?? "UNKNOWN",
    caseRelevanceScore: input.caseRelevanceScore ?? 0.6,
    lawyerReviewRequired: status !== "APPROVED_FOR_AI_USE",
    lawyerReviewed: input.lawyerReviewed ?? status === "APPROVED_FOR_AI_USE",
    staleAfter: staleAfter.toISOString(),
    fetchedAt: fetchedAt.toISOString(),
    updatedAt: fetchedAt.toISOString(),
    sourceTrace: {
      traceId: stableId("rtls-trace", input.caseId, input.canonicalSourceRef),
      sourceKind: input.signalKind,
      canonicalSourceRef: input.canonicalSourceRef,
      summaryPointer: input.summaryPointer,
      fetchedAt: fetchedAt.toISOString(),
      verifiedAt: status === "APPROVED_FOR_AI_USE" ? fetchedAt.toISOString() : undefined,
    },
    compilerPolicyApplied: input.compilerPolicyApplied ?? status === "APPROVED_FOR_AI_USE",
    caseScopeOnly: true,
    tenantIsolationRequired: true,
  });

  assertRealTimeLegalSignalScope(signal);
  assertRealTimeLegalSignalSourceTrace({ sourceTrace: signal.sourceTrace });
  return signal;
}

export function transitionCaseRealTimeLegalSignal(
  signal: RealTimeLegalSignal,
  toStatus: RealTimeLegalSignalLifecycleStatus,
  updatedAt: Date = new Date(),
): RealTimeLegalSignal {
  assertRealTimeLegalSignalTransitionAllowed({
    fromStatus: signal.status,
    toStatus,
  });

  return realTimeLegalSignalSchema.parse({
    ...signal,
    status: toStatus,
    lawyerReviewRequired: toStatus !== "APPROVED_FOR_AI_USE",
    lawyerReviewed: signal.lawyerReviewed || toStatus === "APPROVED_FOR_AI_USE",
    updatedAt: updatedAt.toISOString(),
    compilerPolicyApplied: signal.compilerPolicyApplied || toStatus === "APPROVED_FOR_AI_USE",
    sourceTrace: {
      ...signal.sourceTrace,
      verifiedAt: toStatus === "APPROVED_FOR_AI_USE"
        ? updatedAt.toISOString()
        : signal.sourceTrace.verifiedAt,
    },
  });
}
