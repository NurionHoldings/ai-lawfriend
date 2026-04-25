# 정의서 대비 구현 역점검 — 착수 기준선 (§15 축)

## 문서 정보

| 항목 | 내용 |
|------|------|
| 문서 ID | AIBEOPCHIN-SPEC-IMPL-REAUDIT-BASELINE-V1 |
| 상태 | 착수 스냅샷 (2026-04-23) |
| 선행 | [POST_278_API_CLIENT_ENVELOPE_V1.md](./POST_278_API_CLIENT_ENVELOPE_V1.md) **§15** (envelope 축 마감·차기 전환 **[EVIDENCE-20260423-281]**) |
| 관계 | 기존 [ALIGNMENT_AUDIT_V1.md](./ALIGNMENT_AUDIT_V1.md) **판정 상태**·**기준 문서** 목록과 **호환** — 본 문서는 **§15 2번 축** 착수용 **구현 대비 스냅샷**이다. |
| 다음 축 | **(1) 정의서 대비 구현 역점검 본맥** ([EVIDENCE-20260423-297](./IMPLEMENTATION_EVIDENCE.md)) — BASELINE **§1·§3**, [SPEC R1~R9 행](./SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md), [ALIGNMENT §2·§6](./ALIGNMENT_AUDIT_V1.md)로 **일치·불일치·선행 구현·잠금 필요** 누적. **(2) 이후** C(R6) `users/search` — **A**안(평면) [EVIDENCE-20260423-306](./IMPLEMENTATION_EVIDENCE.md) **·** B안(선). **공용 호환층 축소** — 본 표 **「공용 호환층 축소 시 기준선」** 열·E(R8) 마감 ([EVIDENCE-20260423-296](./IMPLEMENTATION_EVIDENCE.md))·[ROWS §8.6](./SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md)과 병행. |

---

## 1. 잠근·준-잠근 기준문서 (ALIGNMENT·거버넌스)

| 구분 | 문서 | 비고 |
|------|------|------|
| **API·데이터** | [API_SPEC_V1.md](./API_SPEC_V1.md) | Draft v1 — §2~3 **응답 키**·`success` 문구와 런타임 **불일치** 가능 (아래 표) |
| | [IO_DATA_DEFINITION.md](./IO_DATA_DEFINITION.md) | 입·출력 정의 — 역점검 시 필드·경로 대조 |
| | [CASE_STATUS_DEFINITION.md](./CASE_STATUS_DEFINITION.md) / [CASE_LIFECYCLE_DEFINITION.md](./CASE_LIFECYCLE_DEFINITION.md) | 사건 — `CaseStatus` 단일 기준·전이 |
| | [PERMISSION_DEFINITION.md](./PERMISSION_DEFINITION.md) | 권한·역할 |
| | [SCREEN_PRIORITY_TABLE.md](./SCREEN_PRIORITY_TABLE.md) | 화면·API 범위 |
| **도메인** | [QUESTION_SET_DEFINITION.md](./QUESTION_SET_DEFINITION.md) · [DOCUMENT_TEMPLATE_DEFINITION.md](./DOCUMENT_TEMPLATE_DEFINITION.md) · [AI_OUTPUT_POLICY.md](./AI_OUTPUT_POLICY.md) 등 | ALIGNMENT 목록과 동일 |
| **기계 파일** | `prisma/schema.prisma` · `src/lib/definitions/case-status.ts` | [API_SPEC_V1](./API_SPEC_V1.md) §2-1·ALIGNMENT **기준 파일** |
| **검증** | `npm run verify:canonical-sources` · `python tools/aibeopchin_navigator.py check-status` | 정의서·스키마 **정합** (ALIGNMENT 원칙) |

> **「정의서 미잠금 선행 구현」:** 명세·정의가 **Draft**이거나 **API_SPEC**과 코드 표준이 **아직 합의되지 않은** 상태에서 먼저 들어간 구현. 역점검에서는 **문서 쪽을 먼저 잠그거나** 구현·문서 **중 하나를 기준으로** 수렴 결정이 필요하다.

### 1.1 역점검 본맥 누적 (차기 착수)

([EVIDENCE-20260423-297](./IMPLEMENTATION_EVIDENCE.md))에 따라 **C(R6)보다 앞서** 아래를 한 세트로 누적한다.

| 누적 단위 | 참조 |
|-----------|------|
| 잠근·준-잠근 **기준문서** 목록 | 위 **§1** 표 |
| **R1~R9** ID별 요약·공용 호환층 **기준선** | 아래 **§3** |
| **행·역점검·호환층 축소** (구체 API·파일) | [SPEC R1~R9 행](./SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md) — `역점검`·`호환층 축소` 열 |
| **용어** (일치·부분일치·불일치·누락·선행구현·판정보류) | [ALIGNMENT §2](./ALIGNMENT_AUDIT_V1.md) |
| **R9·전역** (ALIGNMENT 본맥) | [ALIGNMENT §6](./ALIGNMENT_AUDIT_V1.md) — SPEC 행과 `→ ALIGNMENT: …` **교차** |

