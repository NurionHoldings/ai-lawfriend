# AI법친 OpsQueue 운영 배포 체크리스트

## 1. 배포 전

- [ ] `.env.production` 값 점검
- [ ] `DATABASE_URL` 확인
- [ ] `JWT_SECRET` / `CRON_SECRET` 확인
- [ ] `NEXT_PUBLIC_APP_VERSION` 갱신
- [ ] feature flag 확인 (`NEXT_PUBLIC_FF_*`)
- [ ] `prisma migrate deploy` 적용 준비
- [ ] 관리자 계정 seed 가능 상태 확인 (`npm run db:seed`)

## 2. 코드 검증

- [ ] `npm run predeploy:check`
- [ ] `npm run test:e2e` 주요 흐름 통과
- [ ] 보드 / 상세 / 대량편집 / 재분배 / WIP 설정 주요 화면 수동 점검

## 3. 배포 직후

- [ ] `GET /api/health` 확인
- [ ] `GET /api/release-meta` 확인
- [ ] 로그인 확인
- [ ] `/admin/alerts/ops-dashboard` 운영 대시보드 진입 확인
- [ ] `/admin/alerts/ops-queue/board` OpsQueue 보드 조회 확인
- [ ] 상세 슬라이드오버 확인
- [ ] 재분배 추천 표시 확인
- [ ] cron secret 동작 확인 (내부 cron 엔드포인트)

## 4. 배포 후 1차 모니터링

- [ ] 서버 로그 에러 급증 여부 확인
- [ ] 운영 큐 수정/이동 감사로그 적재 확인
- [ ] 타임라인 적재 확인
- [ ] WIP 초과 알림 / SLA 알림 적재 확인

## 5. 롤백 기준

- [ ] 로그인 불가
- [ ] 운영 대시보드 진입 불가
- [ ] OpsQueue 보드 500 에러 지속
- [ ] 감사로그/타임라인 적재 실패
- [ ] cron 관련 과도한 중복 알림 발생
