# ARKAON × AI법친 — RC3_LOCK_REQUIRED

RC3는 **IMPLEMENTED** 상태이며, 아래를 **전부 PASS**한 뒤에만 `LOCKED_SAFE_L2`로 승격한다.  
두 번째 L2 Skill은 LOCK 전·직후 모두 추가하지 않는다. 허용 Skill = **1**.

## RC3_LOCK_REQUIRED checklist

| # | Gate | How |
|---|---|---|
| 1 | Static verifier | `npm run verify:arkaon-ailawfriend-rc3` |
| 2 | Lock-validation Vitest | `npm run verify:arkaon-ailawfriend-rc3:lock-validation` (14/14) |
| 3 | Migration applied on staging DB | `20260728183000_...` + `20260728190000_...` + `20260728193000_...` via `prisma migrate deploy` |
| 4 | Partial unique index confirmed | staging script checks `ArkaonExecution_proposalId_skillId_active_uidx` |
| 5 | Real DB concurrent EXECUTE | `npm run verify:arkaon-ailawfriend-rc3:staging-concurrent` |
| 6 | Exactly-one mutation confirmed | evidence `mutationCount === 1` |
| 7 | Audit evidence persisted | AuditLog rows for execute/verify |
| 8 | VERIFY result persisted | proposal/execution → `VERIFIED` |
| 9 | HARD DENY regression | Vitest scenarios 4–6 (+ optional staging probes) |
| 10 | approve ≠ execute regression | Vitest scenario 11 + approve route static check |

## Staging concurrent evidence shape

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

Output path (default): `docs/arkaon/evidence/rc3-concurrent-execute-latest.json`

## LOCK promotion record (fill when all PASS)

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
```

## After LOCK

- Status → `LOCKED_SAFE_L2`
- Still **no second L2 skill**
- RC4 focus: operational stability, recovery, stuck execution, lease/timeout (WITHER Outbox Lease 교훈)
