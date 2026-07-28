# AI법친 구현 점검 + ARKAON RC1 적용 결과

## 결론
기존 AI법친은 기능과 검증 문서가 매우 풍부하지만 운영 Intelligence가 여러 feature에 분산되어 있다. ARKAON은 기존 공부호를 대체하지 않고 상위 운영 Intelligence로 추가하는 것이 안전하다.

## 발견한 핵심 문제

### P0 — Control Tower Brain 상태가 메모리 Map
`src/features/control-tower-brain/control-tower-brain.repository.ts`의 issues / diagnoses / plans가 프로세스 메모리에만 존재한다.
- 재시작 시 손실
- 서버리스/다중 인스턴스에서 인스턴스 간 불일치
- scan → diagnose → plan → approve 연속성이 운영환경에서 보장되지 않음

RC1 조치: ARKAON Proposal/Human Approval 원장은 이 저장소를 재사용하지 않고 기존 DB `AuditLog`에 영속화했다.

### P0 — auto-fix 실행 의미가 실제 동작과 불일치
기존 `phase60e-safe-auto-fix.service.ts`는 실제 repository file mutation을 하지 않으면서 non-dry-run 결과에 `executed: true`를 반환했다.

RC1 조치: `executed: false`로 수정하고 메시지를 `approval/audit recorded; no repository mutation`으로 명확히 변경했다.

### P1 — 운영 Intelligence 분산
현재 운영 관련 기능이 control-tower-brain, operations-monitoring, legal-reliability, gongbuho-intelligence 등에 분산되어 상위 공통 정책/승인 원장이 없다.

RC1 조치: ARKAON Adapter → Analyzer → Proposal Ledger → Human Approval 계층을 추가했다.

### P1 — 공부호와 운영 AI의 역할 경계 필요
공부호는 법률 지식/사건 reasoning domain 기능이다. ARKAON과 이름 또는 실행권한을 섞으면 법률판단 자동화로 오인될 수 있다.

RC1 조치:
- 공부호: Legal Knowledge Domain Intelligence 유지
- ARKAON: Platform Operations Intelligence
- 법률판단 변경 / client-visible send / production deploy / 결제·정산·계정·credential: hard deny

## 추가 파일
- `src/features/arkaon/arkaon.policy.ts`
- `src/features/arkaon/arkaon.adapter.ts`
- `src/features/arkaon/arkaon.analyzer.ts`
- `src/features/arkaon/arkaon.ledger.ts`
- `src/features/arkaon/arkaon.service.ts`
- `src/features/arkaon/arkaon.schema.ts`
- `src/features/arkaon/arkaon.types.ts`
- `src/app/api/admin/arkaon/snapshot/route.ts`
- `src/app/api/admin/arkaon/proposals/[proposalId]/approve/route.ts`
- `docs/arkaon/ARKAON_AILAWFRIEND_RC1.md`
- `tools/verify-arkaon-ailawfriend-rc1.mjs`

## 정책 상태
- advice_only: true
- L3: disabled
- EXECUTE: disabled
- Human Approval: required
- Proposal persistence: AuditLog DB
- Approval persistence: AuditLog DB

## API
### POST `/api/admin/arkaon/snapshot`
운영 snapshot 관찰 → 분석 → proposal 생성/영속 → 현재 proposal 목록 반환.

### POST `/api/admin/arkaon/proposals/:proposalId/approve`
ADMIN 인간 승인 기록. 실행은 하지 않는다.

## 검증
`node tools/verify-arkaon-ailawfriend-rc1.mjs` → PASS

의존성 설치가 현재 실행환경 제한시간 내 완료되지 않아 전체 `tsc / vitest / next build`는 수행하지 못했다. 배포 전 개발환경에서 아래를 반드시 실행한다.

```bash
npm ci
npm run verify:arkaon-ailawfriend-rc1
npx tsc --noEmit
npm run test
npm run build
```

## 다음 권고
RC2에서 Control Tower Brain의 Map 저장소를 DB-backed repository로 교체하고, ARKAON Admin Console에서 Operations Health + Proposal Ledger + Approval을 한 화면으로 통합한다. 실행권은 계속 OFF로 유지한다.
