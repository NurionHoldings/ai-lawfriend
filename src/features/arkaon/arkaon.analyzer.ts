import { createHash } from "node:crypto";
import type { AwaitedReturn } from "./arkaon.types";
import type { observeAilawfriendOperations } from "./arkaon.adapter";
import type { ArkaonProposal, ArkaonPolicyResult } from "./arkaon.schema";
import { ARKAON_HARD_DENY_ACTIONS } from "./arkaon.policy";

function proposalId(seed: string) {
  return `arkaon_${createHash("sha256").update(seed).digest("hex").slice(0, 20)}`;
}

const POLICY_RESULT: ArkaonPolicyResult = {
  adviceOnly: true,
  executeAllowed: false,
  l3Enabled: false,
  humanApprovalRequired: true,
  deniedActions: [...ARKAON_HARD_DENY_ACTIONS],
  note: "RC2: approval records human review only. EXECUTE remains OFF.",
};

export function analyzeAilawfriendObservation(
  observation: AwaitedReturn<typeof observeAilawfriendOperations>,
): ArkaonProposal[] {
  const proposals: ArkaonProposal[] = [];
  const capturedAt = observation.operations.capturedAt;

  if (observation.operations.cron.failedInWindow > 0) {
    proposals.push({
      proposalId: proposalId(`cron:${capturedAt}:${observation.operations.cron.failedInWindow}`),
      platform: "AI법친",
      domain: "OPERATIONS_HEALTH",
      severity: "CRITICAL",
      title: "실패한 예약 작업 점검 필요",
      rationale: `최근 관찰 구간에 실패한 cron 작업 ${observation.operations.cron.failedInWindow}건이 감지되었습니다.`,
      evidence: observation.operations.cron.recentFailures
        .slice(0, 5)
        .map((row) => `${row.jobName}:${row.status}`),
      risk: "예약 작업 실패가 누적되면 알림·정합성·후속 배치가 끊길 수 있습니다. 자동 복구 실행은 금지됩니다.",
      recommendedAction: "실패 원인과 재시도 가능 여부를 운영자가 확인한 뒤 수동 복구 절차를 승인하세요.",
      policyResult: POLICY_RESULT,
      status: "PROPOSED",
      executeAllowed: false,
      createdAt: capturedAt,
    });
  }

  if (observation.operations.externalMessages.failedInWindow > 0) {
    proposals.push({
      proposalId: proposalId(
        `message:${capturedAt}:${observation.operations.externalMessages.failedInWindow}`,
      ),
      platform: "AI법친",
      domain: "OPERATIONS_HEALTH",
      severity: "WARNING",
      title: "외부 메시지 전송 실패 검토 필요",
      rationale: `최근 관찰 구간에 외부 메시지 실패/동의없음 ${observation.operations.externalMessages.failedInWindow}건이 감지되었습니다.`,
      evidence: observation.operations.externalMessages.recentFailures
        .slice(0, 5)
        .map((row) => `${row.channel}:${row.status}`),
      risk: "자동 재전송은 의뢰인 노출·동의 위반 위험이 있어 HARD DENY입니다.",
      recommendedAction: "동의 상태와 실패 원인을 분리 검토하고, 재전송은 인간 승인 후 기존 메시징 절차에서 수행하세요.",
      policyResult: POLICY_RESULT,
      status: "PROPOSED",
      executeAllowed: false,
      createdAt: capturedAt,
    });
  }

  if (observation.operations.audit.issueCountInWindow > 0) {
    proposals.push({
      proposalId: proposalId(`audit:${capturedAt}:${observation.operations.audit.issueCountInWindow}`),
      platform: "AI법친",
      domain: "LEGAL_RELIABILITY",
      severity: "WARNING",
      title: "운영 감사 이슈 묶음 검토 필요",
      rationale: `감사로그에서 운영 이슈 ${observation.operations.audit.issueCountInWindow}건이 관찰되었습니다.`,
      evidence: observation.operations.audit.recentIssues
        .slice(0, 5)
        .map((row) => `${row.action}:${row.entityType}/${row.entityId}`),
      risk: "법률판단 변경·의뢰인 노출을 ARKAON이 수행하면 안 됩니다. 검토 큐 배정만 권고합니다.",
      recommendedAction: "법률 판단을 변경하지 말고 이슈별 근거·영향범위·담당자를 확인하여 검토 큐에 배정하세요.",
      policyResult: POLICY_RESULT,
      status: "PROPOSED",
      executeAllowed: false,
      createdAt: capturedAt,
    });
  }

  return proposals;
}
