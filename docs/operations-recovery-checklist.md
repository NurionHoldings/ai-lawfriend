# AI법친 운영 복구 체크리스트

**목적**: 패치 후 장애 시 **앱을 다시 띄우는 것**을 최우선으로, 최소 범위 롤백과 단계별 복구를 빠르게 수행한다.

**루트 문서 세트**: [OPERATIONS_RECOVERY.md](../OPERATIONS_RECOVERY.md) (복구) · [PATCH_FINAL_CHECKLIST.md](../PATCH_FINAL_CHECKLIST.md) (마감 검수) · [DEPLOY_PRECHECK.md](../DEPLOY_PRECHECK.md) (배포 직전)

**관련 문서**: [minimum-rollback-playbook.md](./minimum-rollback-playbook.md) · [incident-recovery-playbook.md](./incident-recovery-playbook.md) · [post-patch-verification.md](./post-patch-verification.md) · [grep-rg-troubleshooting.md](./grep-rg-troubleshooting.md)

---

## 복구 원칙

1. 먼저 **부팅 / 로그인 / 보호 페이지 접근**을 복구한다.  
2. 그다음 **운영 핵심 API**를 복구한다.  
3. 마지막으로 **점검 페이지 · UI · 테스트**를 복구한다.  
4. 새로 추가한 보강 기능보다 **기존에 돌던 구현**을 우선 복구한다.

---

## 1. 장애 수준 판단

### A. P0 — 즉시 복구 필요

- `npm run dev`가 뜨지 않는다  
- `npm run build`가 실패한다  
- 로그인 후 **전체** 보호 페이지가 비정상이다  
- ADMIN도 `/admin` 접근이 깨진다  

### B. P1 — 핵심 기능 장애

- bulk-edit / rebalance API가 401/403/500으로 실패한다  
- STAFF가 허용 화면에 못 들어간다  
- `/api/health`, `/api/release-meta`, system page가 깨진다  

### C. P2 — 운영은 가능하나 UX 문제

- STAFF에게 수정 버튼이 보인다  
- 조회 전용 배너가 보이지 않는다  
- requestId / logger / rate limit만 이상하다  

### D. P3 — 테스트만 실패

- 앱은 동작하지만 Vitest 실패  
- 앱은 동작하지만 Playwright 실패  

---

## 2. 즉시 점검 명령

### 기본 점검

```bash
npm run lint
npm run dev
```

### 핵심 API 점검 (별도 터미널, dev 기동 후)

**health**

```bash
curl -i http://localhost:3000/api/health
```

**release-meta (비로그인 차단)**

```bash
curl -i http://localhost:3000/api/release-meta
```

**bulk-edit (비로그인 차단)**

```bash
curl -i -X POST http://localhost:3000/api/admin/alerts/ops-queue/bulk-edit ^
  -H "Content-Type: application/json" ^
  -d "{\"opsQueueTicketIds\":[\"ticket-1\"]}"
```

