# 장애 복구 플레이북 (우선순위 · 롤백 · 판단 기준)

패치·배포 후 문제가 났을 때 **무엇을 먼저** 되돌리고 복구할지 정리한 문서입니다.  
**기능을 줄여서라도 부팅·로그인부터 살리는** 구체적 롤백 단계는 [minimum-rollback-playbook.md](./minimum-rollback-playbook.md)를 참고합니다.  
체크박스 형태의 운영 복구 순서는 [operations-recovery-checklist.md](./operations-recovery-checklist.md)를 참고합니다.  
절차·원인별 대응을 한 문서로 보려면 [OPERATIONS_RECOVERY.md](../OPERATIONS_RECOVERY.md)를 참고합니다.  
점검 명령 순서는 [post-patch-verification.md](./post-patch-verification.md), 검색 패턴은 [grep-rg-troubleshooting.md](./grep-rg-troubleshooting.md)를 함께 쓰면 됩니다.

---

## 1) 최상위 복구 우선순위 표

| 우선순위 | 장애 유형 | 대표 증상 | 먼저 볼 파일 | 즉시 복구 방향 |
|----------|-----------|-----------|--------------|----------------|
| **P0** | 로그인·전역 접근 | 로그인 후 전부 튕김, `/admin`뿐 아니라 일반 보호 페이지도 이상 | `middleware.ts`, `session.ts`, 로그인 발급 | 미들웨어 변경분부터 되돌려 최소 접근 복구 |
| **P0** | dev/build 불가 | `npm run dev`, `npm run build` 실패 | import 추가한 파일 전부 | 새 import·함수부터 주석 처리 |
| **P1** | 관리자 API 전면 실패 | bulk-edit, rebalance, release-meta가 전부 500/401 오작동 | `guards.ts`, 해당 API route | `requireRoleApi()` 연결부터 단순화 |
| **P1** | STAFF 정책 불일치 | 들어가면 안 되거나 들어가야 하는데 못 들어감 | `middleware.ts`, `admin-staff-paths.ts` | 허용 경로 로직만 단독 점검 |
| **P1** | health·release·system | system만 깨짐, `/api/health` 500 | `health.ts`, `release-meta-inline.ts`, system page | 동일 오리진 fetch 제거/직접 호출 중 하나로 단순화 |
| **P2** | UI 권한 노출 | STAFF에게 버튼 보임, 클릭 시 403 | `RoleGate.tsx`, `OpsQueueKanbanBoard.tsx` | 화면 분기는 나중, **서버 권한** 유지 우선 |
| **P2** | rate limit / requestId / logger | 429 이상, requestId 없음, logger import 오류 | `rate-limit.ts`, `request-id.ts`, `logger.ts` | 부가 기능 잠시 제거 후 기능 우선 복구 |
| **P3** | 테스트만 실패 | 앱은 동작, Vitest/Playwright만 실패 | 테스트 파일, config | 런타임 복구 후 테스트 정리 |

---

## 2) P0 — 가장 먼저 복구

### A. 로그인·보호 페이지 전체 이상

**증상**: 로그인은 되는데 계속 `/login`·`/dashboard`로 튕김, STAFF뿐 아니라 ADMIN도 이상, 보호 페이지 대부분 꼬임.

**원인 후보**: `middleware.ts` 변경, 세션 쿠키 파싱 불일치, JWT secret·payload `role` 불일치.

**복구**: 미들웨어에서 **새 권한 분기만 잠시 제거** → 기존 동작으로 복구 → STAFF 예외는 **단계적으로** 재적용.

**가장 빠른 방법**: `middleware.ts`를 **마지막으로 잘 동작하던 버전**으로 되돌림. 이번 패치에서 **가장 먼저 롤백 후보가 되는 파일이 거의 항상 여기**입니다.

**임시 목표**: ADMIN 로그인·기존 보호 페이지 정상. STAFF 정책은 잠시 포기 가능.

### B. `npm run dev` / `npm run build` 실패

**원인 후보**: 신규 파일 import 경로, `guards.ts`, `RoleGate.tsx`, `system/page.tsx`, route의 `requestId`·`auth` 스코프.

**복구 순서**: `npm run lint` **첫 번째 에러만** 처리 → `middleware.ts` → `guards.ts` → bulk/rebalance route → system page → UI.

**새 기능 잠시 끄기** (dev 다시 띄우기):

1. RoleGate 유니온 변경 잠시 제거  
2. system page 직접 호출 변경 잠시 제거  
3. bulk/rebalance의 logger·requestId·rateLimit 부분 주석  
4. 그래도 안 되면 `middleware.ts` 복구  

---

## 3) P1 — 핵심 정책이 틀릴 때

### A. STAFF가 들어가야 할 페이지를 못 들어감

**증상**: STAFF가 `/admin/alerts/ops-queue`에서 `/dashboard`로 튕김.

**후보**: `isStaffAllowedAdminPath()` prefix 오타, 실제 URL 다름, `role`이 `"STAFF"`가 아님, 미들웨어가 role 잘못 읽음.

**복구**: 실제 경로 → 실제 role → `admin-staff-paths.ts` → middleware 비교식.

**빠른 확인**: middleware 안에서 STAFF 허용을 **하드코딩**으로 잠깐 넣어 본다. 되면 문제는 `admin-staff-paths.ts` 또는 경로 문자열.

### B. STAFF가 들어가면 안 되는 곳까지 들어감

**후보**: prefix 과대, `/admin/alerts/ops` 같은 느슨한 접두사, `startsWith` 과다.

