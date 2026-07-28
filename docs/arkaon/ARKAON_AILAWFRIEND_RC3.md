# ARKAON × AI법친 RC3 — SAFE_L2_ACTION_DESIGN

## Goal
Prove **one** L2 skill may execute after a **separate** human act from approval. Not a catalog of automations.

## Flow
OBSERVE → ANALYZE → PROPOSE → APPROVE → SELECT L2 SKILL → POLICY GATE → EXECUTE → VERIFY

## First L2 Skill (only)
`retry_failed_internal_job_after_human_approval`

Selected after RetryJob survey (`docs/arkaon/ARKAON_RC3_RETRY_JOB_SURVEY.md`):

- **CRON RetryJob queue marker only** via `operatorQueueRetryJobService`
- does **not** call cron log re-run APIs
- no payload mutation
- no legal judgment change
- no client-visible send (`EXTERNAL_MESSAGE` denied)
- no payment / account / credential
- human APPROVE required
- execute is a second human POST
- Idempotency Gate blocks duplicate EXECUTE
- verify is a third step

## Separation LOCK
- `POST .../approve` → `approveArkaonProposal()` only
- `POST .../execute` → `executeApprovedSkill()` only (Registry → Policy → Approval → Idempotency → Executor)
- `POST .../verify` → `verifyExecutedSkill()` only

## RC3 status

**IMPLEMENTED / LOCK 직전** — `docs/arkaon/ARKAON_RC3_LOCK_REQUIRED.md` 체크리스트 전부 PASS 후 `LOCKED_SAFE_L2`.

Local prelock (no staging DB):

```bash
npm run verify:arkaon-ailawfriend-rc3:prelock
```

Staging LOCK gate (real DB concurrent EXECUTE):

```bash
# after migrate deploy including 20260728193000_...
set DATABASE_URL=...staging...
set ARKAON_RC3_STAGING_ACTOR_USER_ID=...adminUserId...
npm run verify:arkaon-ailawfriend-rc3:lock-gate
```

Evidence JSON: `docs/arkaon/evidence/rc3-concurrent-execute-latest.json`

Do **not** add a second L2 skill until RC3 is LOCKED on this single skill.
