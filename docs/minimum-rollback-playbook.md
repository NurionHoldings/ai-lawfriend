# 최소 롤백 플레이북 — “정책 일부를 포기하고, 먼저 앱이 뜨게”

기능 완성도보다 **부팅 복구 → 로그인 복구 → 핵심 페이지·API 복구**를 우선합니다.  
장애 우선순위·판단은 [incident-recovery-playbook.md](./incident-recovery-playbook.md)와 함께 보세요.

---

## 1) 최소 롤백 기본 원칙

문제가 크면 아래 순서로 되돌립니다.

1. **전역 영향 파일** — `middleware.ts`, `src/lib/auth/guards.ts` (`requireRoleApi`가 있는 경우)
2. **핵심 부가 기능 제거** — requestId, rateLimit, logger, captureServerError
3. **관리용 부가** — `system/page.tsx`, `/api/release-meta`, `/api/health`
4. **UI 배너·RoleGate** — 마지막 (부팅에 거의 무관)

---

## 2) 롤백 레벨표

| 레벨 | 목표 | 되돌릴 대상(예시) |
|------|------|-------------------|
| **L1** | dev/build 다시 뜸 | `middleware.ts`, `guards.ts`, bulk/rebalance 등 API |
| **L2** | 로그인·보호 페이지 | `middleware.ts`, `system/page.tsx` |
| **L3** | 운영 API | bulk-edit, rebalance-apply에서 부가 코드만 제거 |
| **L4** | 관리 점검 API·페이지 | `health.ts`, `release-meta/route.ts`, `system/page.tsx` |
| **L5** | UI만 | `RoleGate.tsx`, `OpsQueueKanbanBoard.tsx` |

---

## 3) 가장 강력한 최소 롤백 세트

앱이 안 뜨거나 로그인 흐름이 흔들릴 때 **가장 먼저** 적용합니다.

### 롤백 대상 1 — `src/middleware.ts`

- **상태**: 패치 **전**에 동작하던 버전으로 복구.
- **STAFF 예외**(`isStaffAllowedAdminPath` 등)는 **전부 제거**하고, `/admin`은 **기존 정책만**.
- **제거 예시**: `isAdminRole` / `isStaffAllowedAdminPath` import 및 STAFF 분기.

**기대**: ADMIN·SUPER_ADMIN은 예전처럼, 보호 페이지 전체 안정. STAFF 운영 화면 예외는 잠시 포기.

### 롤백 대상 2 — `src/lib/auth/guards.ts`

- **상태**: **`requireRoleApi()`만** 제거 또는 주석.
- **이 레포**: `guards.ts`에는 `requireRoleApi`만 있음. `requireAdminApi`·`requireRole` 등은 **`require-admin-api.ts`**, **`require-role.ts`**, **`session.ts`**에 있음.

**연쇄 조치**: `requireRoleApi`를 쓰는 route(`release-meta`, bulk-edit 등)는 임시로 **`requireAdminApi()`** 또는 **`requireRole("ADMIN")`** 패턴으로 교체해야 동작이 이어짐.

**기대**: 신규 공통 guard로 인한 연쇄 오류 차단.

### 롤백 대상 3 — bulk-edit / rebalance-apply

- **제거**: `requireRoleApi("ADMIN")`, `getRequestId`, `simpleRateLimit`, logger, `captureServerError`, 응답의 `requestId` (필요 시).
- **유지**: 기존 Zod·Prisma·비즈니스 로직·응답 형태.
- **인증 복구**: 위 항목 제거 후에는 **`requireRole("ADMIN")`** 또는 **`requireAdminApi()`** 등 **패치 이전에 쓰던 방식**으로 한 줄 연결.

**기대**: 운영 API 본체만 살아나면 성공. 429·구조화 로그는 나중에.

---

## 4) 앱 재부팅용 “초최소 롤백” 4파일

급할 때 **아래 4개**를 원복·정리하면 대개 다음이 돌아옵니다.

1. `src/middleware.ts`
2. `src/lib/auth/guards.ts` (`requireRoleApi` 사용 제거 + 호출부 대체)
3. `src/app/api/admin/alerts/ops-queue/bulk-edit/route.ts`
4. `src/app/api/admin/alerts/ops-queue/rebalance-apply/route.ts`

→ 로그인·보호 페이지·관리자 운영 API·dev/build 상당수.

---

## 5) 파일별 최소 롤백 상태 (요약)