**복구**: **exact + nested만** — `pathname === prefix || pathname.startsWith(\`${prefix}/\`)`.

### C. 관리자 API가 401/403/500으로 전부 깨짐

**후보**: `requireRoleApi()`가 route에서 세션 못 읽음, `getSessionUser()`와 route handler 불일치, `auth.user` 필드명 차이.

**복구**: `requireRoleApi` 최소화 → **release-meta 하나만** 먼저 살림 → bulk·rebalance 순 확장.

**급하면**: 기존 **`requireAdminApi()`**가 살아 있으면 bulk/rebalance에 **다시 연결** (새 헬퍼 고집보다 기존 검증기 우선).

---

## 4) P1 — health / release / system

| 문제 | 후보 원인 | 복구 순서 |
|------|-----------|-----------|
| `/api/health` 500 | Prisma·함수명·DB | DB 체크 **없는** 최소 health → 이후 DB 재도입 |
| release-meta ADMIN도 실패 | `requireRoleApi`, util import | `getReleaseMetaInline()`만 응답 → 인증 재연결 (로컬은 동작 확인 후 인증 재부착 가능, **공개는 주의**) |
| system page만 깨짐 | `"use client"`, import, cookies 잔여 | 서버 컴포넌트로 복구, fetch 제거분 점검, 필요 시 **기존 fetch 방식으로 임시 롤백** |

**health 급복구 예** (DB 체크 없음, 임시):

```ts
return NextResponse.json({
  ok: true,
  status: "healthy",
  ts: new Date().toISOString(),
});
```

---

## 5) P2 — UI/UX

- **STAFF에게 수정 버튼이 보임**: 서버 API가 막혀 있는지 **먼저** 확인 → 그다음 버튼 숨김 (보안은 서버 우선).  
- **조회 전용 배너 미표시**: prop 이름·`hasMinRole` import → `canEdit` 계산 확인 후 배너.

---

## 6) P2 — 부가 기능

- **429로 테스트 꼬임**: limit 임시 상향, dev에서 limiter 우회(예: `NODE_ENV === "development"`일 때 `{ ok: true }`), 검증 후 원복.  
- **logger import 깨짐**: 기존 logger 경로에 맞추거나 `console.*` 임시.  
- **requestId 스코프**: try 밖 선언 원칙. 급하면 requestId 코드 자체를 잠시 제거해도 비즈니스는 돌아갈 수 있음.

---

## 7) P3 — 테스트만 실패

런타임이 살아 있으면 **P3**. unit → e2e → config 순으로 정리.

**E2E 404**: route 경로·`baseURL`·dev 기동 여부 확인.

---

## 8) 실제 복구 순서표

| 순서 | 할 일 | 목적 |
|------|--------|------|
| 1 | `npm run lint` | 첫 정적 오류 제거 |
| 2 | `npm run dev` | 앱 부팅 |
| 3 | `/api/health` | 서버 최소 생존 |
| 4 | 로그인·보호 페이지 | 전역 인증 축 |
| 5 | `middleware.ts` | 접근 장애 제거 |
| 6 | `guards.ts` / API auth | 관리자 API |
| 7 | bulk-edit / rebalance | 운영 핵심 |
| 8 | release-meta / system | 점검 도구 |
| 9 | RoleGate·배너·버튼 | UX |
| 10 | test / e2e | 품질 마감 |

---

## 9) “이럴 땐 무엇을 먼저 롤백할까”

| 증상 | 첫 롤백 대상 | 이유 |
|------|--------------|------|
| 로그인 후 전부 이상 | `middleware.ts` | 전역 영향 최대 |
| ADMIN API 전부 실패 | `requireRoleApi` 연결부 | 신규 권한 헬퍼가 축 |
| system page만 실패 | system page 직접 호출 변경분 | 핵심과 분리·롤백 쉬움 |
| bulk-edit만 실패 | 해당 route의 requestId/logger/rateLimit | 부가부터 제거하면 본 로직 살림 |
| UI만 이상 | RoleGate 변경분 | 서버와 분리 |
| test만 실패 | 테스트·config | 런타임과 별개 |

---

## 10) 복구 전략 3원칙

1. **새 공통 추상화보다 기존에 돌던 구현** — `requireAdminApi()`가 안정적이면 그걸 먼저.  
2. **부가 기능부터 덜어냄** — requestId, logger, rate limit, 배너 등은 잠시 제거 가능.  
3. **전역 영향 파일은 최우선 주의** — `middleware.ts`, `session.ts`, `guards.ts`.

---

## 11) 한 줄 요약 순서

**middleware 복구 → session/guard 복구 → bulk/rebalance API 복구 → health/release/system 복구 → UI·테스트 복구**

---

## 12) 실전 판단 기준

| 상황 | 먼저 볼 것 |
|------|------------|
| 서비스가 아예 안 뜬다 | middleware · import · build |
| 권한이 틀리다 | session · guard · role |
| 운영 작업만 실패 | bulk/rebalance route |
| 관리 도구만 실패 | health · release · system |
| 보여주기만 이상하다 | UI는 **맨 마지막** |

기능이 많이 쌓인 프로젝트일수록 **한 번에 전부 고치지 말고** 위 우선순위로 쪼개는 것이 안전합니다.

---

## 관련 문서

- [handover-and-operations.md](./handover-and-operations.md)
- [post-patch-verification.md](./post-patch-verification.md)
- [grep-rg-troubleshooting.md](./grep-rg-troubleshooting.md)
