# ARKAON RC3 — Retry / Job Candidate Survey (AI법친)

Survey date: 2026-07-28  
Purpose: select the **single safest** first L2 skill from real code, not a generic name.

## Producer map (RetryJob)

| sourceType | Producer exists? | Client send | Legal impact | L2 #1 |
|---|---|---|---|---|
| CRON | Yes (`syncFailedCronLogsToRetryJobs`) | No | No | **YES (queue marker only)** |
| EXTERNAL_MESSAGE | Yes | **Yes** | Indirect | HARD_DENY |
| DOCUMENT_PIPELINE | Yes | No | **Yes** | No |
| AI_CALL | Yes | Potential | **Yes** | No |
| BULK_ACTION | No (separate BulkActionJob) | No | No | No |
| AI_GOVERNANCE | No | — | — | No |
| MANUAL | No | — | — | No |

## Critical finding

`operatorQueueRetryJobService` only sets `RetryJob.status = PENDING_RETRY`.  
There is **no drain worker**. Actual cron re-run is a **different** admin API (`/api/admin/cron/logs/[logId]/retry`) and must **not** be called by the first L2 skill.

## Selected L2 skill

`retry_failed_internal_job_after_human_approval`

- sourceType: **CRON only**
- action: queue marker via `operatorQueueRetryJobService`
- no payload mutation
- no EXTERNAL_MESSAGE / DOCUMENT_PIPELINE / AI_* / BULK
- no cron re-run API
- APPROVE ≠ EXECUTE ≠ VERIFY
- Idempotency Gate blocks duplicate EXECUTE

## Rejected for RC3 #1

- EXTERNAL_MESSAGE redelivery — client-visible HARD_DENY
- DOCUMENT_PIPELINE recover — legal/document state HIGH
- AI_CALL reinvoke — legal + cost HIGH
- BulkActionJob retry — separate domain, mutates alert state MEDIUM
- Cron log `/retry` real execution — admin notification side effects MEDIUM