(Unix: 한 줄로 작성하거나 `\`로 줄 연결.)

**rebalance-apply** (이 프로젝트 스키마: `items[]`)

```bash
curl -i -X POST http://localhost:3000/api/admin/alerts/ops-queue/rebalance-apply ^
  -H "Content-Type: application/json" ^
  -d "{\"items\":[{\"opsQueueTicketId\":\"ticket-1\",\"suggestedAssigneeUserId\":null}]}"
```

---

## 3. 1차 최소 롤백 세트

**목표**: 앱 부팅, 로그인, 보호 페이지, ADMIN 운영 접근을 먼저 복구한다.

### 롤백 대상 파일

- `src/middleware.ts`  
- `src/lib/auth/guards.ts`  
- `src/app/api/admin/alerts/ops-queue/bulk-edit/route.ts`  
- `src/app/api/admin/alerts/ops-queue/rebalance-apply/route.ts`  

### 롤백 기준

**`src/middleware.ts`**

- STAFF 허용 예외 로직 제거  
- 새 import 제거 (`isAdminRole`, `isStaffAllowedAdminPath` 등)  
- **패치 전** 기동하던 버전으로 복귀  

**`src/lib/auth/guards.ts`**

- `requireRoleApi()` 제거 또는 주석  
- **이 레포**: `requireAdminApi`는 `require-admin-api.ts`, 페이지 인증은 `session.ts` 등에 있음. `requireRoleApi`를 쓰는 route는 **`requireAdminApi()` / `requireRole("ADMIN")`** 등 기존 방식으로 임시 연결  

**bulk-edit / rebalance route**

- `requireRoleApi("ADMIN")` 제거  
- `requestId`, `simpleRateLimit`, logger, `captureServerError` 제거  
- 기존 비즈니스 로직·응답 구조로 복귀 + 인증은 `requireRole` / `requireAdminApi` 등 패치 이전 패턴  

### 복구 후 확인

- [ ] `npm run dev` 실행됨  
- [ ] 로그인 가능  
- [ ] ADMIN으로 `/admin` 접근 가능  
- [ ] bulk-edit / rebalance 기존 기능 호출 가능  

---

## 4. 2차 보조 롤백 세트

**목표**: 관리 점검 기능만 따로 복구한다.

### 롤백 대상 파일

- `src/app/(protected)/admin/system/page.tsx`  
- `src/app/api/health/route.ts`  
- `src/app/api/release-meta/route.ts`  
- `src/lib/health.ts`  
- `src/lib/release-meta-inline.ts`  

### 롤백 기준

**system/page.tsx**

- direct call 제거 → 기존 **fetch** 방식으로 복귀 가능  
- `requireRolePage()` import는 프로젝트 기준(`@/lib/auth/session`) 유지  

**/api/health**

- DB 체크 제거 가능 → 단순 응답으로 먼저 복구  

**/api/release-meta**

- `requireRoleApi("ADMIN")` 제거 가능 → 단순 응답으로 복귀 (로컬 확인용, 운영 공개는 주의)  

### 복구 후 확인

- [ ] `/api/health` 200  
- [ ] system page 렌더링  
- [ ] `/api/release-meta` 응답  

---

## 5. 3차 UI 롤백 세트

**목표**: 앱·API는 유지하고 UI 충돌만 정리한다.

### 롤백 대상 파일

- `src/components/auth/RoleGate.tsx`  
- `src/components/admin/alerts/ops-queue/OpsQueueKanbanBoard.tsx`  
  _(문서상 `components/alerts/ops-queue/`가 아니라, 이 프로젝트는 **`admin`** 하위 경로입니다.)_

### 롤백 기준

**RoleGate.tsx**

- 유니온 prop 제거 → 기존 prop 형식만 유지  

**OpsQueueKanbanBoard.tsx**

- `canEdit` 계산·STAFF 조회 전용 배너 제거 가능  
- 기존 렌더링만 유지  

### 복구 후 확인

- [ ] 컴포넌트 렌더링 정상, JSX 오류 없음  
- [ ] 버튼 노출만 어색해도 서버가 막으면 후순위로 통과 가능  

---

## 6. 원인별 우선 조치표

| 증상 | 우선 조치 |
|------|-----------|
| 로그인 후 전체가 꼬인다 | `middleware.ts` 먼저 원복 · session/JWT 파싱은 가급적 유지 · ADMIN 보호 페이지 먼저 확인 |
| STAFF만 운영 페이지 접근 실패 | 실제 경로·`role` 값·`admin-staff-paths.ts` · 필요 시 STAFF 예외만 개별 재적용 |
| ADMIN API만 전부 실패 | `guards` / route 인증 · 기존 guard로 복귀 · bulk-edit·rebalance부터 |
| system / health / release-meta만 실패 | direct call 제거 또는 fetch 복구 · DB health 제거 · release-meta 인증은 나중에 재부착 |
| UI만 깨짐 | RoleGate·OpsQueueKanbanBoard 원복 · **서버 권한이 살아 있으면 UI는 후순위** |

---

## 7. grep 점검 세트

```bash
rg "getSessionUser|requireRolePage|requireRoleApi|role|userRole|accountRole" src
rg "/admin|isStaffAllowedAdminPath|STAFF_ALLOWED_ADMIN_PATH_PREFIXES|middleware" src
rg "opsQueueTicketIds|ticketIds|suggestedAssigneeUserId|updatedCount|bulk-edit|rebalance-apply" src
rg "health|release-meta|getHealthStatus|getReleaseMetaInline|BUILD_TIME|VERCEL_GIT_COMMIT_SHA" src
rg "passwordHash|hashedPassword|UserRole|upsert\\(" prisma src
```

---

## 8. 최종 성공 기준

아래 **5개**가 만족되면 복구 성공으로 판단한다.

1. `npm run dev` 실행 성공  
2. 로그인 가능  
3. 보호 페이지 접근 가능  
4. ADMIN 기준 운영 페이지 접근 가능  
5. bulk-edit / rebalance 기존 기능 호출 가능  

---

## 9. 복구 후 재적용 우선순위

앱이 다시 뜬 뒤 보강을 **아래 순서**로 재적용한다.

1. STAFF `/admin` 예외 허용  
2. `requireRoleApi()` 재도입  
3. bulk/rebalance 배열 `max` 재도입  
4. `requestId` 재도입  
5. logger / monitoring 재도입  
6. rate limit 재도입  
7. `/api/release-meta` 관리자 제한 재도입  
8. system page direct call 재도입  
9. RoleGate / STAFF 조회 전용 배너 재도입  
10. Vitest / Playwright 정리  

---

## 10. 운영 메모 (복구 단계에서 하지 말 것)

- Prisma schema / migration은 복구 단계에서 **건드리지 않는다**  
- `session.ts` 전면 개편은 하지 않는다  
- 로그인 발급 로직 재작성은 하지 않는다  
- route 경로 대이동은 하지 않는다  
- 보강 기능보다 **기존에 돌던 구현**을 우선 복구한다  
