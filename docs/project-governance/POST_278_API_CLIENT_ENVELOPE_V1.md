# post-[278] API 클라이언트 envelope 잔여 — 별도 증빙 축 (V1)

**목적:** [278]에서 **막힌 축**(문서·auth·`@/lib/api-response` 제거 등)과 **분리**하여, 남은 `fetch` 응답 판정(`!res.ok`, `json.ok` 느슨함, 평면 `message`)을 **우선순위·슬라이스**로 고정한다.

**관계:** [278]는 **중간 마감**(`IMPLEMENTATION_EVIDENCE.md` 동일 제목 절). 본 문서는 **[278] 범위 밖 잔여**만 다룬다.

**축 상태 (envelope / `requireOk*`):** **§14.4**·**§15** 기준, 클라이언트 **응답 envelope 정리 축**은 **여기서 중간 마감** — 의도적 예외 **2건**은 **§14.4 표**·본 문서 **§6.3**에 **고정** — **[EVIDENCE-20260423-281]**. **다음 개선 축**은 **§15**·증빙.

---

## 1. 축 정의 (증빙 분리)

| 구분 | 포함 | 제외 |
|------|------|------|
| **post-[278] 본 축** | 클라이언트 `fetch` 후 `Response`/`JSON` 판정 일관성, `ok === true` 엄격화, `readJsonApiErrorMessage` 정렬, (필요 시) 공용 헬퍼 도입 | 서버 라우트 스키마 자체 설계, Prisma, Case 상태 정의 |

**기대 패턴 (권고):** `!res.ok` → `readJsonApiErrorMessage` early return; 성공 시 `(json as { ok?: boolean }).ok === true`(또는 프로젝트 표준 domain 응답과 일치하는 판정) + `data` 검증. 레거시 `success` envelope는 [278] 스캔에서 사건별 `isJsonApiSuccess`로만 수용.

---

## 2. 잔여 클러스터 (2026-04-23 스냅샷)

**최신 구분(닫힘 vs 차기):** **§9~§12** = V1 **마감** · **§13** = **슬라이스 6** · **§14~§15** = **envelope / `requireOk*` 정리 축 — 중간 마감·차기 전환 (2026-04-23)** — **[EVIDENCE-20260423-280]** · **[EVIDENCE-20260423-281]**.

아래는 `src` 기준 그룹이다. 일부는 이미 `json.ok === true`를 쓰나, **동일 디렉터리 내** `!res.ok` 단독·`!json.ok`(truthy)·`data.message` throw가 **혼재**한다.

### A. 관리자 알림·OPS·bulk (`src/components/admin/alerts/**`, `bulk-jobs`, `filter-preset*`, `escalations`, `cron` 일부)

- **슬라이스 2(2026-04-23) 마감:** 1·2차 범위 + §6.4 **마감 스캔**·소규모 보완.
- **슬라이스 3(2026-04-23) 완료:** §8 **P2b** — KPI·성능·알림·bulk 부가 UI + compare/dashboard API `ok` 정합.

### B. 질문셋·문서 템플릿 (`question-set-*.tsx`, `document-template-*.tsx`)

- **슬라이스 1(2026-04-23)에서 정리:** 아래 5클라 + `/api/admin/question-sets*` 응답을 domain `{ ok, data }`로 맞춤, 클라이언트는 `requireOkData` + `readJsonApiErrorMessage`로 통일.
- 그 외 동일 네이밍 접두 **슬라이스 1에 없던** 컴포넌트가 생기면 동일 §4 기준을 따른다.

### C. 사건 부가 UX (`case-interview-client.tsx`, `case-alert-widget.tsx`, `case-alert-summary-banner.tsx`)

- **슬라이스 4(2026-04-23):** P3 **완료** — **§10**. (과거: `!res.ok`·느슨 `json` 혼재)

### D. 문서·문단 UI (`document-paragraph-*`, `document-detail-client` 등)

- **슬라이스 5(2026-04-23):** P4 **완료** — **§11**. (과거: `!res.ok` + `unwrapDomainApiData`·느슨 `json` 혼재)
- **슬라이스 6(2026-04-24):** `case-summary-panel`·`document-version-panel`·`document-draft-client` **완료** — **§13**.
- 잔여(문서·사건): **`case-detail-client`** — **슬라이스 7 완료** · **§14.1** 우선 2~3 — `paragraph-*`·`document-verification`·`document-create-modal` 등.

### E. 공용 유틸 (현행)

- `src/lib/client/api-error.ts` — `readJsonApiErrorMessage`, **`requireOkData`** (domain `{ ok, data }`), **`requireOkResponseBody`** (`{ ok, presets }` 등 평면 확장)
- ~~`src/lib/client/unwrap-domain-api-response.ts`~~ — **삭제** ( **R8-301** ) — [IMPLEMENTATION_EVIDENCE](./IMPLEMENTATION_EVIDENCE.md) **[EVIDENCE-20260423-294]**
- (과거) `case-detail-client` — `isJsonApiSuccess` — **슬라이스 7 (2026-04-25) 제거** — **§14.2**.

