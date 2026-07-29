# ARKAON × AI법친 — RC3_LOCK_REQUIRED

## STATUS: `LOCKED_SAFE_L2` ✅

Locked at: 2026-07-29  
Allowed L2 skills: **1** (`retry_failed_internal_job_after_human_approval`)  
Second L2 Skill: **금지** · L3 autonomous: **금지**

## RC3_LOCK_REQUIRED checklist (final)

| # | Gate | Final |
|---|---|---|
| 1 | Static verifier | ✅ PASS |
| 2 | Lock-validation 14/14 | ✅ PASS |
| 3 | Staging migration 3개 | ✅ PASS |
| 4 | Partial unique index | ✅ PASS |
| 5 | 실DB Concurrent EXECUTE | ✅ PASS |
| 6 | Exactly-one mutation | ✅ 1 |
| 7 | Audit evidence persisted | ✅ `ARKAON_SKILL_EXECUTED` + `ARKAON_SKILL_VERIFIED` (`entityType: ARKAON_EXECUTION`) |
| 8 | VERIFY persisted | ✅ VERIFIED |
| 9 | HARD DENY regression | ✅ violation 0 |
| 10 | approve ≠ execute | ✅ triggered execution 0 |

## Real-DB concurrent evidence

```json
{
  "scenario": "concurrent_execute_same_proposal",
  "requestCount": 2,
  "claimSuccess": 1,
  "claimRejected": 1,
  "mutationCount": 1,
  "activeExecutionCount": 1,
  "finalRetryJobStatus": "PENDING_RETRY",
  "verification": "VERIFIED",
  "hardDenyViolations": 0,
  "approveTriggeredExecutions": 0
}
```

Source: `docs/arkaon/evidence/rc3-concurrent-execute-latest.json`

## LOCK EVIDENCE (confirmed)

```text
ARKAON × AI법친 RC3 LOCK EVIDENCE

Static verification: PASS
Lock validation: 14/14 PASS
Allowed L2 skills: 1
Autonomous L3 skills: 0
Concurrent execute requests: 2
Successful claims: 1
Rejected claims: 1
Business mutations: 1
Hard-deny violations: 0
Approve-triggered executions: 0
Verification failures: 0

STATUS: LOCKED_SAFE_L2
```

## After LOCK

- Do **not** add a second L2 skill
- L3 remains OFF
- Next: **RC4 EXECUTION RELIABILITY / RECOVERY** only  
  (stuck · lease/timeout · crash recovery · worker recovery)
- Separate track: AI법친 신규 DB baseline/migration 정비 (ARKAON과 분리)
