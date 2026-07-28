# ARKAON × AI법친 RC4 — EXECUTION RELIABILITY / RECOVERY (draft)

RC4 starts **only after** RC3 = `LOCKED_SAFE_L2`.  
No second L2 Skill in RC4. Prove reliability of  
`retry_failed_internal_job_after_human_approval` alone.

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

## Concepts to design (WITHER Outbox Lease lesson)

- lease / heartbeat on PROCESSING
- timeout → STUCK
- recovery proposal ledger (AuditLog + ArkaonExecution metadata)
- approve recovery ≠ auto re-execute without separate EXECUTE REQUEST

## Status

DRAFT — waiting RC3 LOCKED_SAFE_L2.