**참고:** `src/lib/fetcher.ts`의 `parseApiResponse`는 **import 0** — 타입·함수만 남음. 후속에서 제거하거나 단일 헬퍼로 흡수 가능.

---

## 3. 우선순위 (고정)

| 순위 | 내용 | 근거 |
|------|------|------|
| **P0** | `requireOkData`(`src/lib/client/api-error.ts`) — 슬라이스 1에서 도입 | `res` + `raw` + 엄격 `ok === true` + `data` 추출. |
| **P1** | **슬라이스 1 (완료, 2026-04-23)** — 질문셋 3 + 문서템플릿 2 + admin question-sets API | 아래 §5. |
| **P2** | **슬라이스 2 (2026-04-23, 마감)** — 알림·필터·크론·bulk·규칙·에스컬·OPS·모달·대시보드 요약 | §6.2·§6.3·§6.4. |
| **P2b** | **슬라이스 3 (2026-04-23 완료)** — 알림·OPS **부가** 위젯·알림·KPI/성능·bulk-jobs 잔여 패널 | §8. |
| **P3** | **슬라이스 4 (2026-04-23 완료)** — 사건 부가 3클라 | **§10**, `requireOkData` + `requireOkResponseBody`. |
| **P4** | **슬라이스 5 (2026-04-23 완료)** — D 그룹 4클라 | **§11**, `requireOkData` (domain `ok`/`/api/documents/...`·사건 draft history). |
| **(V1 밖)** | **슬라이스 6 (2026-04-24 완료)** — 위 3클라 | **§13** · `requireOkData` — **[EVIDENCE-20260424-271]**. |
| **(후속)** | **슬라이스 7 (2026-04-25 완료)** — `case-detail-client` 1파일 | **§14.2** · **[EVIDENCE-20260425-273]**. |

---

## 4. 슬라이스 1 대상 (고정) — **완료: §5**

**이름:** post-[278] **슬라이스 1** (증빙·PR 제목에 동일 표기 권장)

**포함 파일 (필수):**

- `src/components/admin/question-set-editor.tsx`
- `src/components/admin/question-set-create-client.tsx`
- `src/components/admin/question-set-list-client.tsx` (목록·SSR 연동; [332](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-332) — 구 `question-set-admin-client` **제거**)
- `src/components/admin/document-template-editor.tsx`
- `src/components/admin/document-template-create-client.tsx`

**완료 조건 (검수):**

- 성공 판정에 **`json.ok === true`**(또는 해당 API가 domain 표준으로 정한 동일 엄격 조건). `!json.ok` truthy 제거.
- 실패 메시지는 **`readJsonApiErrorMessage`** (또는 P0에서 합의한 단일 헬퍼)로 통일.
- `npx tsc --noEmit` · `npx vitest run` 통과 및 `IMPLEMENTATION_EVIDENCE.md`에 본 축 하위 증빙 절 추가.

**범위 밖 (의도적):** `src/components/admin/alerts/**` 전부, `case-interview-client`, `case-alert-widget` — **슬라이스 2 이후**.

---

## 5. 슬라이스 1 완료 (2026-04-23)

**클라이언트 (5):** `question-set-list-client.tsx` (목록), `question-set-editor.tsx`, `question-set-create-client.tsx`, `document-template-editor.tsx`, `document-template-create-client.tsx` — 구 `question-set-admin-client.tsx` 는 미연결 고아로 **332** 에서 **삭제** ([EVIDENCE-20260423-332](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-332))

- `const raw = await res.json().catch(() => null)` 후 **`requireOkData(res, raw, fallback)`** 로 HTTP 성공 + `json.ok === true` + `data` 사용(생성/리다이렉트는 `data.id` 등).
- 실패: `readJsonApiErrorMessage` (게시 422는 `document-template-editor`에만 `res.status === 422` 보조 문구 유지, 메시지 본문은 `readJsonApiErrorMessage`).

**서버 (슬라이스에 포함, 클라 `ok` 기준 맞춤):** `src/app/api/admin/question-sets/route.ts`, `src/app/api/admin/question-sets/[id]/route.ts` — 성공을 전부 `ok(...)` / 오류를 `fail(...)` (`@/lib/domain-api-response`).

**검증:** `npx tsc --noEmit` · `npx vitest run` (68/68) 통과.

**다음:** §6 슬라이스 2.

---

## 6. 슬라이스 2 — pre-OPS 스캔 + P2 1차 (2026-04-23)

### 6.1 pre-알림 스캔 (슬라이스 1 외 *편집/생성* 클라이언트)

- `*-editor.tsx` / `*-create-client.tsx` 기준: slice 1에 없는 **추가 `fetch`를 쓰는** 조합 **없음** (`document-template-list-client`·`question-set-list-client`·감사 **차트** `*-chart-client` 는 서버 주입 props만 사용).
- 동일 기준·동일 패턴 **남는 관리 UI** → **P2(알림 축)로 이월** (§6.2).

### 6.2 P2 1차 반영 (공용: `requireOkResponseBody`)

