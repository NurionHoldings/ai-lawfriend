# AI법친 운영 패치 최종 검수 체크리스트

> **파일명**: `PATCH_FINAL_CHECKLIST.md`  
> **목적**: 운영 패치 반영 후 로컬 검수 → 권한 스모크 → 배포 직전 점검 → 배포 후 확인까지 한 번에 수행하기 위한 최종 체크리스트  
> **관련**: 장애·롤백은 [OPERATIONS_RECOVERY.md](./OPERATIONS_RECOVERY.md), **배포 직전만** 보려면 [DEPLOY_PRECHECK.md](./DEPLOY_PRECHECK.md)

---

## 1. 문서 목적

이 문서는 AI법친 프로젝트의 운영 패치 반영 이후, **로컬 검수 → 권한 스모크 테스트 → 배포 직전 점검 → 배포 후 확인**까지 한 번에 수행할 수 있도록 만든 최종 운영 체크리스트입니다.

이번 체크리스트의 목적은 다음과 같습니다.

- 운영 권한 정책이 실제 코드에 정확히 반영되었는지 확인
- OpsQueue 관련 운영 API가 안전하게 보호되는지 확인
- build / lint / test / smoke 기준으로 최종 마감 상태인지 확인
- 배포 직전 실수를 줄이고, 배포 후 빠르게 이상 유무를 확인

---

## 2. 적용 범위

이번 패치 검수 범위는 아래와 같습니다. (App Router 소스는 **`src/app/...`** 기준입니다.)

- `src/middleware.ts`
- `src/lib/auth/roles.ts`
- `src/lib/auth/guards.ts`
- `src/lib/auth/ops-admin-paths.ts`
- `src/components/auth/RoleGate.tsx`
- `src/app/api/admin/alerts/ops-queue/bulk-edit/route.ts`
- `src/app/api/admin/alerts/ops-queue/rebalance-apply/route.ts`
- `src/app/api/health/route.ts`
- `src/app/api/release-meta/route.ts`
- `src/lib/release-meta.ts`
- `src/lib/env-zod.ts`
- `src/app/layout.tsx`
- `src/app/(protected)/admin/system/page.tsx`
- `src/components/admin/alerts/ops-queue/OpsQueueKanbanBoard.tsx`
- `prisma/seed.ts`
- `package.json`

---

## 3. 이번 단계의 고정 원칙

아래 항목은 이번 마감 단계에서 변경하지 않는 기준입니다.

- [ ] Prisma schema / migration 변경 없음
- [ ] 기존 `session.ts` 전면 교체 없음
- [ ] 기존 `/api/admin/alerts/ops-queue/...` 경로 유지
- [ ] 새 `/api/admin/ops-queue/...` 경로 생성 금지
- [ ] 기존 페이지 보호 흐름 최대한 유지
- [ ] 실제 보정은 import 경로, 타입명, 모델명, 필드명 수준으로 제한

---

## 4. 정책 반영 확인

### 4.1 Admin 접근 정책

- [ ] `ADMIN`, `SUPER_ADMIN` 은 `/admin` 전체 접근 가능
- [ ] `STAFF` 는 아래 경로만 접근 가능
  - [ ] `/admin/alerts/ops-queue`
  - [ ] `/admin/alerts/ops-dashboard`
  - [ ] `/admin/audit-logs`
- [ ] `STAFF` 는 위 경로의 하위 경로만 허용
- [ ] 그 외 사용자는 `/admin` 접근 시 `/dashboard` 로 이동

### 4.2 느슨한 prefix 금지

- [ ] `pathname.startsWith("/admin/alerts/ops")` 식의 허용 코드 제거
- [ ] STAFF 허용 경로는 명시적 유틸(`ops-admin-paths` 등)로만 관리

### 4.3 Guard 분리 정책

- [ ] 페이지는 기존 `requireRolePage(...)` 흐름 유지 (구현은 `session.ts`, 필요 시 `guards`에서 re-export)
- [ ] API는 `requireRoleApi(minimumRole)` 사용
- [ ] route 내부 직접 role 비교 구버전 제거

---

## 5. 파일별 반영 점검

### 5.1 `src/lib/auth/roles.ts`

다음 항목이 존재해야 합니다 (또는 동등 역할).

- [ ] `OPERATIONS_PLATFORM_ROLES`
- [ ] `ROLE_RANK` 또는 `OPERATIONS_ROLE_RANK` (프로젝트 정의에 따름)
- [ ] `hasRoleAtLeast`
- [ ] `hasMinRole`
- [ ] `isAdminRole`
- [ ] `isStaffRole`

역할 문자열은 전역에서 아래 값으로 통일되어야 합니다.

