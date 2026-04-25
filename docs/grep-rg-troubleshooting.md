# rg/grep으로 오류 원인 좁히기 (팀 공용 치트시트)

컴파일·런타임 오류가 났을 때 **식별자 하나**로 레포 전체를 훑어 정의/사용/이름 불일치를 찾을 때 사용합니다. 실무에서는 **ripgrep(`rg`)**을 권장합니다.

## 환경

- **Linux/macOS / Git Bash**: `rg "패턴" src` 또는 `grep -RIn "패턴" src`
- **Windows**: `winget install BurntSushi.ripgrep` 후 프로젝트 루트에서 동일하게 `rg` 사용
- **Cursor**: `Ctrl+Shift+F`에 아래 패턴을 넣고 `src` 또는 `prisma`로 범위 제한

---

## 1) 세션 / 권한

| 목적 | 명령 예 |
|------|---------|
| `getSessionUser` 정의·사용 | `rg "getSessionUser" src` |
| 세션 헬퍼 넓게 | `rg "getCurrentUser\|requireSession\|getSession\|sessionUser" src/lib src/app` |
| `requireRolePage` | `rg "requireRolePage" src` |
| 가드·관리자 API | `rg "requireRole\|requireAdminThrow\|requireAdminApi" src/lib src/app` |
| 역할 필드명 | `rg "type .*Session\|interface .*Session\|role:\|userRole:\|accountRole:" src/lib src/types` |
| id 필드명 | `rg "sessionUser\.id\|user\.id\|userId\|accountId\|memberId" src` |

---

## 2) 역할 문자열 / enum

| 목적 | 명령 예 |
|------|---------|
| 문자열·enum | `rg '"STAFF"|"ADMIN"|"SUPER_ADMIN"|UserRole|ROLE_RANK' src prisma` |
| Prisma 스키마 | `rg "enum .*Role|role\s" prisma/schema.prisma` |
| 비교 함수 | `rg "hasRoleAtLeast|hasMinRole|isAdminRole|ROLE_RANK" src/lib` |

---

## 3) 미들웨어 / STAFF 경로

| 목적 | 명령 예 |
|------|---------|
| `/admin` 처리 | `rg 'pathname\.startsWith\("/admin"\)|/admin' src/middleware.ts src` |
| STAFF 허용 | `rg "isStaffAllowedAdminPath|STAFF_ALLOWED_ADMIN_PATH_PREFIXES" src` |
| ops·감사로그 URL | `rg "/admin/alerts/ops-queue|/admin/alerts/ops-dashboard|/admin/audit-logs" src/app src/components src/lib` |

---

## 4) API 라우트 위치

| 목적 | 명령 예 |
|------|---------|
| bulk-edit | `rg "bulk-edit" src/app/api` |
| rebalance | `rg "rebalance-apply|rebalance" src/app/api` |
| health / release | `rg "release-meta|api/health|getReleaseMetaInline|getHealthStatus" src/app src/lib` |

---

## 5) 요청/응답 필드명

| 목적 | 명령 예 |
|------|---------|
| 티켓 ID 배열 | `rg "opsQueueTicketIds|ticketIds|queueIds" src/app src/components` |
| 담당자 | `rg "targetAssigneeId|assigneeId|suggestedAssigneeUserId" src` |
| 응답 카운트 | `rg "updatedCount|appliedCount|\.count" src/components src/app` |

---

## 6) logger / request-id / 모니터링

| 목적 | 명령 예 |
|------|---------|
| logger import | `rg "from .*/logger|logger\.(info|warn|error)" src` |
| request id | `rg "requestId|correlationId|x-request-id" src` |
| Sentry 등 | `rg "Sentry|captureException|captureServerError|sentry" src` |

---

## 7) health / system 페이지

| 목적 | 명령 예 |
|------|---------|
| 헬스 유틸 | `rg "getHealthStatus|checkHealth|SELECT 1|api/health" src` |
| 릴리즈 메타 | `rg "getReleaseMetaInline|commitSha|VERCEL_GIT_COMMIT_SHA|BUILD_TIME" src` |
| 예전 fetch 흔적 | `rg "api/health|api/release-meta|NEXT_PUBLIC_APP_URL|cookies\(" src/app` |

---

## 8) RoleGate / OpsQueue UI

| 목적 | 명령 예 |
|------|---------|
| RoleGate | `rg "<RoleGate|RoleGate\(" src/components src/app` |
| 권한 분기 | `rg "canEdit|minimumRole|minRole|currentUserRole|hasRoleAtLeast|hasMinRole" src/components src/app` |
| 칸반 보드 | `rg "OpsQueueKanbanBoard|currentUserRole" src/components src/app` |

---

## 9) Prisma / seed

| 목적 | 명령 예 |
|------|---------|
| 비밀번호 필드 | `rg "passwordHash|hashedPassword|password:" prisma src` |
| 역할 enum | `rg "role: UserRole|UserRole\.|role:" prisma src` |
| 시드 패턴 | `rg "admin@example|upsert\\(|bcrypt" prisma/seed.ts` |

---

## 10) Vitest / Playwright / alias

| 목적 | 명령 예 |
|------|---------|
| `@/` 경로 | `rg '"@/\*"|paths|alias' tsconfig.json vitest.config.ts` |
| Vitest | `rg "defineConfig|vitest|test:" vitest.config.ts` |
| Playwright | `rg "baseURL|testDir" playwright.config.ts tests` |

---

## 묶음 검색 세트 (시간 없을 때)

```bash
rg "getSessionUser|requireRolePage|requireRoleApi|role|userRole|accountRole" src/lib src/app
rg "/admin|isStaffAllowedAdminPath|STAFF_ALLOWED_ADMIN_PATH_PREFIXES|middleware" src
rg "opsQueueTicketIds|ticketIds|targetAssigneeId|updatedCount|bulk-edit|rebalance-apply" src
rg "health|release-meta|commitSha|BUILD_TIME|NEXT_PUBLIC_APP_URL" src
rg "passwordHash|hashedPassword|UserRole|role:|upsert\\(" prisma src
```

---

## 오류 메시지 → 검색 키워드

| 메시지 | 할 일 |
|--------|--------|
| `has no exported member 'X'` | `rg "X" src` |
| `Property 'X' does not exist` | `rg "X\|SessionUser\|…"` 로 타입·필드 추적 |
| `Cannot find module '@/…'` | `rg "파일명|폴더명" src` + `tsconfig.json` `paths` 확인 |
| 404 | `rg "경로조각" src/app/api` |

---

## 실전 절차 (4단계)

1. 오류에서 **식별자 1개**만 고른다 (함수명, 필드명, 경로, 타입명).
2. `rg "식별자" src` (필요 시 `prisma` 포함).
3. **정의 1곳**과 **사용 여러 곳**을 같이 본다.
4. 새 이름을 만들기보다 **기존 프로젝트 이름에 맞춘다**.

---

## 이 레포(AI법친)에서 자주 쓰는 고정값

- 세션: `src/lib/auth/session.ts` — `getSessionUser`, `requireRolePage`
- 쿠키명: `aibupchin_access_token`
- 칸반 등 UI: `src/components/admin/alerts/ops-queue/`
- STAFF 허용 prefix: `src/lib/auth/admin-staff-paths.ts`

자세한 운영 맥락은 [handover-and-operations.md](./handover-and-operations.md)를 참고합니다.  
장애 시 **무엇을 먼저 롤백할지**는 [incident-recovery-playbook.md](./incident-recovery-playbook.md), 패치 직후 점검 순서는 [post-patch-verification.md](./post-patch-verification.md)를 참고합니다.
