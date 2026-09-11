# 사건–변호사: 배정 ≠ 매칭

## 현재 제품 진실 (2026-09-11)

| 개념 | 상태 |
|------|------|
| ADMIN 수동 **배정** (`createCaseAssignmentService`) | ✅ 본선 |
| Advice-only **매칭 추천** v1 | ✅ 스펙+API (`GET /api/cases/[caseId]/lawyer-match-advice`) |
| 자동 배정 / 부하·전문분야 스코어링 M2 | ❌ HQ 스펙 후 |

스펙: [CASE_LAWYER_MATCHING_ENGINE_SPEC.md](./CASE_LAWYER_MATCHING_ENGINE_SPEC.md)

patchset `case-lawyer-matching*` 파일명은 진단 호환 alias → `case-lawyer-assignment.service.test.ts`.