- **`{ ok: true, data }`가 아닌** `{ ok: true, presets }`·`{ ok: true, item }` 등 — **`requireOkData` 대신 `requireOkResponseBody`** (`src/lib/client/api-error.ts`).

| 구역 | 파일 (대표) |
|------|----------------|
| 필터 | `alerts/filter-preset-bar.tsx`, `filter-preset-save-dialog.tsx` |
| 알림 카드 | `alerts/alert-card-quick-actions.tsx` |
| 크론 | `cron/cron-logs-table.tsx`, `manual-cron-runner.tsx` |
| 에스컬 | `escalations/release-escalation-button.tsx` |
| 규칙 | `alerts/alert-rule-list.tsx` |
| bulk-jobs | `failed-job-items-table.tsx`, `failed-items-toolbar.tsx`, `bulk-job-admin-settings-form.tsx`, `BulkRetrySchedulePresetBar.tsx`, `BulkScheduleControls.tsx`, `ScheduleActionControls.tsx`, `recommended-action-buttons.tsx` |

- **검증:** `npx tsc --noEmit` · `npx vitest run` (68/68) 통과.

### 6.3 슬라이스 2 잔여·예외 (참고)

- **2차(2026-04-23)로 상기 목록을 반영함** — `IMPLEMENTATION_EVIDENCE.md` **[EVIDENCE-20260423-263]**.
- (참고) `document-template-editor` **게시** 분기: 의도적 `!res.ok` + 422 문구(슬라이스 1과 동일).
- (참고) `OpsQueueAssigneeSelect` **담당자 검색**은 `/api/admin/users/search` 가 `{ users }` 레거시 형식이어서 envelope 스캔에서 제외; **PATCH** 저장만 `requireOkResponseBody` 적용.

### 6.4 슬라이스 2 **마감 스캔** (2026-04-23, `src/components/admin/alerts/**` 중심)

**도구 (전역):** `!res.ok` · `readApiErrorMessage` · `data.message` / `err.message \|\|` · 느슨한 `json.ok` (truthy) · `await res.json()` 단독(헬퍼 없음) 조합.

| 결과 | 설명 |
|------|------|
| **핵심 경로** | 2차에서 정리한 `ops-queue`·이벤트 모달·규칙·필터·bulk-jobs(스케줄/실패 테이블 등) — `requireOkResponseBody` / `requireOkData` + 단일 `json` 파싱. |
| **마감 시 보완 3건** | `ops-queue/OpsQueueBulkEditToolbar` `loadUsers` — `requireOkResponseBody` 누락 복구. `ops-dashboard/OpsDashboardOverview` — `res.ok` 미검·`ok === true` 느슨 판정 제거(헬퍼 사용). `assignee-user-picker` — `/api/admin/users/search` 응답 키 오류 `items` → **`users`** (레거시 평면, envelope 아님). |
| **의도적 `!res.ok` 1곳** | `bulk-jobs/recommended-action-buttons` — 409·중복 job/스케줄 ID 분기 **후** 성공 본문은 `requireOkResponseBody` (슬라이스 1·2와 동일 예외 패턴). |
| **잔여 (슬라이스 3로 이월)** | 아래 §8 고정 목록(동일 디렉터리 내 `fetch` + 레거시/느슨 판정). |

**검증:** `npx tsc --noEmit` · `npx vitest run` (68/68) 통과 — `IMPLEMENTATION_EVIDENCE.md` **[EVIDENCE-20260423-264]**.

---

## 7. 진행 시 참고

- 계획·Phase: `tools/aibeopchin_navigator.py` (`show-plan` 등).
- [278] 마감·스캔 요지: `IMPLEMENTATION_EVIDENCE.md` —「[278] 범위 최종 스캔·중간 마감」절·「post-[278] 별도 증빙 축」.
- **post-[278] 본 문서(P0~P4) 닫힘·최종 스캔:** **§9~§12** · **V1 중간 마감 선언:** **§12** · 증빙 **[EVIDENCE-20260423-269]**.
- **V1 밖·슬라이스 6 (완료):** **§13** — **[EVIDENCE-20260424-271]** · 기획 **[EVIDENCE-20260424-270]**.
- **후속·슬라이스 7 (완료):** **§14.2** — **[EVIDENCE-20260425-273]** · 재스캔 **[EVIDENCE-20260425-272]**.

---

## 8. 슬라이스 3 — post-[278] **알림·OPS 부가 UI** (`P2b`, **2026-04-23 완료**)

**범위:** `src/components/admin/alerts/**` 부가 UI — **`requireOkResponseBody`**(평면 `{ ok, … }` API) + 단일 `res.json()`.

