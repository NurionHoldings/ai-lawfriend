"use client";

import { useState } from "react";
import type { ArkaonProposal } from "@/features/arkaon/arkaon.schema";

type ControlCenterSnapshot = {
  marker: "arkaon-control-center-rc3";
  policy: {
    platform: string;
    policyVersion: string;
    adviceOnly: boolean;
    l3Enabled: boolean;
    executeEnabled: boolean;
    humanApprovalRequired: boolean;
  };
  executeGate: { allowed: boolean; reason?: string };
  overall: {
    health: "OK" | "ATTENTION" | "CRITICAL";
    openIssueCount: number;
    diagnosisCount: number;
    planCount: number;
    proposalCount: number;
    awaitingHumanApproval: number;
    approvedCount: number;
    executionAvailableCount: number;
    executionBlockedCount: number;
    executedCount: number;
    verifiedCount: number;
    failedCount: number;
    rejectedCount: number;
    policyDeniedCount: number;
    l3Enabled: false;
    executeEnabled: false;
  };
  brain: {
    issues: Array<{ issueId: string; severity: string; summary: string; source: string }>;
    diagnoses: Array<{ diagnosisId: string; issueId: string; summary: string; code: string }>;
    plans: Array<{
      planId: string;
      riskLevel: string;
      approved: boolean;
      requiresHumanApproval: boolean;
      proposedChanges: Array<{ changeSummary: string }>;
    }>;
  };
  proposals: {
    all: ArkaonProposal[];
    awaitingApproval: ArkaonProposal[];
    approved: ArkaonProposal[];
    executionAvailable: ArkaonProposal[];
    executionBlocked: ArkaonProposal[];
    executed: ArkaonProposal[];
    verified: ArkaonProposal[];
    failed: ArkaonProposal[];
    rejected: ArkaonProposal[];
    policyDenied: ArkaonProposal[];
  };
  auditEvidence: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    message: string | null;
    actorUserId: string;
    createdAt: string;
  }>;
};

type Props = {
  initialSnapshot: ControlCenterSnapshot;
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-aibeop-border bg-white p-4">
      <p className="text-xs text-aibeop-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-aibeop-deep">{value}</p>
    </div>
  );
}

function ProposalCard({
  proposal,
  busy,
  onApprove,
  onReject,
  onExecute,
  onVerify,
}: {
  proposal: ArkaonProposal;
  busy: string | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onExecute: (id: string) => void;
  onVerify: (id: string) => void;
}) {
  return (
    <article className="space-y-3 rounded-xl border border-aibeop-border bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-aibeop-muted">
            {proposal.severity} · {proposal.domain}
            {proposal.skillId ? ` · ${proposal.skillId}` : ""}
          </p>
          <h3 className="text-base font-semibold text-aibeop-deep">{proposal.title}</h3>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
            {proposal.status}
          </span>
          {proposal.executionStatus ? (
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
              {proposal.executionStatus}
            </span>
          ) : null}
        </div>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-aibeop-deep">WHY</dt>
          <dd className="text-aibeop-muted">{proposal.rationale}</dd>
        </div>
        <div>
          <dt className="font-semibold text-aibeop-deep">RISK</dt>
          <dd className="text-aibeop-muted">{proposal.risk}</dd>
        </div>
        <div>
          <dt className="font-semibold text-aibeop-deep">EVIDENCE</dt>
          <dd className="text-aibeop-muted">
            {proposal.evidence.length ? (
              <ul className="list-disc pl-4">
                {proposal.evidence.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              "—"
            )}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-aibeop-deep">RECOMMENDED ACTION</dt>
          <dd className="text-aibeop-muted">{proposal.recommendedAction}</dd>
        </div>
        <div>
          <dt className="font-semibold text-aibeop-deep">POLICY RESULT</dt>
          <dd className="text-aibeop-muted">
            L3=false · bare EXECUTE=OFF · {proposal.policyResult.note}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-aibeop-deep">HUMAN DECISION</dt>
          <dd className="text-aibeop-muted">
            {proposal.humanDecision ?? "PENDING"}
            {proposal.approvedByUserId ? ` · ${proposal.approvedByUserId}` : ""}
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-2">
        {proposal.status === "PROPOSED" ? (
          <>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => onApprove(proposal.proposalId)}
              className="rounded-lg bg-aibeop-deep px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              1. Approve (no execute)
            </button>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => onReject(proposal.proposalId)}
              className="rounded-lg border border-aibeop-border px-3 py-2 text-sm font-medium text-aibeop-deep disabled:opacity-50"
            >
              Reject
            </button>
          </>
        ) : null}
        {proposal.status === "APPROVED" && proposal.executionStatus === "EXECUTION_AVAILABLE" ? (
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => onExecute(proposal.proposalId)}
            className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            2. Execute L2 Skill
          </button>
        ) : null}
        {proposal.status === "EXECUTED" || proposal.executionStatus === "EXECUTED" ? (
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => onVerify(proposal.proposalId)}
            className="rounded-lg border border-emerald-700 px-3 py-2 text-sm font-medium text-emerald-800 disabled:opacity-50"
          >
            3. Verify
          </button>
        ) : null}
      </div>
    </article>
  );
}

