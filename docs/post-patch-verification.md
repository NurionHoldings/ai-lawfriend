# 패치 후 점검 순서 (로컬 · npm 기준)

로컬 개발 환경에서 **순서대로** 실행할 수 있는 명령 묶음입니다.  
Windows는 PowerShell 기준 보조 명령을 함께 적었습니다.

---

## 1) 1차 확인 — 파일·경로·핵심 식별자

패치 직후 “붙긴 붙었는지”부터 확인합니다.

```bash
rg "STAFF_ALLOWED_ADMIN_PATH_PREFIXES|isStaffAllowedAdminPath" src
rg "hasMinRole|isAdminRole|isStaffRole|requireRoleApi" src
rg "OPS_BULK_EDIT_MAX_ITEMS|OPS_REBALANCE_MAX_ITEMS|OPS_MUTATION_REQUESTS_PER_MINUTE" src
rg "getRequestId|simpleRateLimit|captureServerError|getHealthStatus|getReleaseMetaInline" src
rg "/admin/alerts/ops-queue|/admin/alerts/ops-dashboard|/admin/audit-logs" src
```

**결과가 비면**: 파일 미생성, import 경로 오타, 실제 디렉터리명 불일치 가능.

---

## 2) 2차 확인 — 의존성·스크립트

```bash
# scripts 블록 확인 (Unix)
grep -A 30 '"scripts"' package.json

# Windows PowerShell
Get-Content package.json | Select-String -Pattern '"scripts"' -Context 0,40

npm ls next prisma zod jose bcryptjs vitest @playwright/test
```

부족하면:

```bash
npm install
npm i -D vitest @playwright/test   # 테스트 도구 없을 때
npx playwright install
```

---

## 3) 3차 확인 — alias·설정

```bash
type tsconfig.json
# 또는: cat tsconfig.json

dir vitest.config.*, playwright.config.* 2>nul
# Unix: ls -1 vitest.config.* playwright.config.* 2>/dev/null

rg '"@/\*":|paths|alias|baseURL' tsconfig.json vitest.config.ts playwright.config.ts
```

**확인**: `tsconfig`에 `@/*` → `src/*`, Vitest에 `alias`, Playwright에 `baseURL`.

---

## 4) 4차 확인 — lint

```bash
npm run lint
# 스크립트 없으면: npx next lint
```

중복·미사용 import, 미정의 변수, JSX 오류 등이 여기서 많이 잡힙니다.

---

## 5) 5차 확인 — 핵심 grep (lint 실패 시 위치 좁히기)

```bash
rg "getSessionUser|requireRolePage|requireRoleApi" src
rg "requestId|auth\.user|sessionUser\.role|sessionUser\.id" src
rg "opsQueueTicketIds|suggestedAssigneeUserId|updatedCount|ticketIds" src
rg "logger|captureServerError|NextResponse" src/app/api src/lib
rg "cookies\(|NEXT_PUBLIC_APP_URL|api/health|api/release-meta" src/app
```

---

## 6) 6차 확인 — 단위 테스트

```bash
npm run test
```

선택:

```bash
npx vitest run src/lib/auth/__tests__/roles.test.ts
npx vitest run src/lib/auth/__tests__/admin-staff-paths.test.ts
```

깨지면: 역할 문자열·prefix 오타·`@/` alias 가능성.

---

## 7) 7차 확인 — Prisma·seed (DB 손대기 전)

```bash
rg "passwordHash|hashedPassword|UserRole|role:|upsert\\(" prisma src
```

스키마·시드 내용 확인 후:

```bash
npm run db:generate
npx prisma db seed
```

(`seed`는 프로젝트 설정에 따라 다름.)

---

## 8) 8차 확인 — dev 서버

```bash
npm run dev
```

---

## 9) 9차 확인 — health / release-meta (별도 터미널)

**health**

```bash
curl -i http://localhost:3000/api/health
```

- 정상: `200`, `ok: true`, `status: healthy`
- DB 문제: `503`, `ok: false`

**release-meta (비로그인)**

```bash
curl -i http://localhost:3000/api/release-meta
```

- 기대: `401` 또는 `403`

---

## 10) 10차 확인 — bulk / rebalance 비로그인 차단

**bulk-edit**

```bash
curl -i -X POST http://localhost:3000/api/admin/alerts/ops-queue/bulk-edit ^
  -H "Content-Type: application/json" ^
  -d "{\"opsQueueTicketIds\":[\"ticket-1\"]}"
```

Unix/macOS에서는 `\` 줄바꿈 대신 한 줄로 쓰거나 `\` 사용.

**rebalance-apply** (본 프로젝트 스키마: `items[]`, 필드명 `opsQueueTicketId` / `suggestedAssigneeUserId`)

```bash
curl -i -X POST http://localhost:3000/api/admin/alerts/ops-queue/rebalance-apply ^
  -H "Content-Type: application/json" ^
  -d "{\"items\":[{\"opsQueueTicketId\":\"ticket-1\",\"suggestedAssigneeUserId\":\"user-1\"}]}"