- [ ] `STAFF`
- [ ] `ADMIN`
- [ ] `SUPER_ADMIN`

---

### 5.2 `src/lib/auth/guards.ts`

- [ ] 기존 `requireRolePage(...)` 유지
- [ ] `requireRoleApi(minimumRole)` 추가
- [ ] API route 내부 중복 role 비교 제거
- [ ] session user 에서 `role` 접근 가능

---

### 5.3 `src/lib/auth/ops-admin-paths.ts`

- [ ] STAFF 허용 admin 경로 상수 정리 완료
- [ ] `isAllowedStaffAdminPath(pathname)` 유틸 존재

---

### 5.4 `src/middleware.ts`

- [ ] STAFF 허용 범위가 정확한 경로 유틸 기반으로 동작
- [ ] `ADMIN`, `SUPER_ADMIN` 은 `/admin` 전체 허용
- [ ] `STAFF` 는 지정 경로 외 접근 시 `/dashboard` 로 이동
- [ ] 비로그인·그 외 역할은 `/admin` 보호 규칙에 맞게 처리
- [ ] 기존 세션 판독 방식은 프로젝트 구조에 맞게 유지
- [ ] **참고**: `config.matcher` 는 `/admin` 외에도 `/dashboard`, `/cases`, `/lawyer`, `/login`, `/signup` 등이 포함될 수 있음 (본 레포)

---

### 5.5 `src/components/auth/RoleGate.tsx`

- [ ] `role` / `minimumRole` 형태 지원
- [ ] `currentRole` / `minRole` 형태 지원
- [ ] fallback 처리 유지
- [ ] 기존 사용처와 충돌 없음

---

### 5.6 `src/app/api/admin/alerts/ops-queue/bulk-edit/route.ts`

- [ ] 기존 경로 유지
- [ ] `requireRoleApi("STAFF")` 적용 (정책상 ADMIN만 허용이면 팀 기준으로 통일)
- [ ] `OPS_BULK_EDIT_MAX_ITEMS` 적용
- [ ] `OPS_MUTATION_REQUESTS_PER_MINUTE` 적용
- [ ] `simpleRateLimit` 적용
- [ ] `getRequestId` 적용
- [ ] `logger` 적용
- [ ] 응답에 `requestId` 포함
- [ ] 잘못된 입력 시 적절한 400 응답 (`INVALID_INPUT` 등 기존 코드와 일치)
- [ ] 과도한 요청 시 `429`
- [ ] 기존 도메인 로직 유지

---

### 5.7 `src/app/api/admin/alerts/ops-queue/rebalance-apply/route.ts`

- [ ] 기존 경로 유지
- [ ] `requireRoleApi("STAFF")` 적용 (정책과 통일)
- [ ] `OPS_REBALANCE_MAX_ITEMS` 적용
- [ ] `OPS_MUTATION_REQUESTS_PER_MINUTE` 적용
- [ ] `simpleRateLimit` 적용
- [ ] `getRequestId` 적용
- [ ] `logger` 적용
- [ ] 응답에 `requestId` 포함
- [ ] 잘못된 입력 시 적절한 400 응답
- [ ] 과도한 요청 시 `429`
- [ ] 기존 도메인 로직 유지

---

### 5.8 `src/app/api/health/route.ts`

- [ ] 공개 route
- [ ] 최소 응답만 반환: `ok`, `status`, `ts`
- [ ] DB 정상 시 200
- [ ] DB 실패 시 503

---

### 5.9 `src/lib/release-meta.ts`

- [ ] `getReleaseMetaInline()` 존재
- [ ] commit / ref / deployedAt / nodeEnv 수준의 최소 메타 반환 (비밀 미포함)

---

### 5.10 `src/app/api/release-meta/route.ts`

- [ ] `requireRoleApi("ADMIN")` 적용
- [ ] STAFF / 비로그인 접근 차단
- [ ] ADMIN 이상만 정상 응답

---

### 5.11 `src/lib/env-zod.ts`

- [ ] `parseProductionEnv()` 존재
- [ ] env 검증 로직이 이 파일에 정리됨

---

### 5.12 `src/app/layout.tsx`

- [ ] `parseProductionEnv()` 강제 import 없음
- [ ] `parseProductionEnv()` 강제 실행 없음

---

### 5.13 `src/app/(protected)/admin/system/page.tsx`

- [ ] 동일 오리진 self-fetch 없음
- [ ] 서버 direct call 방식
- [ ] ADMIN 권한 보호 유지
- [ ] release meta 표시 정상
- [ ] env 검증 표시 정상

---

### 5.14 `src/components/admin/alerts/ops-queue/OpsQueueKanbanBoard.tsx`

