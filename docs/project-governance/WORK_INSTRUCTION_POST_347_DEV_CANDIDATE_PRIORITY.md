# [347] 이후 실제 개발 착수 후보 우선순위표

## 0. 현재 기준

**정본 앵커:** [IMPLEMENTATION_EVIDENCE.md — `#347-tier3-document-scope-closure-20260426`](IMPLEMENTATION_EVIDENCE.md#347-tier3-document-scope-closure-20260426)

**현재 상태(문서권·거버넌스):**

- [347] 3순 **문서권** 트랙 **마감 완료**
- **A** · ALIGNMENT §6 **문서 클로저** 완료
- **B** · Case/인터뷰 갭 **정리 완료**
- **B-G1** UX PR 완료
- **B-LC05** 기록 정책 정렬 완료
- **C** · GW-0.3 **(A)** 문서·정렬 완료
- `npm run verify:canonical-sources` **exit 0**

**본 작업지시의 목적:**

- 문서권 마감 **이후** **실제 코드** 개발로 가져갈 후보를 정리한다.
- 후보별 **위험도**, **효과**, **의존성**, **`PR` 분리 필요성**을 평가한다.
- **즉시 착수할 1순위 개발 `PR`**을 선정한다.

**증빙 연결:** [IMPLEMENTATION_EVIDENCE.md `#work-instruction-post-347-dev-candidate-priority`](IMPLEMENTATION_EVIDENCE.md#work-instruction-post-347-dev-candidate-priority)

---

## 1. 절대 재오픈 금지

아래 축은 **다시 열지 않는다.** 후보 실착·`PR` 설명에 **이 축을 되살리는 문구·범위 확장**을 넣지 않는다.

| 구분 | 비고 |
|------|------|
| [343]~[350] | 기존 질문셋 완료 축 |
| [347] 3순 문서권 트랙 | `#347-tier3-document-scope-closure-20260426` |
| 353+ | UI 가용 액션 **이중 축** |
| P1 | `RB-01`~`RB-05` |
| IO-05 | — |
| P0 | **첫 코드** 묶음 |
| P0 잔여·P2 | **통합 실착** 묶음 |
| A | ALIGNMENT §6 **문서 클로저** |
| B | Case/인터뷰 갭 **(문서권 범위)** |
| C | GW-0.3 **(A)** 문서·정렬 |

**공통 금지:** `CaseStatus` **canonical** 변경 · `prisma/schema.prisma` / `src/lib/definitions/case-status.ts` **임의 enum 수정** (별도 합의·전용 `EVIDENCE` 없이).

---

## 2. 우선순위 후보표

팀은 아래 표를 **개발 착수 순서**의 기준으로 쓴다. **권장 판정**은 본 작업지시 작성 시점의 **권고**이며, 변경 시 `IMPLEMENTATION_EVIDENCE` 소절에 **한 줄** 남긴다.

| 우선순위 | 후보 ID | 후보명 | 성격 | 코드 필요성 | 기대 효과 | 위험도 | PR 분리 | 권장 판정 |
|:--------:|---------|--------|------|:----------:|-----------|:------:|:--------|-----------|
| **1** | **FILE-1B** | 첨부파일/자료 분류·사건 연결 보강 | 실기능 보강 | 높음 | 사건 자료 관리 완성도 상승 | 중간 | **단독 `PR`** (질문셋·GW-0.3 (가)와 **분리**) | **즉시 1순위 개발 `PR`** |
| 2 | GW-0.3-가 | 질문셋/SPEC 본착수 분기 | 질문셋·SPEC 확장 | 높음 | 다음 런타임 확장 기반 | 높음 | **별** `EVIDENCE` 확정 후 **전용 `PR`** | (가) 착수 — FILE-1B·RUNTIME-QS와 **한 PR 금지** |
| 3 | RUNTIME-QS | 질문셋 런타임 보강 | 런타임 기능 | 높음 | 인터뷰 흐름 고도화 | 높음 | **GW-0.3-가와 묶지 말고 별도** | (가)계열과 **직교** 후보 |
| 4 | DOC-AUDIT-APPROVE | 문서 승인 전용 상태 전이 **감사 행** 추가 여부 | 감사 정책 보강 | 중간 | 감사 추적성 강화 | 중간 | 정책 확정 후 **소규모** | **보류 후보** ([B 잔여 후보](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-b-residual-lc-case-api-ui)와 동일 취지) |
| 5 | CASE-UX-POLISH | 사건 상세/인터뷰 UX 미세 개선 | UI 개선 | 중간 | 사용성 개선 | 낮음~중간 | B축 **재오픈 아님** 전제의 **국소 `PR`** | **여유 시** |
| 6 | OPS-RUNBOOK | 운영 런북·검증 루틴 고도화 | 운영 문서/도구 | 낮음~중간 | 운영 안정성 | 낮음 | 문서/도구 중심 `PR` 가능 | **문서·도구** 우선 가능 |

**상위 맥락:** [WORK_INSTRUCTION_347_TIER3_FOLLOWUP_AXES.md §4](WORK_INSTRUCTION_347_TIER3_FOLLOWUP_AXES.md#4-다음-실착-1순위--팀-선정용-후보표) · [FILE_REALIGN_PATCH_V1.md — Batch 1-B](FILE_REALIGN_PATCH_V1.md#batch-1b-실행) (FILE-1B)

---

## 3. 후보별 판정 기준

### 3-1. FILE-1B — **즉시 1순위 개발 `PR` (팀 확정)**

**착수 이유:**

- 문서권 마감 후 **서비스 완성도**에 가장 직접 연결된다.
- 사건·인터뷰·문서 생성 흐름과 **자연스럽게 이어지되**, 질문셋/SPEC **대규모 재개방** 없이 **독립 `PR`**로 분리하기 쉽다.

**확인할 범위 (실착 전·중 체크리스트):**

- 사건 첨부파일 업로드
- 첨부자료 **분류** 기준(메타데이터·타입·라벨)
- 사건 상세에서 자료 **표시**
- 문서 생성 시 첨부자료 **참조 가능성** (스코프·보안)
- 권한별 파일 **접근 제한**
- 삭제/복구·**감사로그** 여부

**주의:**

- 질문셋 런타임·`RUNTIME-QS`와 **섞지 않는다.**
- `CaseStatus` canonical을 **변경하지 않는다.**
- **B축(문서권)** 을 **다시 열지 않는다** — FILE-1B는 [FOLLOWUP](WORK_INSTRUCTION_347_TIER3_FOLLOWUP_AXES.md)에서 이미 **별 트랙**으로 구분된 잔여다.

**전용 작업지시서:** [[347 이후 1순위] FILE-1B 첨부자료 분류·사건 연결 실착](WORK_INSTRUCTION_POST_347_FILE_1B_ATTACHMENT_CASE_LINK.md) · [IMPLEMENTATION `#work-instruction-post-347-file-1b-attachment-case-link`](IMPLEMENTATION_EVIDENCE.md#work-instruction-post-347-file-1b-attachment-case-link)

---

### 3-2. GW-0.3-가

- **별** `EVIDENCE`에서 범위·(가)/(나) **재판정** 후 착수 ([SPEC GW-0.3](SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#gw-0-3-범위-완료)).
- [348]~[352]·Step3 1·2순·FILE-1B **`PR`와 혼재 금지.**

### 3-3. RUNTIME-QS

- **GW-0.3-가와 동일 `PR` 금지** — 런타임 변경은 **별 명명·별 회귀**가 안전.

### 3-4. DOC-AUDIT-APPROVE

- 제품·감사 정책 **합의 전** 착수하지 않음. 합의 시 **소규모** 감사 행만.

### 3-5. CASE-UX-POLISH

- **CaseStatus·전이 서비스** 변경 없는 **국소 UI**만. B축 “갭 실사 재개”로 읽히지 않게 범위를 **한 줄**로 고정.

### 3-6. OPS-RUNBOOK

- `verify`·`check-status`·배포 체크리스트 등 **문서/스크립트** 중심. 코드 변경이 있어도 **닫힌 축**과 무관해야 함.

---

## 4. 즉시 1순위 개발 `PR` — 팀 확정 기록

| 항목 | 확정 값 (본 작업지시 기준) |
|------|---------------------------|
| **1순위 `PR` 주제** | **FILE-1B** |
| **작업지시서** | [WORK_INSTRUCTION_POST_347_FILE_1B_ATTACHMENT_CASE_LINK.md](WORK_INSTRUCTION_POST_347_FILE_1B_ATTACHMENT_CASE_LINK.md) |
| **`EVIDENCE` 소절** | [IMPLEMENTATION_EVIDENCE.md `#work-instruction-post-347-file-1b-attachment-case-link`](IMPLEMENTATION_EVIDENCE.md#work-instruction-post-347-file-1b-attachment-case-link) (실착 후 판정·파일·검증 기입) |

---

## 5. 검증

| 변경 범위 | 명령 |
|-----------|------|
| 문서만 | `npm run verify:canonical-sources` |
| `src/**` 포함 | `npm run verify:349-12` (및 팀 CI 관례) |

---

## 6. 증빙 앵커

- **본 우선순위표:** [#work-instruction-post-347-dev-candidate-priority](IMPLEMENTATION_EVIDENCE.md#work-instruction-post-347-dev-candidate-priority)
- **FILE-1B 실착:** [#work-instruction-post-347-file-1b-attachment-case-link](IMPLEMENTATION_EVIDENCE.md#work-instruction-post-347-file-1b-attachment-case-link)