export function ArkaonControlCenter({ initialSnapshot }: Props) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function refresh() {
    const response = await fetch("/api/admin/arkaon/control-center");
    const json = await response.json();
    if (json.ok) setSnapshot(json.data);
  }

  async function runObserve() {
    setBusy("observe");
    setMessage(null);
    try {
      const response = await fetch("/api/admin/arkaon/snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ windowHours: 24 }),
      });
      const json = await response.json();
      if (!response.ok || !json.ok) throw new Error(json.error ?? "Observe failed");
      await refresh();
      setMessage("OBSERVE → ANALYZE → PROPOSE 완료. L3 OFF · bare EXECUTE OFF.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Observe failed");
    } finally {
      setBusy(null);
    }
  }

  async function postAction(path: string, label: string, successMessage: string) {
    setBusy(label);
    setMessage(null);
    try {
      const response = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const json = await response.json();
      if (!response.ok || !json.ok) throw new Error(json.error ?? `${label} failed`);
      await refresh();
      setMessage(successMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : `${label} failed`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-medium text-aibeop-muted">ARKAON × AI법친 RC3</p>
        <h1 className="text-2xl font-bold text-aibeop-deep">ARKAON CONTROL CENTER</h1>
        <p className="text-sm text-aibeop-muted">
          SAFE_L2_ACTION_DESIGN · approve ≠ execute · L3 OFF · HARD DENY LOCK
        </p>
      </header>

      {message ? (
        <p className="rounded-lg border border-aibeop-border bg-slate-50 px-4 py-3 text-sm text-aibeop-deep">
          {message}
        </p>
      ) : null}

      <section className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void runObserve()}
          className="rounded-lg bg-aibeop-deep px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {busy === "observe" ? "Running…" : "Run OBSERVE → PROPOSE"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void refresh()}
          className="rounded-lg border border-aibeop-border px-4 py-2 text-sm font-medium text-aibeop-deep disabled:opacity-50"
        >
          Refresh
        </button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Overall State" value={snapshot.overall.health} />
        <StatCard label="APPROVED" value={snapshot.overall.approvedCount} />
        <StatCard label="EXECUTION AVAILABLE" value={snapshot.overall.executionAvailableCount} />
        <StatCard label="EXECUTION BLOCKED" value={snapshot.overall.executionBlockedCount} />
        <StatCard label="EXECUTED" value={snapshot.overall.executedCount} />
        <StatCard label="VERIFIED" value={snapshot.overall.verifiedCount} />
        <StatCard label="FAILED" value={snapshot.overall.failedCount} />
        <StatCard label="L3 / bare EXECUTE" value="OFF / OFF" />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-aibeop-deep">Awaiting Human Approval</h2>
        {snapshot.proposals.awaitingApproval.length === 0 ? (
          <p className="text-sm text-aibeop-muted">대기 중인 Proposal이 없습니다.</p>
        ) : (
          snapshot.proposals.awaitingApproval.map((proposal) => (
            <ProposalCard
              key={proposal.proposalId}
              proposal={proposal}
              busy={busy}
              onApprove={(id) =>
                void postAction(
                  `/api/admin/arkaon/proposals/${id}/approve`,
                  "approve",
                  "승인 기록 완료. 실행은 별도 EXECUTE 행위가 필요합니다.",
                )
              }
              onReject={(id) =>
                void postAction(`/api/admin/arkaon/proposals/${id}/reject`, "reject", "반려 기록 완료.")
              }
              onExecute={() => undefined}
              onVerify={() => undefined}
            />
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-aibeop-deep">Execution Available / Blocked</h2>
        {[...snapshot.proposals.executionAvailable, ...snapshot.proposals.executionBlocked].length ===
        0 ? (
          <p className="text-sm text-aibeop-muted">실행 가능/차단 Proposal이 없습니다.</p>
        ) : (
          [...snapshot.proposals.executionAvailable, ...snapshot.proposals.executionBlocked].map(
            (proposal) => (
              <ProposalCard
                key={proposal.proposalId}
                proposal={proposal}
                busy={busy}
                onApprove={() => undefined}
                onReject={() => undefined}
                onExecute={(id) =>
                  void postAction(
                    `/api/admin/arkaon/proposals/${id}/execute`,
                    "execute",
                    "L2 Skill 실행 요청 완료 (approve와 분리됨).",
                  )
                }
                onVerify={(id) =>
                  void postAction(
                    `/api/admin/arkaon/proposals/${id}/verify`,
                    "verify",
                    "검증 요청 완료.",
                  )
                }
              />
            ),
          )
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-aibeop-deep">Executed / Verified / Failed</h2>
        {[
          ...snapshot.proposals.executed,
          ...snapshot.proposals.verified,
          ...snapshot.proposals.failed,
        ].length === 0 ? (
          <p className="text-sm text-aibeop-muted">실행·검증 이력이 없습니다.</p>
        ) : (
          [
            ...snapshot.proposals.executed,
            ...snapshot.proposals.verified,
            ...snapshot.proposals.failed,
          ].map((proposal) => (
            <ProposalCard
              key={`${proposal.proposalId}-${proposal.status}`}
              proposal={proposal}
              busy={busy}
              onApprove={() => undefined}
              onReject={() => undefined}
              onExecute={() => undefined}
              onVerify={(id) =>
                void postAction(
                  `/api/admin/arkaon/proposals/${id}/verify`,
                  "verify",
                  "검증 요청 완료.",
                )
              }
            />
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-aibeop-deep">Audit Evidence</h2>
        <div className="overflow-x-auto rounded-xl border border-aibeop-border bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-aibeop-border bg-slate-50 text-xs uppercase text-aibeop-muted">
              <tr>
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Entity</th>
                <th className="px-3 py-2">Message</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.auditEvidence.map((row) => (
                <tr key={row.id} className="border-b border-aibeop-border/60">
                  <td className="px-3 py-2 whitespace-nowrap text-aibeop-muted">{row.createdAt}</td>
                  <td className="px-3 py-2 font-medium text-aibeop-deep">{row.action}</td>
                  <td className="px-3 py-2 text-aibeop-muted">
                    {row.entityType}/{row.entityId}
                  </td>
                  <td className="px-3 py-2 text-aibeop-muted">{row.message ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-aibeop-muted">
          LOCK: L3 OFF · HARD DENY 유지 · approve 안에 execute 금지 · {snapshot.executeGate.reason}
        </p>
      </section>
    </div>
  );
}