**판정 유형(누적 시 표기):** **일치** / **불일치** / **선행 구현** / **잠금 필요** (필요 시 §3·ROWS와 동일 셀에 병기).

---

## 2. 현재 구현 축 (요약)

| 축 | 대표 | 설명 |
|----|------|------|
| **A. Domain envelope** | `@/lib/domain-api-response` — `ok(data)` / `fail()` / `toErrorResponse` | JSON 성공: `{ ok: true, data }`, 실패: `{ ok: false, message, … }` — **post-[278] 클라** `requireOkData`·`readJsonApiErrorMessage` 정렬 |
| **B. 관리/일부 admin 평면** | `NextResponse.json({ ok: true, …필드 })` ( `data` 없이 top-level ) | `requireOkResponseBody` 클라 — [POST_278](./POST_278_API_CLIENT_ENVELOPE_V1.md) **§6.x·슬라이스 10~11** |
| **C. 의도적 비 envelope JSON** | `GET /api/admin/users/search` → `{ users }` | [POST_278](./POST_278_API_CLIENT_ENVELOPE_V1.md) **§6.3**·슬라이스 12·[ROWS §0·C(R6) A안](./SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#c6-userssearch-예외군--a안-잠금) — [EVIDENCE-20260423-306](./IMPLEMENTATION_EVIDENCE.md) |
| **D. 비 JSON 성공** | 첨부 다운로드 등 `Response`(blob) | [POST_278](./POST_278_API_CLIENT_ENVELOPE_V1.md) **§14.4** 예외 |
| **E. 클라 공용 호환** | `readJsonApiErrorMessage` · `assert…`·`documentVerificationResultSchema` (Zod) | verify `data`: 서비스 `parse` = 클라 `safeParse` [EVIDENCE-20260423-294]·[EVIDENCE-20260423-295] |

---

## 3. 대조 표 (일치 / 불일치 / 선행구현 / 기준선)

| ID | 점검 항목 | 잠근·참조 정의 | 현재 구현 축 | 판정 | 비고 | **공용 호환층 축소 시 기준선** |
|----|-----------|----------------|-------------|------|------|--------------------------------|
| R1 | API 성공 키·래핑 | [API_SPEC_V1](./API_SPEC_V1.md) **§2-4, §3** — `success: true` + `data` | **A** — `ok: true` + `data` (`ok()`), 클라 `requireOk*` | **불일치 (명세 vs 코드)** | **문서**는 `success` **코드**는 `ok` — post-278 **클라**는 `ok` 기준 **마감** | **(1)** `API_SPEC` **개정**(`ok` 공표) **또는** **(2)** “구현 표준 = domain `ok`” **부록** — 이후 `success` 문자열 **잔재 제거** 시 호환층·이중 설명 **축소** |
| R2 | API 실패 형식 | [API_SPEC_V1](./API_SPEC_V1.md) **§3-2** — `error: { code, message, details }` | `fail(message, status, { code, details? })` + `readJsonApiErrorMessage` | **부분일치** | `error` **객체** vs **top-level** `message`+`code` | 오류 **수신**은 이미 `readJsonApiErrorMessage`로 **수렴**; **서버**를 명세形에 맞출지·문서를 바꿀지 **한 방향** 정하면 **중복 파싱**·래퍼 **축소** 가능 |
| R3 | 사건 `CaseStatus` | 정의서 + `schema` + `case-status.ts` | 동일 | **일치 (의도)** | `verify:canonical-sources`·[CASE_STATUS_DEFINITION](./CASE_STATUS_DEFINITION.md) | 호환층 **해당 없음** — **유지** |
| R4 | Domain 라우트 다수 | IO·API_SPEC 경로 | **A** `ok(data)` | **일치(프로젝트 표준)** | 사건·문서·인증 등 핵심 | **기준**으로 삼고 **B**·**C** **수**를 줄이는 쪽이 축소에 유리 |
| R5 | 관리 API 평면 `{ ok, fields… }` | [API_SPEC_V1](./API_SPEC_V1.md)는 `data` 래핑 서술 | **B** | **불일치/이중 패턴** | 클라 `requireOkResponseBody` | **(선택1)** 서버 `ok(merged)` **일원화** **(선택2)** 명세에 **“평면 확장”** 명시 — 합의 후 **클라 분기( Data vs ResponseBody )** **단순화** |
| R6 | `GET …/users/search` | [API_SPEC_V1](./API_SPEC_V1.md) 공통 § / IO | **C** `{ users }` | **정의서 미잠금 선행 구현** (§6.3) | assignee `requireOk*` **미적용**·[ROWS A안](./SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#c6-userssearch-예외군--a안-잠금) | **A**안(평면) [EVIDENCE-20260423-306](./IMPLEMENTATION_EVIDENCE.md) 우선; **B**안 = 서버 `ok({ users })`·명세 잠금 후 `requireOkData`·unwrap 제거 검토(선) |
| R7 | 첨부 다운로드 | IO·바이너리 | **D** | **일치(의도 예외)** | blob / 실패 JSON | **의도 유지** — envelope **강제 불필요** |
| R8 | `unwrapDomainApiData` + 파서 | (명세에 흔적 없음) | **E** | **부분일치/기술부채** | delivery·verify 등 **envelope+평면** 병용 | **R1·R2·R5·R6** 수렴 뒤 **호출부 감소**·삭제·단일 `requireOkData` **이관** — **감쇠 순서**는 본 **ID** |
| R9 | [ALIGNMENT_AUDIT_V1](./ALIGNMENT_AUDIT_V1.md) **전 항목** | 기준문서 | 구현 | **(별도 셀)** | 본 착수는 **스냅샷** — 세부·화면별 **판정**은 **ALIGNMENT 절차** + 증빙 | **파일별 재정렬**·**갭**은 ALIGNMENT **8절~**·**EVIDENCE**에 **누적** |

---

## 4. 다음 단계 (공용 호환층 축소)

1. **본 표 ID 순**·우선 **R1·R5·R6** (명세·서버·클라 **용어·형식** 수렴) **합의**  
2. **E축** (`unwrap`·이중 `readJson*`) **호출맵** 작성 후 **R8** 감쇠  
3. [POST_278](./POST_278_API_CLIENT_ENVELOPE_V1.md) **§6.3**·[IMPLEMENTATION_EVIDENCE](./IMPLEMENTATION_EVIDENCE.md) **EVIDENCE**·본 문서·**ALIGNMENT** **상호참조** 유지

---

## 5. 증빙

- `docs/project-governance/IMPLEMENTATION_EVIDENCE.md` — **[EVIDENCE-20260423-282]** · **283** — **[EVIDENCE-20260423-283]** · **R1·R2(§1~§2)** — **[EVIDENCE-20260423-287]** · **R1·R2(§1.3~§2.3)** — **[EVIDENCE-20260423-288]** · **R1·R2(§1.4~§2.4)** — **[EVIDENCE-20260423-289]** · **R1-101+R2-101(A §1.5)** — **[EVIDENCE-20260423-290]** · **R1-102+R2-103(B §1.6)** — **[EVIDENCE-20260423-291]** · **R4** — **[EVIDENCE-20260423-284]** · **R5** — **[EVIDENCE-20260423-285]** · **R8** — **[EVIDENCE-20260423-286]** — **[EVIDENCE-20260423-292]** · **E 우선(§8.5)** — **[EVIDENCE-20260423-293]** · **R8-303** — **[EVIDENCE-20260423-294]** · **R8-302·301·304/305** — **[EVIDENCE-20260423-295]** · **verify Zod** — **[EVIDENCE-20260423-296]** · **E 축 마감** — **[EVIDENCE-20260423-297]** · **역점검 본맥·§1.1**
- [POST_278_API_CLIENT_ENVELOPE_V1.md](./POST_278_API_CLIENT_ENVELOPE_V1.md) **§16**

## 6. 행 단위 누적 (R1~R9)

**R1~R9** 를 **행(구체 API·파일·그룹)** 으로 풀어 **역점검**·**호환층 축소** **함께** 적는 표는 [SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md](./SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md) — **§0**([EVIDENCE-20260423-297](./IMPLEMENTATION_EVIDENCE.md))·본 **§3**·각 **R-ID** 1:1. **R4(세분)** [§4.1~§4.3](./SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md) — **A** `requireOkData` ↔ `ok()` **0불일치**·**R8** **판정**. **R5(세분)** [§5.1~§5.4](./SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md) — **B** **평면**·**`requireOkResponseBody`**·**EXC**·**R5-201~253**. **R8(세분)** [§8.1~§8.6](./SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md) — **`unwrap`·delivery·verify**·**R8-301~307**·**감쇠 권장 순(§8.4)**·**실행 준비(§8.5·[EVIDENCE-20260423-292])**·**E 마감(§8.6·[EVIDENCE-20260423-296])**. **R9(ALIGNMENT 전역)** 는 [ALIGNMENT_AUDIT_V1.md](./ALIGNMENT_AUDIT_V1.md) **§6** **교차** 유지.
