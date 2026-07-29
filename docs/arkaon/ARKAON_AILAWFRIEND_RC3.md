# ARKAON × AI법친 RC3 — SAFE_L2_ACTION_DESIGN

## STATUS: `LOCKED_SAFE_L2` ✅

## Goal
Prove **one** L2 skill may execute after a **separate** human act from approval. Not a catalog of automations.

## Flow
OBSERVE → ANALYZE → PROPOSE → APPROVE → SELECT L2 SKILL → POLICY GATE → EXECUTE → VERIFY

## Locked L2 Skill (only)
`retry_failed_internal_job_after_human_approval`

- **CRON RetryJob queue marker only** via `operatorQueueRetryJobService`
- does **not** call cron log re-run APIs
- no payload mutation / legal judgment / client-visible send / payment / account
- APPROVE ≠ EXECUTE ≠ VERIFY
- Idempotency + partial unique index + P2002 race handling

## Separation LOCK
- `POST .../approve` → approval only
- `POST .../execute` → `executeApprovedSkill()` only
- `POST .../verify` → `verifyExecutedSkill()` only

## Evidence
- Checklist: `docs/arkaon/ARKAON_RC3_LOCK_REQUIRED.md`
- Concurrent JSON: `docs/arkaon/evidence/rc3-concurrent-execute-latest.json`
- Survey: `docs/arkaon/ARKAON_RC3_RETRY_JOB_SURVEY.md`

## Policy after LOCK
- Second L2 Skill: ❌
- L3 autonomous: ❌
- Next: RC4 EXECUTION RELIABILITY / RECOVERY