| 파일 | 메모 |
|------|------|
| `alert-kpi-widget.tsx` | `GET /api/admin/alert-events/kpi` — `kpi` 필드 |
| `alert-performance-dashboard.tsx` | `GET …/performance` — `items` |
| `header-notification-dropdown.tsx` | `unread-count`, `notifications` 목록, `read`, `read-all` |
| `admin-notification-panel.tsx` | 동일 알림 API |
| `bulk-action-job-status-modal.tsx` | `GET …/bulk-jobs/:id` — `job` + 폴링 |
| `bulk-jobs/bulk-job-compare-panel.tsx` | `GET …/compare` — 서버 **성공 본문에 `ok: true` 추가** (이전엔 평면만) |
| `bulk-jobs/bulk-job-anomaly-widget.tsx` | `GET …/bulk-jobs/dashboard` — **성공 본문에 `ok: true` 추가** |
| `bulk-jobs/bulk-job-charts.tsx` | `GET …/bulk-jobs/metrics?range=` — `items` |
| `bulk-jobs/worker-health-panel.tsx` | `GET /api/admin/system/workers/health` |
| `assignee-user-picker.tsx` | (슬라이스 2) `{ users }` 키 정합만. envelope는 선택 과제. |

**서버 정합 (슬라이스 3):** `src/app/api/admin/alerts/bulk-jobs/[jobId]/compare/route.ts`, `…/dashboard/route.ts` — 성공 JSON에 `ok: true` 추가(클라 `requireOkResponseBody`와 일치).

**검증:** `npx tsc --noEmit` · `npx vitest run` (68/68) — `IMPLEMENTATION_EVIDENCE.md` **[EVIDENCE-20260423-265]**.

**범위 밖:** (과거) 사건/문서 post-[278] P3·P4 — **슬라이스 4~5(§10·§11) 완료**로 흡수. `document-template-editor` 게시 422 (의도적 분기, 슬라이스 1), `bulk-jobs/recommended-action-buttons` 409·중복 분기 (의도적 `!res.ok` 선행, 슬라이스 2).

---

## 9. 2026-04-23 **재스캔** — 슬라이스 1~3 **닫힌 범위** vs **잔여**·**중간 마감**

### 9.1 `POST_278` 본문이 정한 우선순위 **P0~P2b** (끝난 것)

| 슬라이스 | 클러스터(문서 §) | 내용 | 증빙(요지) |
|----------|------------------|------|------------|
| **1** | **B** §4~5 | 질문셋 3 + 문서템플릿 2, `requireOkData`, question-sets API domain | §5, `requireOkData` |
| **2** | **A** §6.2~6.4 | 필터·크론·에스컬·규칙·bulk-jobs(핵심)·OPS 큐·모달 등, `requireOkResponseBody` | [263][264] |
| **3** | **A** §8 | KPI·성능·알림·Job 부가·worker health, compare/dashboard API `ok` | [265] |

→ **이 구간**은 본 문서 **목적 문장**(관리·알림·OPS·질문셋/템플릿 `fetch` 응답 판정 정리)에 대해 **계획상 시현 완료**로 본다.

### 9.2 클러스터 **A** — 계획 닫힘 + **의도·레거시 예외(경미)**

| 항목 | 판정 |
|------|------|
| `bulk-jobs/recommended-action-buttons` | 409/중복 ID 분기 **의도적** `!res.ok` 선행 — §6.4·§8과 동일, **슬라이스 2~3 범위에서 제외(예외로 고정)**. |
| `assignee-user-picker` | `/api/admin/users/search` — `{ users }` **레거시 평면**, `users` 키 정합(슬라이스 2). envelope는 **선택** 서버·클라 보강. |
| `ops-queue/OpsQueueAssigneeSelect` | 담당자 **검색** 동일 레거시. **PATCH**는 `requireOkResponseBody` 적용됨. |

→ **경미**하므로 **P2b와 함께 “알림·OPS 클러스터 A”는 중간 마감**에 포함(예외만 문서에 고정).

### 9.3 post-[278] **P3·P4** (슬라이스 4~5로 정리 완료)

**P3 (사건 부가 — `슬라이스 4` 완료, 2026-04-23):**

- `case-interview-client.tsx` — `GET/POST /api/cases/.../interview` — domain **`ok(...)`** → **`requireOkData`**
- `case-alert-widget.tsx` — `ok: true, items` → **`requireOkResponseBody`**
- `case-alert-summary-banner.tsx` — `ok: true, summary` → **`requireOkResponseBody`**

(과거 잔여 설명은 보관용으로 §10에 요약)

**P4 (문서·문단 — `슬라이스 5` 완료, 2026-04-23) —**

- `document-detail-client.tsx` — `GET /paragraphs` · `PATCH /api/documents/[id]` · `POST .../review` — **`requireOkData`**
- `document-paragraph-panel.tsx` — `GET .../paragraph-panel` · 사건 `draft/history`·`history/.../diff` — **`requireOkData`**
- `document-paragraph-version-panel.tsx` — `GET/POST .../paragraph-versions` · `POST .../restore` — **`requireOkData`**
- `document-paragraph-editor-panel.tsx` — `GET/PUT .../paragraphs` · `PATCH .../approval-review` — **`requireOkData`**

(과거 `unwrapDomainApiData` + 수동 `!res.ok`/`ok`는 §11 요약)

### 9.4 **중간 마감** 판정 (post-[278] **본 지표**)

