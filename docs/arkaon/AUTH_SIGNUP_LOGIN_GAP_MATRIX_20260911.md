# 회원가입·로그인 갭 매트릭스 — 2026-09-11

## 안전 보완 + 게스트/인증 Batch

| ID | 조치 |
|----|------|
| AUTH-003/004/012/022/023 | 이전 Auth safe hardening |
| Guest freepass | `/tour` 프리패스 → dashboard/cases/demo 미리보기, `/cases/new`에서 가입·로그인 게이트 |
| Guest tour | `/tour` · 루트/홈 CTA |
| AUTH-002 | 가입 후 이메일 인증 시작 · 미인증 로그인 차단 |

## 잔여

| ID | 내용 |
|----|------|
| AUTH-001 | 비밀번호 재설정 |
| AUTH-006~008 | refresh · 분산 RL · 계정 잠금 |
| SMTP live | `AUTH_EMAIL_VERIFY_DRY_RUN=false` + SMTP 설정 (HQ) |
