# ARKAON × AI법친 RC4 — EXECUTION RELIABILITY / RECOVERY

Prerequisite: RC3 = `LOCKED_SAFE_L2` ✅ (2026-07-29)

RC4 does **not** add features or a second L2 Skill.  
Prove reliability of `retry_failed_internal_job_after_human_approval` only.

## Goal
Detect stuck executions and propose recovery — **never auto-recover**.

## State machine

```text
CLAIMED
  ↓
PROCESSING
  ├─ VERIFIED
  ├─ FAILED
  └─ STUCK
       ↓
   RECOVERY_PROPOSED   (auto detectable / auto propose OK)
       ↓
   HUMAN_APPROVED      (required)
       ↓
   RECOVERED
```

## Boundaries

| Action | Automatic? |
|---|---|
| stuck 감지 | Yes |
| recovery 제안 | Yes |
| recovery 실행 | **No — human approval required** |
| new L2 skill | **No** |
| L3 autonomy | **No** |

## Concepts (WITHER Outbox Lease lesson)

- lease / heartbeat on PROCESSING
- timeout → STUCK
- recovery proposal ledger (AuditLog + ArkaonExecution metadata)
- approve recovery ≠ auto re-execute without separate EXECUTE REQUEST

## Separate track (not ARKAON RC4)

AI법친 신규 DB baseline / failed-migration hygiene — fix outside ARKAON scope.

## Status

READY TO START (RC3 LOCKED).