- [ ] `!canEdit` 일 때 STAFF 조회 전용 배너 노출
- [ ] 권한 없는 mutation UI 제한
- [ ] 기존 보드 구조 및 drag/drop 유지

---

### 5.15 `prisma/seed.ts`

- [ ] `staff@example.com` STAFF 계정이 시드에 포함됨 (비밀번호는 시드 정의와 일치 확인)
- [ ] 기존 seed 흐름과 충돌 없음
- [ ] 실제 user 모델명·password 필드명 기준 보정 완료

---

### 5.16 `package.json`

- [ ] `build`: `prisma generate && next build`
- [ ] `predeploy:lint-test` (또는 동일 목적 스크립트)
- [ ] `db:generate`, `db:migrate`, `db:deploy`
- [ ] 필요 시 `seed` 스크립트 존재

---

## 6. 신규 유틸 파일 확인

다음 파일이 추가되었거나 동일 기능으로 반영되어 있어야 합니다.

- [ ] `src/lib/auth/ops-admin-paths.ts`
- [ ] `src/lib/server/simple-rate-limit.ts`
- [ ] `src/lib/server/request-id.ts`
- [ ] `src/lib/config/ops-limits.ts`
- [ ] `src/lib/release-meta.ts`

---

## 7. 반드시 제거되어야 하는 구버전 흔적

아래 항목이 남아 있으면 재점검이 필요합니다.

- [ ] `/api/admin/ops-queue/...` 신규 중복 경로 없음
- [ ] route 내부 직접 role 비교 구버전 없음
- [ ] `pathname.startsWith("/admin/alerts/ops")` 코드 없음
- [ ] `layout.tsx` 의 env 강제 검증 코드 없음
- [ ] system page 의 `fetch("/api/release-meta")` 없음
- [ ] system page 의 동일 오리진 self-fetch 없음
- [ ] RoleGate 단일 props 강제 구버전 없음
- [ ] requestId 없는 ops mutation 응답 없음
- [ ] rate limit 없는 ops mutation route 없음

---

## 8. import / 타입 / 모델명 보정 확인

### 8.1 import alias

- [ ] 새 import 경로가 프로젝트 alias 규칙과 일치 (`@/*` → `./src/*` 이면 **`@/lib/...`** 가 일반적)
- [ ] `@/src/lib/...` 오타·혼용 충돌 없음

### 8.2 session 함수명

- [ ] 실제 프로젝트 export 이름과 guard 연결 일치 (본 레포: `getSessionUser` 등)
- [ ] session user 에서 `role` 접근 가능

### 8.3 역할 타입명

- [ ] `AppRole` 또는 Prisma `UserRole` 등 정책에 맞게 일관되게 사용됨
- [ ] `hasMinRole` / `hasRoleAtLeast` 사용 통일

### 8.4 Prisma singleton

- [ ] prisma import 경로가 실제 singleton 위치와 일치
- [ ] `new PrismaClient` 중복 생성 없음

### 8.5 Prisma model / field

- [ ] route 에서 사용한 model명이 실제 schema와 일치 (본 레포 예: **`OpsQueueTicket`**)
- [ ] update/create 필드명이 실제 schema와 일치
- [ ] priority enum 값이 실제 DB enum과 일치

---

## 9. 정적 검색 점검

아래를 실행해 이상 유무를 확인합니다. (Windows에서는 **`rg`** 권장.)

```bash
rg 'from "@/src/' src
rg "getSessionUser|getCurrentUser|getServerSessionUser|requireRoleApi" src
rg 'pathname\.startsWith\("/admin/alerts/ops"\)' src
rg "/api/admin/ops-queue/" src
rg "fetch.*release-meta|/api/release-meta" src
rg "parseProductionEnv\(\)" src app
rg -n "^model " prisma/schema.prisma
```

**점검 결과**

- [ ] alias/경로 문제 없음
- [ ] session 함수명 충돌 없음
- [ ] 느슨한 STAFF 허용 코드 없음
- [ ] 중복 ops route 없음
- [ ] self-fetch 없음
- [ ] layout 강제 env 실행 흔적 없음
- [ ] schema 기준 model명 확인 완료

---

## 10. 로컬 검수 절차

### 10.1 Lint

```bash
npm run lint
```

- [ ] 통과

### 10.2 Test

```bash
npm run test
```

- [ ] 통과

### 10.3 Build

```bash
npm run build
```

- [ ] 통과

---

## 11. 수동 권한 스모크 테스트

### 11.1 STAFF 계정

- [ ] STAFF 로그인 성공
- [ ] `/admin/alerts/ops-queue` 접근 가능
- [ ] `/admin/alerts/ops-dashboard` 접근 가능
- [ ] `/admin/audit-logs` 접근 가능
- [ ] `/admin/system` 접근 시 `/dashboard` 로 이동
- [ ] OpsQueue 조회 전용 배너 노출
- [ ] STAFF 권한에서 제한된 mutation 액션 차단 확인

