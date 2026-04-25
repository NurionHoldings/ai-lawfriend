# 운영 플랫폼 마감 — 충돌 점검 · 경로 맵 · 스모크 테스트 · 검수 순서

이 문서는 패치 마감 시 **실제 레포 구조**(`src/`, `@/lib/...`) 기준으로 정리합니다. 붙여넣기용 예시 코드는 Prisma 모델명·API 본문이 다를 수 있으므로, **항상 아래 “파일 경로별 최종본(본 레포)”를 기준**으로 합니다.

---

## 1) 먼저 짚고 가는 충돌 가능성

### A. 역할 문자열 충돌

Prisma `UserRole` 및 JWT payload에 **`STAFF` | `ADMIN` | `SUPER_ADMIN`** 이 정확히 일치해야 합니다.  
잘못된 표기(`SUPERADMIN`, `super_admin`, 소문자-only 등)가 있으면 미들웨어·`RoleGate`·API guard가 엇갈립니다.

```bash
rg "SUPERADMIN|SUPER-ADMIN|super_admin" src
rg '"staff"|"admin"' src --glob '!**/node_modules/**'
```

### B. session user 타입 · 페이지/API 가드 분리

- **페이지**: `src/lib/auth/session.ts`의 `requireRolePage(minimumRole)` — 리다이렉트 기반(기존 유지).
- **API**: `src/lib/auth/guards.ts`의 `requireRoleApi(minimumRole)` — 401/403 `NextResponse` 반환.

`getSessionUser()`는 DB에서 `role`을 읽으며, 타입은 Prisma `UserRole`입니다.

### C. middleware · STAFF 허용 경로 (느슨한 prefix 금지)

**금지 예**: `/admin/alerts/ops` 단일 접두사 → `/admin/alerts/ops-anything` 오탐 허용 가능.

**허용(본 레포)**: `src/lib/auth/admin-staff-paths.ts`의 `STAFF_ALLOWED_ADMIN_PATH_PREFIXES`

- `/admin/alerts/ops-queue`
- `/admin/alerts/ops-dashboard`
- `/admin/audit-logs`

각각 **정확 일치 또는 `${prefix}/` 하위**만 허용합니다.

미들웨어는 `src/middleware.ts`에서 JWT(`aibupchin_access_token`) 검증 후 `isStaffAllowedAdminPath(pathname)`을 적용합니다.

### D. API 경로 이중화

유지 경로: **`/api/admin/alerts/ops-queue/...`** 만 사용합니다.  
`/api/admin/ops-queue/...` 같은 별도 경로는 두지 않습니다.

### E. env 검증 (`env-zod`)

- `src/lib/env-zod.ts`의 `parseProductionEnv()` 유지.
- **루트 `layout.tsx`에서 전역 import 금지** — 필요한 서버 엔트리·점검 페이지에서만 호출합니다.

---

## 2) 파일 경로별 최종본(본 레포)