```

- 비로그인 기대: `401` 또는 `403`

---

## 11) 11차 확인 — 브라우저 수동

**STAFF**

1. 로그인  
2. `/admin/alerts/ops-queue`, `/admin/alerts/ops-dashboard`, `/admin/audit-logs` 접근 가능  
3. `/admin/users` → `/dashboard` 리다이렉트  
4. 운영 큐 상단 조회 전용 배너  
5. 대량 편집·재분배·카드 변경 등 변경 UI 비활성/숨김

**ADMIN**

1. 위 경로 + 수정 기능·bulk·rebalance 동작  
2. 로그인 상태에서 `/api/release-meta` 허용(또는 브라우저·도구로 확인)

---

## 12) 12차 확인 — 레이트 리밋 (관리자 세션 필요)

비로그인으로는 `401/403`만 반복됩니다. **쿠키가 있는 관리자 요청**으로 같은 엔드포인트를 짧게 연속 호출해 `429`를 확인합니다.

**Bash**

```bash
for i in {1..12}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST http://localhost:3000/api/admin/alerts/ops-queue/bulk-edit \
    -H "Content-Type: application/json" \
    -H "Cookie: aibupchin_access_token=..." \
    -d '{"opsQueueTicketIds":["ticket-1"]}'
done
```

**PowerShell** (쿠키는 실제 값으로 교체)

```powershell
1..12 | ForEach-Object {
  curl.exe -s -o NUL -w "%{http_code}`n" `
    -X POST http://localhost:3000/api/admin/alerts/ops-queue/bulk-edit `
    -H "Content-Type: application/json" `
    -H "Cookie: aibupchin_access_token=..." `
    -d '{\"opsQueueTicketIds\":[\"ticket-1\"]}'
}
```

---

## 13) 13차 확인 — E2E

```bash
npm run test:e2e
npx playwright test tests/e2e/admin-role-matrix.spec.ts
```

`404`면: 경로 불일치, dev 미기동, `playwright.config`의 `baseURL` 확인.

---

## 14) 14차 확인 — 프로덕션 빌드

```bash
npm run build
```

server/client 경계, middleware, env, 동적 import 등은 여기서 자주 드러납니다.

---

## 15) 15차 확인 — 배포 직전 한 번에

```bash
npm install
npm run lint
npm run test
npm run db:generate
npm run build
```

로컬 스모크:

```bash
npm run dev
```

별도 터미널:

```bash
curl -i http://localhost:3000/api/health
curl -i http://localhost:3000/api/release-meta
curl -i -X POST http://localhost:3000/api/admin/alerts/ops-queue/bulk-edit -H "Content-Type: application/json" -d "{\"opsQueueTicketIds\":[\"ticket-1\"]}"
```

---

## 16) 문제 발생 시 역추적 세트

| 유형 | 명령 |
|------|------|
| 권한 | `rg "getSessionUser|requireRolePage|requireRoleApi|role|userRole|accountRole" src` + `rg "/admin|isStaffAllowedAdminPath|STAFF_ALLOWED|middleware" src` |
| API 필드 | `rg "opsQueueTicketIds|ticketIds|suggestedAssigneeUserId|updatedCount|bulk-edit|rebalance-apply" src` |
| health/release | `rg "health|release-meta|getHealthStatus|getReleaseMetaInline|BUILD_TIME|VERCEL_GIT_COMMIT_SHA" src` |
| Prisma/seed | `rg "passwordHash|hashedPassword|UserRole|upsert\\(" prisma src` |

상세 검색 패턴은 [grep-rg-troubleshooting.md](./grep-rg-troubleshooting.md) 참고.

---

## 17) 압축 핵심 세트 (자주 쓰는 순서)

```bash
npm install
npm run lint
npm run test
npm run db:generate
npm run build
npm run dev
```

확인:

```bash
curl -i http://localhost:3000/api/health
curl -i http://localhost:3000/api/release-meta
```

브라우저: STAFF → `/admin/alerts/ops-queue`, `/admin/users` · ADMIN → 수정 기능.

---

## 관련 문서

- [handover-and-operations.md](./handover-and-operations.md) — 인수인계 전체
- [grep-rg-troubleshooting.md](./grep-rg-troubleshooting.md) — 오류 시 검색
- [incident-recovery-playbook.md](./incident-recovery-playbook.md) — 장애 시 우선순위·롤백
- [minimum-rollback-playbook.md](./minimum-rollback-playbook.md) — 최소 롤백·4파일·10분 순서
- [operations-recovery-checklist.md](./operations-recovery-checklist.md) — 운영 복구 체크리스트·재적용 순서
- [OPERATIONS_RECOVERY.md](../OPERATIONS_RECOVERY.md) — 운영 복구 매뉴얼(전체 서술·1~13장)