### 11.2 ADMIN 계정

- [ ] ADMIN 로그인 성공
- [ ] `/admin/system` 접근 가능
- [ ] `/admin/*` 전체 접근 가능
- [ ] `/api/release-meta` 정상 응답
- [ ] bulk-edit 정상 동작
- [ ] rebalance-apply 정상 동작

### 11.3 SUPER_ADMIN 계정

- [ ] SUPER_ADMIN 존재 시 `/admin/*` 전체 접근 가능
- [ ] ADMIN 이상 권한 흐름 정상

---

## 12. API 스모크 테스트

### 12.1 health

- [ ] `GET /api/health` 비로그인 상태에서 호출 가능
- [ ] DB 정상 시 200
- [ ] DB 장애 시 503
- [ ] 응답 필드 최소 형태 유지: `ok`, `status`, `ts`

### 12.2 release-meta

- [ ] 비로그인 접근 차단
- [ ] STAFF 접근 차단
- [ ] ADMIN 접근 성공

### 12.3 bulk-edit

- [ ] 정상 입력 성공
- [ ] 응답에 `requestId` 포함
- [ ] 잘못된 입력 시 400 + `INVALID_INPUT` 등 (기존 응답 코드와 일치)
- [ ] 과도한 호출 시 429 확인 가능

### 12.4 rebalance-apply

- [ ] 정상 입력 성공
- [ ] 응답에 `requestId` 포함
- [ ] 잘못된 입력 시 400 + 검증 오류
- [ ] 과도한 호출 시 429 확인 가능

---

## 13. 운영 안정성 점검

- [ ] logger 호출이 서버 오류 없이 동작
- [ ] 오류 응답에 `requestId` 포함
- [ ] rate limit 수치가 지나치게 민감하지 않음
- [ ] optimistic UI 와 실제 mutation 결과가 크게 어긋나지 않음
- [ ] 권한 없는 사용자의 mutation route 호출 정상 차단

---

## 14. 배포 직전 확인

```bash
npm run predeploy:lint-test
```

- [ ] 사전 검수 스크립트 통과
- [ ] 배포 환경 변수 점검 완료
- [ ] `DATABASE_URL` 정상
- [ ] release meta 표시 정보 확인 가능
- [ ] 필요 시 seed 재실행 가능
- [ ] 최종 smoke 재확인 완료

---

## 15. 배포 후 즉시 확인

- [ ] `/api/health` 정상
- [ ] ADMIN 권한 페이지 정상
- [ ] STAFF 권한 제한 정상
- [ ] OpsQueue bulk-edit 정상
- [ ] rebalance-apply 정상
- [ ] 운영 대시보드 정상
- [ ] release-meta 정상
- [ ] 서버 로그에 치명적 에러 없음

---

## 16. 실패 시 재확인 우선순위

문제가 발생하면 아래 순서로 다시 확인합니다.

1. import alias / 파일 경로
2. session 함수명 / session user `role` 포함 여부
3. role 타입명 / role 유틸 함수명
4. prisma singleton import 위치
5. Prisma model명
6. Prisma field명
7. route body shape
8. `requireRolePage` 반환형 (본 레포: 실패 시 `redirect`, 성공 시 `user` — `{ ok, redirectTo }` 패턴 아님)
9. middleware 세션 role 판독 방식

---

## 17. 최종 판정

### 모든 항목 통과

- 운영 패치 최종 마감 가능
- 배포 진행 가능

### 일부 항목 실패

- import 경로 재보정
- session 함수명 재보정
- Prisma model / field명 재보정
- guard 반환형 재보정
- API body shape 재보정
- rate limit 수치 재조정
- middleware role 판독 재점검

---

## 18. 운영 메모

이번 단계는 구조 전면 변경이 아니라 **운영 마감 패치**입니다. 새로운 아키텍처를 확장하기보다, 기존 흐름을 유지하면서 권한·운영 API·검수 안정성을 확보하는 것이 핵심입니다.

**최우선 검수 대상 네 묶음**

1. `src/middleware.ts`
2. `src/lib/auth/guards.ts`
3. bulk-edit / rebalance-apply
4. system / health / release-meta

---

## 관련 문서

- [OPERATIONS_RECOVERY.md](./OPERATIONS_RECOVERY.md)
- [DEPLOY_PRECHECK.md](./DEPLOY_PRECHECK.md)
- [docs/ops-platform-finishing.md](./docs/ops-platform-finishing.md)
- [docs/post-patch-verification.md](./docs/post-patch-verification.md)
