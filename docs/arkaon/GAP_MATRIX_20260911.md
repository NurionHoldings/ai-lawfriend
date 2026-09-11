# AI법친 갭 매트릭스 — 2026-09-11

Live payout / AML **live gate 활성화는 HQ 단일 PR 전 금지**.

## Batch 1–2 ✅

Participation fail-closed · Control Center AML 패널 · CI prelock · 통신판매 **미신청** · smoke AML · seed prod 가드 · 배정≠매칭 문서

## Batch 3 ✅ (본 세션)

| 축 | 산출 |
|----|------|
| 매칭 엔진 스펙 | `docs/arkaon/CASE_LAWYER_MATCHING_ENGINE_SPEC.md` + advice-only API/스코어러 |
| AML Phase B/C | `docs/arkaon/INICIS_OPENMALL_AML_PHASE_BC.md` + HTTP client skeleton (default not wired) + guidance `phaseRoadmap` |
| 운영 계정 로테이션 | `docs/operations/OPS_SMOKE_ACCOUNT_ROTATION_RUNBOOK.md` + `npm run ops:smoke-account-rotation-check` |

## HQ 잔여

| 항목 | 필요 |
|------|------|
| 매칭 M2 | 전문분야·부하 가중 · UI 패널 |
| AML B exit | 계약·MID·KEY · 서면 APPROVED_STATUSES · idMall 프로필 마이그레이션 |
| AML C | 지급 훅 + `LIVE_GATE_WIRED` 단일 플립 |
| Smoke 로테이션 실행 | staging/prod에서 실제 비밀번호 교체 후 rotation-check + role-smoke |
| 통신판매 번호 | 신청·발급 후 푸터 교체 |