- **P0~P4**·슬라이스 1~5(§3, §2 A~D) — **최종 재스캔·선언: §12** · `IMPLEMENTATION_EVIDENCE` **[EVIDENCE-20260423-269]**.
- (과거 문구) P0~P2b 달성 시 “중간 마감” 표기 — **P3·P4 완료 후** 본 V1은 **§12**에서 **한 번에** **중간 마감**을 확정한다.
- **P3(슬라이스 4, §10)·P4(슬라이스 5, §11)** 2026-04-23 완료. **의도 예외**는 **§12** 표. **동일 패턴 신규 `fetch`** — `requireOkData` / `requireOkResponseBody` 준수.

### 9.5 다음 문서/코드 액션

- 코드: post-[278] V1(§2 C·D 포함) **중간 마감** — **§12** · V1 **밖** `fetch`는 별도 합의.
- 문서: `IMPLEMENTATION_EVIDENCE` — **[EVIDENCE-20260423-269]** · **§10·§11·[268]·[267]** 상호참조.

---

## 10. 슬라이스 4 — **사건 부가 (P3)** (2026-04-23 완료)

| 파일 | API | 클라이언트 |
|------|-----|------------|
| `src/components/cases/case-interview-client.tsx` | `GET/POST /api/cases/[caseId]/interview` (`ok`/`@/lib/domain-api-response`) | **`requireOkData`** — `data` = flow / `{ saved, flow }` |
| `src/components/cases/case-alert-widget.tsx` | `GET /api/admin/alert-events/by-case/[caseId]` | **`requireOkResponseBody`** — `items` |
| `src/components/cases/case-alert-summary-banner.tsx` | `GET .../by-case/.../summary` | **`requireOkResponseBody`** — `summary` |

**검증:** `npx tsc --noEmit` · `npx vitest run` (68/68) — `IMPLEMENTATION_EVIDENCE.md` **[EVIDENCE-20260423-267]**.

**잔여(당시):** P4 — **슬라이스 5(§11)로 이관·완료.**

---

## 11. 슬라이스 5 — **문서·문단 (P4)** (2026-04-23 완료)

| 파일 | API(요약) | 클라이언트 |
|------|-----------|------------|
| `src/components/cases/document-detail-client.tsx` | `GET` `/api/documents/[id]/paragraphs` · `PATCH` `/api/documents/[id]` · `POST` `.../review` | **`requireOkData`** — `res.json().catch(() => null)` 1회 후 domain `ok`/`data` |
| `src/components/cases/document-paragraph-panel.tsx` | `.../paragraph-panel` · `.../draft/history` · `.../history/[id]/diff` | **`requireOkData`** — 패널 payload·`items`·`diffLines` |
| `src/components/cases/document-paragraph-version-panel.tsx` | `GET/POST .../paragraph-versions` · `POST .../[versionGroupId]/restore` | **`requireOkData`** — 목록/스냅샷/복원(본문은 목록 갱신·리로드만) |
| `src/components/cases/document-paragraph-editor-panel.tsx` | `GET/PUT .../paragraphs` · `PATCH .../approval-review` | **`requireOkData`** |

**검증:** `npx tsc --noEmit` · `npx vitest run` (68/68) — `IMPLEMENTATION_EVIDENCE.md` **[EVIDENCE-20260423-268]**.

**잔여:** post-[278] **V1** 기준 C·D — **닫힘**; `document-version-*` 등 **미포함** 컴포넌트는 별도 스캔·신규 코드 시 동일 패턴.

---

## 12. **최종 재스캔** (2026-04-23) — **post-[278] V1 범위·중간 마감 선언**

**스캔 대상(본 문서가 정의한 작업 범위):** **P0~P4**, **슬라이스 1~5**, **§2 클러스터 A~D**에 대응하는 구현(§5·§6·§8·§10·§11 표·§6.4 마감 스캔). *저장소 전체 모든 `fetch`는 여기에 포함되지 않는다* (§1「제외」·슬라이스 경계).

**수행 요지:**

| 점검 | 결과 |
|------|------|
| **계획에 포함된 클라**가 `requireOkData` / `requireOkResponseBody` + 단일 `res.json().catch(→null)`(슬라이스 1~5·증빙 [263]~[268]) | **이행 완료** |
| **의도·문서화 예외** | `document-template-editor` 게시 **422** (§5·§6.3) · `recommended-action-buttons` **409/중복** 선행 `!res.ok` 후 `requireOkResponseBody` (§6.3·§6.4) · `AssigneeUserPicker` **`/api/admin/users/search`** = 평면 `{ users }` (envelope 아님, §6.3·§8) |
| **`json.success` (HTTP API envelope) 잔여** | `src/components` 기준 **슬라이스 7 이후** `isJsonApiSuccess` **로컬 헬퍼 없음** — **§2 E**·**§14.2** |
| **`unwrapDomainApiData`만** 쓰는 클라 (§5~§11·§6.4 고정 경로) | **없음** (문서/검증 파서 `parse-document-verification-response.ts`는 별 축) |
| **중복 오류 메시지 추출** | 성공 경로는 `requireOk*`에 일원화; `readJsonApiErrorMessage`는 catch 보조·409 등 **의도적 분기**에서만 잔여 (§6.2·§6.3과 일치) |