| 파일 | 최소 롤백 |
|------|-----------|
| **middleware.ts** | STAFF 예외·`isAdminRole`·`isStaffAllowedAdminPath` 제거, `/admin`은 기존 로직만 |
| **guards.ts** | `requireRoleApi` 제거 → **호출부**를 `requireAdminApi` / `requireRole`로 |
| **bulk-edit / rebalance** | 부가만 제거, 인증은 `requireRole` 등 기존 방식 |
| **system page** | direct call 문제 시 예전 `fetch(/api/health)` 등으로 임시 복귀 |
| **GET /api/health** | DB 없이 `ok: true` 최소 JSON만 (급할 때) |
| **GET /api/release-meta** | `requireRoleApi` 제거 후 단순 JSON 또는 `requireAdminApi`만 |
| **RoleGate** | 유니온 제거·이전 prop만 |
| **OpsQueueKanbanBoard** | 실제 경로: `src/components/admin/alerts/ops-queue/` — canEdit·배너 제거 가능 |

---

## 6) 2차 롤백 — system / health / release

앱은 뜨는데 **점검 화면만** 깨질 때.

- **system/page.tsx**: `getHealthStatus` / `getReleaseMetaInline` 직접 호출이 문제면 **동일 오리진 fetch**로 되돌림.
- **health**: DB 체크 없는 최소 응답.
- **release-meta**: 인증 단순화 또는 응답 최소화 (로컬 확인용, **운영 공개는 주의**).

---

## 7) 3차 롤백 — UI만

- **RoleGate.tsx**: 단일 prop 스타일로 복귀.
- **OpsQueueKanbanBoard.tsx**: `canEdit`·STAFF 배너 제거 가능 (서버가 막으면 보안은 유지).

문서상 경로가 `components/alerts/ops-queue/`로 적힌 경우가 있으나, **이 프로젝트는** `src/components/admin/alerts/ops-queue/OpsQueueKanbanBoard.tsx` 입니다.

---

## 8) “삭제해도 되는 신규 유틸” (최악의 경우)

아래는 **부가 유틸**입니다. 문제는 보통 **기존 파일이 이들을 import해서** 터집니다.

- `admin-staff-paths.ts`, `constants/ops.ts`, `rate-limit.ts`, `request-id.ts`
- `health.ts`, `release-meta-inline.ts`, `env-zod.ts`, `monitoring.ts`

**최악의 경우**: 파일을 지우기보다 **import하는 쪽을 먼저** 되돌립니다.

---

## 9) 10분 복구 순서 (급할 때)

1. `middleware.ts` 원복  
2. `guards.ts`에서 `requireRoleApi` 제거 + **release-meta 등 호출부**를 `requireAdminApi` 등으로 임시 연결  
3. bulk/rebalance에서 requestId·logger·rateLimit·monitoring·신규 guard 제거 후 **`requireRole`/`requireAdminApi`**  
4. `system/page.tsx` 필요 시 fetch 방식으로  
5. `/api/health`, `/api/release-meta` 단순화  
6. RoleGate, OpsQueueKanbanBoard 원복  

---

## 10) 롤백 후 최소 성공 조건

다섯 가지면 “일단 복구”로 볼 수 있습니다.

1. `npm run dev` 실행  
2. 로그인 가능  
3. 보호 페이지 접근 가능  
4. ADMIN 기준 운영 페이지 열림  
5. bulk-edit / rebalance **기존 호출** 가능  

이후 STAFF 예외·requestId 등은 **다시 안전하게** 붙이면 됩니다.

---

## 11) 복구 중에는 먼저 건드리지 말 것

- Prisma schema / migration  
- `session.ts` 전면 개편  
- 로그인 발급 로직 재작성  
- role enum 자체 변경  
- route 경로 대이동  

→ 복구가 아니라 **재공사**에 가깝습니다. 필요한 것은 **원복과 부팅 복구**입니다.

---

## 관련 문서

- [operations-recovery-checklist.md](./operations-recovery-checklist.md) — 단계별 체크리스트·curl·재적용 순서
- [OPERATIONS_RECOVERY.md](../OPERATIONS_RECOVERY.md) — 운영 복구 매뉴얼(전체 서술·grep 세트)
- [incident-recovery-playbook.md](./incident-recovery-playbook.md)
- [post-patch-verification.md](./post-patch-verification.md)
- [handover-and-operations.md](./handover-and-operations.md)