| 역할 | 경로 |
|------|------|
| 역할·순위 비교 | `src/lib/auth/roles.ts` (`hasMinRole`, `isAdminRole`, Prisma `UserRole` 연동) |
| API 가드 | `src/lib/auth/guards.ts` (`requireRoleApi`) |
| 페이지 가드 | `src/lib/auth/session.ts` (`requireRolePage`) |
| STAFF /admin 허용 경로 | `src/lib/auth/admin-staff-paths.ts` |
| 위 경로 별칭(테스트·문서용 이름) | `src/lib/auth/ops-admin-paths.ts` |
| 미들웨어 | `src/middleware.ts` |
| RoleGate (유니온 props) | `src/components/auth/RoleGate.tsx` |
| in-memory rate limit | `src/lib/rate-limit.ts` · 별칭 `src/lib/server/simple-rate-limit.ts` |
| request id | `src/lib/request-id.ts` · 별칭 `src/lib/server/request-id.ts` |
| bulk/rebalance 한도 | `src/lib/constants/ops.ts` · re-export `src/lib/config/ops-limits.ts` |
| logger | `src/lib/logger.ts` (기존 유지) |
| bulk-edit | `src/app/api/admin/alerts/ops-queue/bulk-edit/route.ts` — 본문 `opsQueueTicketIds`, **`requireRoleApi("STAFF")`** (최소 역할; UI는 `canEdit`로 ADMIN만 편집 노출) |
| rebalance-apply | `src/app/api/admin/alerts/ops-queue/rebalance-apply/route.ts` |
| health | `src/app/api/health/route.ts` → `src/lib/health.ts` |
| release 메타(인라인) | `src/lib/release-meta-inline.ts` |
| release-meta API | `src/app/api/release-meta/route.ts` — `{ ok: true, data: { ... } }` (비인증·STAFF 공개 없음) |
| system 점검 페이지 | `src/app/(protected)/admin/system/page.tsx` |
| 칸반(STAFF 조회 배너 등) | `src/components/admin/alerts/ops-queue/OpsQueueKanbanBoard.tsx` |
| seed (STAFF 등) | `prisma/seed.ts` |

**참고(샘플과의 차이)**

- import는 **`@/lib/...`** (프로젝트 alias). `@/src/lib/...` 아님.
- Prisma 모델은 **`OpsQueueTicket`** 등 실제 스키마명을 따릅니다. 샘플의 `opsQueueItem`은 사용하지 않습니다.
- 대량 API는 운영 정책상 **`ADMIN` 이상**으로 제한하는 것이 현재 코드와 일치합니다(STAFF는 UI·미들웨어에서 허용된 화면 조회, 변이 API는 ADMIN).

---

## 3) 권한/API 스모크 테스트

| 테스트 | 경로 |
|--------|------|
| STAFF 허용 경로 | `src/lib/auth/__tests__/admin-staff-paths.test.ts`, `src/lib/auth/__tests__/ops-admin-paths.test.ts` |
| Health GET | `src/app/api/health/route.test.ts` |
| API 비인증 차단(E2E) | `tests/e2e/admin-role-matrix.spec.ts` |
| 브라우저 역할 매트릭스(로그인 헬퍼 필요) | `tests/e2e/admin-role-access.spec.ts` — 로그인 연동 전까지 **skip** 처리 |

```bash
npm run test
npm run test:e2e
```

---

## 4) 로컬 검수 순서

1. **정적/타입**: `npm run lint` — `@/lib` 경로, `getSessionUser` export, `role` 필드, Prisma 모델명 오류 확인.
2. **단위 테스트**: `npm run test` — 역할·경로·health 등.
3. **개발 서버**: `npm run dev` — STAFF/ADMIN별 `/admin` 접근, system 페이지 리다이렉트 확인.
4. **빌드**: `npm run build` — 서버 컴포넌트·`headers()`·alias 문제 확인.

---

## 5) 배포 직전 최종 체크

**필수**

- [ ] `src/middleware.ts`가 JWT에서 `role`을 올바르게 해석하는지.
- [ ] `getSessionUser()` / `SessionUser.role`이 Prisma와 일치하는지.
- [ ] bulk-edit·rebalance·프론트 호출 경로가 `/api/admin/alerts/ops-queue/...` 로 일치하는지.
- [ ] `/api/release-meta`는 인증·권한 정책대로인지(현행 코드 기준).
- [ ] `/api/health`는 비로그인으로 기대 상태 코드·본문인지.

**권장**

- [ ] 오류 응답 `requestId`를 UI에 노출할지.
- [ ] `simpleRateLimit`을 이후 Redis/KV로 교체할지.
- [ ] `npm run predeploy:lint-test` 또는 `predeploy:check` 실행.

---

## 관련 문서

- [OPERATIONS_RECOVERY.md](../OPERATIONS_RECOVERY.md)
- [post-patch-verification.md](./post-patch-verification.md)
- [handover-and-operations.md](./handover-and-operations.md)