**저장소 내 V1 밖(투명성·후속 후보, 본 V1 “미적용” 아님):**  
**슬라이스 6(3클라)** — **§13 완료** · `paragraph-history-modal`·`paragraph-structure-panel`·`app/(protected)/admin/.../bulk-action-job-list-client`·`case-form`·`escalation-detail-drawer` 등 — **슬라이스 1~5·6에 미포함**이면 **추가 후속**으로 구분.

**선언:** **post-[278] `POST_278_API_CLIENT_ENVELOPE_V1` (V1) 계획 범위는 중간 마감한다.** (동일 날짜 `IMPLEMENTATION_EVIDENCE` **[EVIDENCE-20260423-269]**.)

---

## 13. **V1 밖 후속** — **슬라이스 6 (2026-04-24 완료)** — **사건·문서 3클라**

**이름:** post-[278] V1 **밖** `fetch` 응답 정리 **1차 묶음** (§12 후속).

**관계:** V1(슬라이스 1~5)과 **별도** — 우선순위표(§3) **(V1 밖)** 행. **P5 등 번호는 부여하지 않음**.

| 파일 | `fetch`·API(요약) | 클라이언트 |
|------|-------------------|------------|
| `src/components/cases/case-summary-panel.tsx` | `POST /api/cases/[caseId]/summary/generate` | **`requireOkData`** — `data.summary` · `res.json().catch(→null)` 1회 |
| `src/components/cases/document-version-panel.tsx` | `GET .../versions` · `GET .../diff` · `POST .../snapshot` · `POST .../restore` | **`requireOkData`** — `unwrapDomainApiData`·수동 `ok` 제거 |
| `src/components/cases/document-draft-client.tsx` | `preview` · `regenerate` · `history` · `POST .../draft` (최종 생성) | **`requireOkData`** — domain `ok`/`data` (`preview`·`regenerate`는 `data`가 본문) |

**검증:** `npx tsc --noEmit` · `npx vitest run` (68/68) — `IMPLEMENTATION_EVIDENCE.md` **[EVIDENCE-20260424-271]**. 기획 **[EVIDENCE-20260424-270]**.

**다음 후속(슬라이스 6 비포함):** **§14** 재스캔표 — `paragraph-*`·`case-detail-client`·관리 `app/...` 등 **우선순위·슬라이스 7~** 고정.

---

## 14. **후속 재스캔** (2026-04-25) — 잔여 `fetch`·**슬라이스 7 확정**

**전제:** 슬라이스 1~6 완료(§5~§11, §13). 본 절은 **`src/components/**/*.tsx`**, **`src/app/(protected)/**/*Client*.tsx`**, **`_components/*.tsx`** 를 `await fetch` 기준으로 재스캔한 **요약**이다. (서버 라우트·테스트 `fetch`는 제외.)

**스캔 요지:** `requireOkData` / `requireOkResponseBody` **미import**이거나, **`isJsonApiSuccess`·`unwrapDomainApiData`·`!res.ok`만** 인 경로를 **후보**로 분류. 이미 1~6·§6.4·§8이 정리한 `admin/alerts` 대부분은 **제외**.

### 14.1 우선순위(고정) — **남은 정리 후보**

| 우선 | 묶음 | 대표 파일 | 메모 |
|------|------|-----------|------|
| **1** | 사건 **핵심 셸** | **`case-detail-client.tsx`** | `fetch` 5·`isJsonApiSuccess`·인터뷰 완료·상태·법률문서 승인/잠금 — **범위·회귀 최대** |
| **2** | 문서·문단 **잔여** | `paragraph-history-modal.tsx` · `paragraph-structure-panel.tsx` · `document-verification-client.tsx` · `document-create-modal.tsx` | **슬라이스 8 (2026-04-23) 완료** — `requireOkData` — **[EVIDENCE-20260423-274]** |
| **3** | 사건 **폼·소액션** | `case-form.tsx` · `assignment-form.tsx` · `delete-*-button.tsx` · `timeline-memo-form.tsx` · `end-assignment-button.tsx` · `attachment-download-link.tsx` | **슬라이스 9 (2026-04-23) 완료** — **[EVIDENCE-20260423-275]** |
| **4** | **관리 `app/` 래퍼** | `bulk-action-job-list-client.tsx` · `recover-stale-locks-button.tsx` · `alert-kpi-api-dashboard.tsx` · `cron-retry-button.tsx` | **슬라이스 10 (2026-04-23) 완료** — **[EVIDENCE-20260423-276]** (문서 예시 `run-bulk-queue-pipeline.ts` 는 미존재) |
| **5** | **감사·에스컬** | `OpsQueueMoveAuditPanel.tsx` · `AuditLogDetailPanel.tsx` · `escalation-detail-drawer.tsx` · `audit-log-alert-quick-actions.tsx` | **슬라이스 11 (2026-04-23) 완료** — `requireOkResponseBody` — **[EVIDENCE-20260423-277]** |
| **6** | **auth(별도)** | `src/components/auth/logout-button.tsx` · `src/components/admin/pending-users-table.tsx` | **슬라이스 12 (2026-04-23) 완료** — `requireOkData` — **[EVIDENCE-20260423-279]** |
| **7** | **의도(평면 API)** | `src/components/admin/alerts/assignee-user-picker.tsx` | **슬라이스 12 (2026-04-23) 처리** — §6.3 **팀 합의 전**: 평면 `{ users }`·`requireOk*` **미적용**·클라 주석 — **[EVIDENCE-20260423-279]** |

