# 운영 계정 로테이션 — OPS_SMOKE / seed 경계

**목적**: staging·production role smoke 계정이 **seed 기본 비밀번호**와 분리되도록 로테이션·검증한다.  
**금지**: 이 문서/스크립트에 실비밀번호·토큰을 기록하지 않는다.

---

## 1. 계정 집합

| 역할 | Env |
|------|-----|
| CLIENT | `OPS_SMOKE_CLIENT_EMAIL` / `OPS_SMOKE_CLIENT_PASSWORD` |
| LAWYER | `OPS_SMOKE_LAWYER_EMAIL` / `OPS_SMOKE_LAWYER_PASSWORD` |
| STAFF | `OPS_SMOKE_STAFF_EMAIL` / `OPS_SMOKE_STAFF_PASSWORD` |
| ADMIN | `OPS_SMOKE_ADMIN_EMAIL` / `OPS_SMOKE_ADMIN_PASSWORD` |
| 사건 | `OPS_SMOKE_CASE_ID` |

Remote smoke는 위 8개(+CASE) **전부 필수** (`ops-ai-core-role-smoke.mjs`).

## 2. Seed 기본값 (로컬 전용 — 운영 금지)

`prisma/seed.ts` 기본 (production seed는 코드로 거부됨):

| 용도 | 이메일 예 | 비밀번호 예 |
|------|-----------|-------------|
| ADMIN | `admin@aibupchin.com` | `Admin1234!` |
| LAWYER | `lawyer@aibupchin.com` | `Admin1234!` |
| USER | `user@aibupchin.com` | `Admin1234!` |
| SUPER | `admin@test.com` | `password123!` |

운영/스테이징에서 위 조합이 살아 있으면 **즉시 비활성 또는 비밀번호 교체**.

## 3. 로테이션 절차 (HQ)

1. 전용 smoke 사용자 4종 생성(또는 기존 전용 계정 확인) — 일반 운영자 계정과 분리
2. 강력한 비밀번호 발급 (비밀번호 관리자 보관)
3. Netlify/호스트 env에 `OPS_SMOKE_*` 갱신 (값 커밋 금지)
4. `OPS_SMOKE_CASE_ID`가 CLIENT 소유 + LAWYER/STAFF `CaseAssignment`인지 확인
5. `npm run ops:smoke-account-rotation-check` — seed 기본값 충돌·누락 검사
6. `npm run ops:ai-core-role-smoke` (remote URL + env)
7. 구 비밀번호 폐기 · Intent DNA/증빙에는 **성공 여부만** 기록

주기: staging **90일**, production smoke **60일** 권장(또는 유출 의심 시 즉시).

## 4. 검증 스크립트

```bash
# 로컬: env에 올라온 OPS_SMOKE_* 가 seed 기본과 겹치는지 검사
npm run ops:smoke-account-rotation-check

# remote 강제 (기본값 사용 시 FAIL)
PLAYWRIGHT_BASE_URL=https://staging.example.com npm run ops:smoke-account-rotation-check
```

스크립트는 로그인·DB mutate를 **하지 않는다**. 정책 게이트만 수행.

## 5. 완료 판정

- [ ] production/staging에 seed 기본 이메일+비번 조합 없음
- [ ] remote smoke가 `OPS_SMOKE_*`만 사용
- [ ] rotation-check PASS
- [ ] role-smoke PASS (별도)
- [ ] 증빙에 시크릿 미포함
