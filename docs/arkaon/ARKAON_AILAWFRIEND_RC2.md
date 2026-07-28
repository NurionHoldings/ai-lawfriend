# ARKAON × AI법친 RC2 — Persistent Human Control Plane

## Position
RC1 established SAFE ADVICE-ONLY. RC2 adds durable business-state persistence and the ARKAON Control Center. EXECUTE and L3 remain OFF.

## Separation
- Business state: `ArkaonIssue` / `ArkaonDiagnosis` / `ArkaonPlan` / `ArkaonProposal` / `ArkaonApproval` / `ArkaonRun`
- Audit evidence: existing `AuditLog` (append-only trail)

## Cycle
OBSERVE → ANALYZE → PROPOSE → HUMAN APPROVE → EXECUTE(DISABLED)

## Control Center
Path: `/admin/arkaon`

Shows Overall State, Active Issues, Diagnoses, Proposed Actions, Awaiting Human Approval, Approved/Rejected, Policy Denied, Audit Evidence.

Each Proposal surfaces: WHY / EVIDENCE / RISK / RECOMMENDED ACTION / POLICY RESULT / HUMAN DECISION.

## LOCK (unchanged)
approve must never imply execute, deploy, send, account mutation, or legal judgment mutation.

## APIs
- `GET /api/admin/arkaon/control-center`
- `POST /api/admin/arkaon/snapshot`
- `POST /api/admin/arkaon/proposals/:proposalId/approve`
- `POST /api/admin/arkaon/proposals/:proposalId/reject`