### 14.2 **슬라이스 대상·상태**

| 슬라이스 | 대상 | 상태 |
|----------|------|------|
| **7** | **`src/components/cases/case-detail-client.tsx` 단독** | **완료 (2026-04-25)** — `fetch` 5·`requireOkData`·`isJsonApiSuccess` 제거 — **[EVIDENCE-20260425-273]** |
| **8** | **14.1 우선 2** 4파일 | **완료 (2026-04-23)** — `requireOkData`·`res.json().catch` — **[EVIDENCE-20260423-274]** |
| **9** | **14.1 우선 3** 8파일(폼·소액션) | **완료 (2026-04-23)** — `requireOkData` / 다운로드 실패 `readJsonApiErrorMessage` — **[EVIDENCE-20260423-275]** |
| **10** | **14.1 우선 4** `app/(protected)/admin/...` 4파일 | **완료 (2026-04-23)** — `requireOkResponseBody` (평면 `{ ok: true, ... }`) — **[EVIDENCE-20260423-276]** |
| **11** | **14.1 우선 5** 감사·에스컬 4파일 | **완료 (2026-04-23)** — `requireOkResponseBody` — **[EVIDENCE-20260423-277]** |
| **12** | **§14.3** 3 + auth — `logout-button`·`pending-users-table`·`assignee-user-picker` | **완료 (2026-04-23)** — 2 = `requireOkData` / 1 = §6.3·평면·주석 — **[EVIDENCE-20260423-279]** |

**재스캔·우선순위 고정:** **[EVIDENCE-20260425-272]**.

### 14.3 **슬라이스 12 착수 전 재스캔** (2026-04-23) — `requireOk*` **미적용** `fetch`만

**범위:** **§14**와 동일 — `src/components/**/*.tsx` · `src/app` 하위 **파일명에 `Client`가 포함된** `.tsx` · `src/app/**/_components/**/*.tsx` (서버 라우트·테스트 `fetch` 제외).

**기준(기계, 슬라이스 12 착수 전):** 파일 본문에 `fetch(` 가 있고, `requireOk*` **이름**이 **없을 것**(주석에 예시를 적으면 1행 조건과 어긋날 수 있음). **최종·마감** 판정은 **§14.4** (주석 제거 후 스캔)를 본다.

| 구분 | 경로 | 비고 |
|------|------|------|
| **슬라이스 12 (완료)** | `src/components/auth/logout-button.tsx` | **`POST /api/auth/logout`** `ok({ message })` → `requireOkData` — **[EVIDENCE-20260423-279]** |
| | `src/components/admin/pending-users-table.tsx` | **`POST .../approval`** `ok({ action })` → `requireOkData` |
| | `src/components/admin/alerts/assignee-user-picker.tsx` | **§6.3** `GET` 평면 `{ users }` — `requireOk*` **미적용**·팀 합의 전; 클라 `users` 배열만 엄밀화 |
| **예외(정책상 `requireOk*` 아님)** | `src/components/cases/attachment-download-link.tsx` | **슬라이스 9** 완료. 성공 응답은 **blob**; JSON envelope 없음. 실패 시에만 `readJsonApiErrorMessage` — **`requireOkData`/`requireOkResponseBody` 비적용이 정상** |

**집계(재스캔 당시):** `requireOk*` **미적용** `fetch` **4**파일 → **슬라이스 12**로 **3**파일 정리(아래) + `attachment-download-link` **예외**는 §14.3.

**슬라이스 12 실착(완료):** **[EVIDENCE-20260423-279]** (재스캔 **[EVIDENCE-20260423-278]**).

### 14.4 **최종 재스캔·post-[278] 후속 중간 마감** (2026-04-23)

**전제:** **슬라이스 12** 반영·**[EVIDENCE-20260423-279]** 이후, **§14** 범위와 동일(`14.3` “범위” 절)에서 잔여를 확정한다.

**도구:** `node tools/scan_post278_s14_fetch.mjs` — `fetch(` 포함·**주석 제거 뒤** `requireOkData`\|`requireOkResponseBody` **부재** 파일 나열(주석 내 예시 문자열 **오탐 방지**).

**결과(기계, 2026-04-23):** **2**파일 — 전원 **의도적 예외** (아래). 그 외 §14 경로·`fetch` 는 `requireOk*` **적용** 또는 본 절·슬라이스 증빙으로 **종료**.

