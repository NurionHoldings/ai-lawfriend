# AI법친 OpsQueue 운영 배포 Runbook

## A. 사전 준비

1. main 브랜치 최신 상태 확인
2. 환경변수 적용 (`.env.production` 또는 호스팅 비밀)
3. DB 백업
4. 배포 버전 문자열(`NEXT_PUBLIC_APP_VERSION`) 갱신

## B. 배포 순서

1. `npx prisma migrate deploy`
2. `npm run db:seed` (최초·운영 SUPER_ADMIN 보장 등)
3. `npm run predeploy:check`
4. 프로덕션 배포 실행
5. `GET /api/health` 확인
6. `GET /api/release-meta` 확인
7. 관리자 로그인 후 핵심 화면 수동 확인

## C. 핵심 수동 확인 경로

- `/admin/alerts/ops-dashboard` — 운영 대시보드
- `/admin/alerts/ops-queue/board` — 운영 큐 칸반 보드
- `/admin/alerts/ops-queue/settings` — 운영 큐 설정
- `/admin/audit-logs` — 감사로그
- `/admin/system` — 시스템 점검(Health / Release Meta)

## D. 롤백 조건

- 인증 실패
- DB migration 오류
- 보드/대시보드 500 오류
- 재분배/대량편집 API 오류 반복
- 알림 중복 폭주

## E. 롤백 절차

1. 직전 정상 릴리즈로 재배포
2. feature flag로 위험 기능 비활성화 (`NEXT_PUBLIC_FF_OPS_QUEUE_*`)
3. 서버 로그 확인
4. 원인 분석 후 hotfix 브랜치 반영

## F. 권장 실행 순서(요약)

1. 환경변수 반영 → DB 백업
2. `npx prisma migrate deploy` → `npm run db:seed`
3. `npm run predeploy:check` → `npm run test:e2e`
4. 프로덕션 배포
5. `/api/health`, `/api/release-meta`, 핵심 관리자 URL 확인
6. cron·감사로그·WIP/SLA 알림 확인