| 경로 | `requireOk*` 미적용 이유 (의도) |
|------|----------------------------------|
| `src/components/cases/attachment-download-link.tsx` | 성공 시 응답 **본문 = blob** (JSON envelope 없음). 실패 시만 JSON → `readJsonApiErrorMessage` — **슬라이스 9**·§14.3 |
| `src/components/admin/alerts/assignee-user-picker.tsx` | `GET /api/admin/users/search` → 평면 `{ users }` (domain `ok()` **없음`). **POST_278 §6.3**·슬라이스 12 — 서버 `ok` 래핑·클라 강제는 **팀 합의** |

**선언:** **post-[278] (문서 `§5~§11`·`§13`·`§14` 후속 범위)** — 클라이언트 `fetch` **응답 판정 일원화** 작업을 **의도적 예외(위 2)**·`readJsonApiErrorMessage` 보조·**§6.3**·blob 경로 **문서**로 **중간 마감**한다. (신규 `fetch`·신규 예외 API는 **§4**·`API_SPEC`·동일 § 절차로 재분류.)

**근거:** `IMPLEMENTATION_EVIDENCE.md` **[EVIDENCE-20260423-280]**.

---

## 15. **응답 envelope 정리 축 — 종료 선언** & **다음 개선 축** (2026-04-23)

**선언:** `POST_278`·**§14.4**가 다룬 **클라이언트 `fetch` 응답 판정**(`requireOkData` / `requireOkResponseBody` / `readJsonApiErrorMessage` / **§6.3**·blob **의도 예외**) **정리 축**은 **본 문서 범위에서 중간 마감**한다. **남은 의도적 예외 2건**은 **§14.4 표**·**§6.3**·슬라이스 **9·12** 증빙에 **문서화된 상태로 유지** — 동일 이슈는 **서버 `ok` 래핑·`API_SPEC` 개정**과 함께 **별도 합의**로만 재개한다.

**이 문서에서 닫는 것 (재개하지 않음):** §1~§14.4·슬라이스 **1~12**·`tools/scan_post278_s14_fetch.mjs` 절차로 **반복 점검** 가능한 **클라 envelope 일관성** 작업.

**다음 개선 축 (본 V1 `POST_278`·동일 제목 `IMPLEMENTATION_EVIDENCE` 절의 직접 대상 아님 — 별도 기획·라벨·증빙 권고):**

| 차기 축 (예시) | 메모 |
|----------------|------|
| **공용 호환층 축소** | 레거시 `unwrap`·이중 래퍼·중복 `readJson* 경로`를 **의도적으로 줄이는** 리팩터 — 클라/서버 **합의**·회귀 범위 큼. |
| **정의서 대비 구현 역점검** | `API_SPEC_V1`·`IO_DATA_DEFINITION`·스크린/도메인 정의와 **런타임**·OpenAPI(있을 경우) **갭** — envelope와 **독립**인 **정합** 과제. |

**전환 근거:** `IMPLEMENTATION_EVIDENCE.md` **[EVIDENCE-20260423-281]**.

---

## 16. **정의서 대비 구현 역점검** — 착수·기준선 문서 (2026-04-23)

**목적:** **§15(envelope 정리 축) 마감**([EVIDENCE-20260423-281]) **이후** 개시하는 **「정의서 대비 구현 역점검」** 축을 **착수**하고, 잠근·준-잠근 **기준문서**와 **현재 구현 축**을 **대조**한 **일치·불일치·정의서 미잠금 선행 구현** 표를 **고정**한다. (거버넌스·기준선 문서 제목의 **§15 축** = 본 절)

**본 문서의 범위 밖(위임):** 세부 화면·API **행 단위** 판정 누적은 기존 [ALIGNMENT_AUDIT_V1.md](./ALIGNMENT_AUDIT_V1.md) 절차·증빙을 따른다.

**기준선(단일 문서):** [SPEC_IMPLEMENTATION_REAUDIT_BASELINE_V1.md](./SPEC_IMPLEMENTATION_REAUDIT_BASELINE_V1.md) — **§3 표**·**공용 호환층 축소 시 기준선** 열.

**행 누적(구체·그룹):** [SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md](./SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md) — R1~R9 **행 ID** + **호환층 축소** **함께** 판정.

**증빙:** `IMPLEMENTATION_EVIDENCE.md` **[EVIDENCE-20260423-282]** · **행** — **[EVIDENCE-20260423-283]** · **R1·R2(§1~§2)** — **[EVIDENCE-20260423-287]** · **R1·R2(§1.3~§2.3)** — **[EVIDENCE-20260423-288]** · **R1·R2(§1.4~§2.4)** — **[EVIDENCE-20260423-289]** · **R1-101+R2-101(A §1.5)** — **[EVIDENCE-20260423-290]** · **R1-102+R2-103(B §1.6)** — **[EVIDENCE-20260423-291]** · **R4(§4)** — **[EVIDENCE-20260423-284]** · **R5(§5)** — **[EVIDENCE-20260423-285]** · **R8(§8)** — **[EVIDENCE-20260423-286]** — **[EVIDENCE-20260423-292]** · **E 우선(§8.5)** — **[EVIDENCE-20260423-293]** · **R8-303** — **[EVIDENCE-20260423-294]** · **R8-302·301·304/305** — **[EVIDENCE-20260423-295]** · **verify Zod** — **[EVIDENCE-20260423-296]** · **E 축 마감** — **[EVIDENCE-20260423-297]** · **역점검 본맥·BASELINE §1.1** .
