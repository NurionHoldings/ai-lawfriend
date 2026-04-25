# §6 DENY 행별 보강 초안 형식

| 항목 | 내용 |
|------|------|
| 상위 판정표 | [CASE_LIFECYCLE_TRANSITION_SUMMARY.md](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) **§6 본표** · **§6-1** ([EVIDENCE-20260421-185]) |
| 통합 역점검표 | [PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md) §6 DENY 8행 |
| 1차 기입 초안 | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_FIRST_PASS_DRAFT.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_FIRST_PASS_DRAFT.md) — [EVIDENCE-20260421-190] |
| §6 DENY-1~7 묶음(1차 사이클) | [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **[EVIDENCE-20260421-226]** — 행별 실기입·문서 축 확정 / 4축·DENY-8·OPEN-4 후속 |
| 관련 OPEN | §11 **OPEN-4**·**§6-1 DENY-8** 교차 — [209]·[227]·[228]·**[229]**·§1 **[230]**·§2 **[231]**·§3 **[232]**·§4 **[233]**·§5 **[234]**·§6 **[235]**·§7 **[236]**·**[237]**·**[238]** [체크리스트](./PREMISE2_CONTROL_CONNECTION_AUDIT_DELETED_TRANSITION_REVIEW_CHECKLIST.md) |
| DENY-1 4축 점검 순서 | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_FILL_STEPS.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_FILL_STEPS.md) |
| DENY-1 점검 결과 기입 | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_RESULT_TEMPLATE.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_RESULT_TEMPLATE.md) |
| DENY-1 실기입(2026-04-21) | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_RESULT_FILLED.md) — [EVIDENCE-20260421-213] |
| DENY-2 실기입(2026-04-21) | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY2_FOUR_AXIS_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY2_FOUR_AXIS_RESULT_FILLED.md) — [EVIDENCE-20260421-220] |
| DENY-3 실기입(2026-04-21) | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY3_FOUR_AXIS_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY3_FOUR_AXIS_RESULT_FILLED.md) — [EVIDENCE-20260421-221] |
| DENY-4 실기입(2026-04-21) | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY4_FOUR_AXIS_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY4_FOUR_AXIS_RESULT_FILLED.md) — [EVIDENCE-20260421-222] |
| DENY-5 실기입(2026-04-21) | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY5_FOUR_AXIS_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY5_FOUR_AXIS_RESULT_FILLED.md) — [EVIDENCE-20260421-223] |
| DENY-6 실기입(2026-04-21) | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY6_FOUR_AXIS_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY6_FOUR_AXIS_RESULT_FILLED.md) — [EVIDENCE-20260421-224] |
| DENY-7 실기입(2026-04-21) | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY7_FOUR_AXIS_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY7_FOUR_AXIS_RESULT_FILLED.md) — [EVIDENCE-20260421-225] |
| DENY-2 4축 점검 순서 | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY2_FOUR_AXIS_FILL_STEPS.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY2_FOUR_AXIS_FILL_STEPS.md) — [EVIDENCE-20260421-214] |
| DENY-3 4축 점검 순서 | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY3_FOUR_AXIS_FILL_STEPS.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY3_FOUR_AXIS_FILL_STEPS.md) — [EVIDENCE-20260421-215] |
| DENY-4 4축 점검 순서 | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY4_FOUR_AXIS_FILL_STEPS.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY4_FOUR_AXIS_FILL_STEPS.md) — [EVIDENCE-20260421-216] |
| DENY-5 4축 점검 순서 | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY5_FOUR_AXIS_FILL_STEPS.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY5_FOUR_AXIS_FILL_STEPS.md) — [EVIDENCE-20260421-217] |
| DENY-6 4축 점검 순서 | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY6_FOUR_AXIS_FILL_STEPS.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY6_FOUR_AXIS_FILL_STEPS.md) — [EVIDENCE-20260421-218] |
| DENY-7 4축 점검 순서 | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY7_FOUR_AXIS_FILL_STEPS.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY7_FOUR_AXIS_FILL_STEPS.md) — [EVIDENCE-20260421-219] |

---

## 공통 작성 원칙

- 이 절은 **전제 2 상향 선언문이 아니라**, DENY 각 행의 **정책상 금지 / 구현 차단 / 운영 통제 / 감사 가능성**을 분리해 적층하는 **실작업 초안**으로 쓴다.
- 상태 관련 판정은 **canonical source**와 `npm run verify:canonical-sources` 통과를 전제로 하며, `check-status`는 **보조 참고**로만 둔다 ([IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) §공통 규칙 4-1).
- 각 행은 아래 **8개 블록**으로 고정한다.

---

## DENY-N 초안 템플릿

### 1) 대상 행

- **행 번호:** DENY-N
- **대상 전이:** (FROM_STATE → TO_STATE)
- **현재 분류:** 정책상 금지 / 구현 차단 / 운영상 보완 필요 / 감사 미확정 중 **택1 또는 복수**

### 2) 작업 목적

§6 본표와 §6-1의 DENY-N을 기준으로,

- 왜 이 전이가 **금지**로 남아 있는지,
- 코드에서 **직접 차단**되는지,
- UI / API / 운영 문서가 **같은 방향으로 잠겨** 있는지,
- 전제 2 재판정에 **어떤 의미**를 갖는지

를 **행 단위**로 보강한다.

### 3) 4칸 점검 결과

- **유지 사유:** 이 행이 아직 DENY로 유지되어야 하는 이유를 **한 문단**으로 적는다.
- **해제 조건:** 어떤 조건이 충족되면 이 DENY 설명 축을 **해소 검토**할 수 있는지 적는다.
- **문서 필요:** §6 본표 / §6-1 / 통합 시트 / 런북 / 체크리스트 중 **어디와 연결**되어야 하는지 적는다.
- **코드 필요:** 코드 직접 근거가 있는지, 아니면 문서·운영 축만 먼저 잠근 상태인지 적는다.

### 4) 통제 연결 4축

| 축 | 기입 |
|----|------|
| 서버 | ☐ / ☑ / — |
| API | ☐ / ☑ / — |
| UI | ☐ / ☑ / — |
| 운영·감사 | ☐ / ☑ / — |

**기입 규칙**

- **☑:** 현재 근거 확인됨
- **☐:** 아직 보강 필요
- **—:** 이 행에서는 직접 축이 아님

### 5) 실무 한 줄

예시 형식:

- 직접 전이 없음. 서버 전이표와 UI 액션 모두 차단 방향.
- 문서상 금지이나 API 직접 차단 근거는 추가 확인 필요.
- 삭제/복원/재생성 해석 충돌 방지를 위해 설명 축으로 유지.

### 6) 근거 메모

직접 전이가 없는지, 우회 갱신 가능성이 있는지, UI에서 버튼이 숨겨지는지, 운영상 예외 처리 흐름이 있는지, 감사 로그가 남는지/안 남는지를 **3~5줄** 정도로 적는다.

### 7) 남은 이슈

- `impl_ref` 공백인지
- 코드 직접 근거 미확인인지
- 문서와 구현의 해석 차이가 남아 있는지
- P1 / OPEN 항목과 교차 정합이 필요한지

### 8) 다음 작업

「§6-1 메모 보강」「통합 시트 반영」「새 evidence 블록 추가」「전제 2 재판정 시 본 행 반영」 중 **해당 후속**을 적는다.

---

## §6 DENY 행별 보강 초안 뼈대

아래 `(from → to)` 는 [CASE_LIFECYCLE_TRANSITION_SUMMARY.md](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) **§6-1** 고정 판정표와 동일하다.

### DENY-1

#### 1) 대상 행

- **행 번호:** DENY-1
- **대상 전이:** `CREATED` → `APPROVED` — §6-1 고정 판정표와 동일
- **현재 분류:** 절차 누락 방지형 / 단계 건너뜀 금지형

#### 2) 작업 목적

§6 본표 및 §6-1 기준으로 `CREATED` → `APPROVED` 금지 의미를 행 단위로 보강한다.

문서 축 고정은 이미 잠겨 있으므로, 본 초안에서는 서버·API·UI·운영 중 **어떤 축으로** 금지 위반 노출·실행 불가를 입증할지 실작업용 문장 구조를 마련한다.

**4축 근거 채움 점검 순서:** [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_FILL_STEPS.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_FILL_STEPS.md)

**실점검 기록(2026-04-21, 에테르니언):** [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_RESULT_FILLED.md) — [EVIDENCE-20260421-213]. 문서 축 일치·4축 ☐ 유지(점검 범위: 업로드 자료 기준).

#### 3) 4칸 점검 결과

- **유지 사유:** 절차 누락 방지. 본 행은 요약표 §6 및 [CASE_LIFECYCLE_DEFINITION.md](./CASE_LIFECYCLE_DEFINITION.md) §6과 정합하는 금지 전이로, 생성 직후 승인으로 건너뛰는 흐름을 막는다는 문서 의미가 이미 고정되어 있다.
- **해제 조건:** UI·API·서버·운영 중 **최소 1축**에서 금지 위반이 노출·실행 불가함을 입증하면 역점검 완료로 본다. 문서 축 자체는 이미 잠겨 있으므로, 본 행의 해소는 **통제 연결 입증 여부**에 달려 있다.
- **문서 필요:** 본 §6-1로 충분. 추가 문구는 역점검 결과가 생길 때만 보강한다.
- **코드 필요:** 필요. 직접 전이 차단이 서버/가드/API/운영 중 어디에서 드러나는지 확인 후 4축을 채운다.

#### 4) 통제 연결 4축

- **서버:** ☐
- **API:** ☐
- **UI:** ☐
- **운영·감사:** ☐

#### 5) 실무 한 줄

`CREATED` → `APPROVED`는 절차 누락 방지형 DENY로 문서상 잠겨 있으며, 현재는 통제 연결 실근거 확인 전 단계다.

#### 6) 근거 메모

- §6 본표와 §6-1에서 DENY-1은 `CREATED` → `APPROVED`, 유지 사유는 절차 누락 방지로 일치한다. ([213] 문서 축 재확인)
- §6 DENY 8행은 impl_ref 공백 상태의 간접 검증 과제로 분류돼 있으며, UI/API/서버/운영 중 최소 1축 통제 근거가 필요하다.
- 현재 업로드 파일만으로는 UI/API/운영 실코드·실문서가 없어 4축은 모두 ☐로 유지한다. ([213] 실점검 범위)

#### 7) 남은 이슈

- UI 액션 비노출 여부 확인 필요
- 상태 변경 API / 전이 유틸 실행 경로 확인 필요
- 운영·감사 규칙 직접 문구 확인 필요

#### 8) 다음 작업

- 사건 UI / API / 전이 유틸 실파일 기준으로 DENY-1 4축 근거 재확인
- 최소 1축 이상 ☑ 확보 후 본 문서·[1차 기입 초안](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_FIRST_PASS_DRAFT.md)·통합 시트 갱신
- 증빙은 `IMPLEMENTATION_EVIDENCE.md`에 `[EVIDENCE-YYYYMMDD-00n]` 누적

---

### DENY-2

#### 1) 대상 행

- **행 번호:** DENY-2
- **대상 전이:** `IN_INTERVIEW` → `APPROVED` — §6-1 고정 판정표와 동일
- **현재 분류:** 단계 건너뜀 금지형

#### 2) 작업 목적

인터뷰 진행 중 상태에서 바로 승인으로 건너뛰는 전이가 왜 금지로 잠겨 있는지, 그리고 그 금지가 제품 통제선으로 어떻게 입증될지를 정리한다.

**4축 근거 채움 점검 순서:** [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY2_FOUR_AXIS_FILL_STEPS.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY2_FOUR_AXIS_FILL_STEPS.md)

**실점검(2026-04-21, 에테르니언):** [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY2_FOUR_AXIS_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY2_FOUR_AXIS_RESULT_FILLED.md) — [EVIDENCE-20260421-220]. 문서 축 일치·4축 ☐ 유지(점검 범위: 업로드 자료 기준).

#### 3) 4칸 점검 결과

- **유지 사유:** 동일 계열의 단계 건너뜀 금지. 인터뷰 단계에서 승인으로 직행하면 문서 작성·검토 절차를 생략하게 되므로 §6 DENY 의미가 유지된다.
- **해제 조건:** UI·API·서버·운영 중 최소 1축에서 금지 위반이 노출·실행 불가함을 입증한다.
- **문서 필요:** 본 §6-1로 충분. 추가 문구는 역점검 결과가 있을 때만 보강한다.
- **코드 필요:** 필요. 인터뷰 화면 액션, 승인 API, 서버 전이 검증, 운영 절차 중 어느 축이 먼저 잠겨 있는지 확인이 필요하다.

#### 4) 통제 연결 4축

- **서버:** ☐
- **API:** ☐
- **UI:** ☐
- **운영·감사:** ☐

#### 5) 실무 한 줄

`IN_INTERVIEW` → `APPROVED`는 단계 건너뜀 금지형 DENY로 문서상 잠겨 있으며, 현재는 통제 연결 실근거 확인 전 단계다.

#### 6) 근거 메모

- §6 본표와 §6-1에서 DENY-2는 `IN_INTERVIEW` → `APPROVED`, 유지 사유는 단계 건너뜀 금지로 일치한다. ([220] 문서 축 재확인)
- §6 DENY 8행은 impl_ref 공백·간접 검증 과제이며, 최소 1축 통제 근거가 필요하다.
- 업로드 파일만으로는 UI·승인 API·전이 유틸·운영 규칙 직접 근거가 없어 4축은 ☐ 유지한다. `check-status`는 서버 축 ☑ 근거가 될 수 없다. ([220] 실점검 범위)

#### 7) 남은 이슈

- `IN_INTERVIEW` 상태에서 승인 액션 UI 노출 여부 확인 필요
- 상태 변경/승인 API의 직접 차단 여부 확인 필요
- 전이 유틸 및 운영·감사 규칙 직접 문구 확인 필요

#### 8) 다음 작업

- 실파일 기준으로 DENY-2 4축 근거 재확인
- 최소 1축 이상 ☑ 확보 후 본 문서·[1차 기입 초안](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_FIRST_PASS_DRAFT.md)·통합 시트 갱신
- 증빙은 **[214]**·**[220]** 흐름에 맞춰 `IMPLEMENTATION_EVIDENCE.md` 누적 · DENY-3는 **[221]**·DENY-4는 **[222]**·DENY-5는 **[223]**·DENY-6는 **[224]**·DENY-7는 **[225]**에 반영 · §6 DENY-1~7 실기입 묶음·DENY-8·OPEN-4 후속

---

### DENY-3

#### 1) 대상 행

- **행 번호:** DENY-3
- **대상 전이:** `INTERVIEW_DONE` → `DELIVERED` — §6-1 고정 판정표와 동일
- **현재 분류:** 승인·문서 절차 누락 금지형

#### 2) 작업 목적

인터뷰 완료 직후 전달로 건너뛰는 흐름을 금지하는 의미를 보강하고, 문서 작성/검토/승인 절차 없이 전달되지 않음을 통제 근거로 연결한다.

**4축 근거 채움 점검 순서:** [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY3_FOUR_AXIS_FILL_STEPS.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY3_FOUR_AXIS_FILL_STEPS.md)

**실점검(2026-04-21, 최인석):** [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY3_FOUR_AXIS_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY3_FOUR_AXIS_RESULT_FILLED.md) — [EVIDENCE-20260421-221]. 문서 축 일치·4축 ☐ 유지(점검 범위: 업로드 자료 기준).

#### 3) 4칸 점검 결과

- **유지 사유:** 승인·문서 절차 없이 전달 금지. `INTERVIEW_DONE` 다음에는 초안 생성 및 후속 검토가 있어야 하므로, 전달로 직행하는 흐름은 금지 의미가 명확하다.
- **해제 조건:** UI·API·서버·운영 중 최소 1축에서 전달 직행이 노출·실행 불가함을 입증한다.
- **문서 필요:** 본 §6-1로 충분. 별도 추가 문구는 역점검 결과 이후 반영한다.
- **코드 필요:** 필요. 전달 액션 노출 조건, 전달 API 분기, 서버 전이 검증, 운영 프로세스 중 어떤 축이 실제 통제선인지 확인이 필요하다.

#### 4) 통제 연결 4축

- **서버:** ☐
- **API:** ☐
- **UI:** ☐
- **운영·감사:** ☐

#### 5) 실무 한 줄

`INTERVIEW_DONE` → `DELIVERED`는 승인·문서 절차 없이 전달 금지형 DENY로 문서상 잠겨 있으며, 현재는 통제 연결 실근거 확인 전 단계다.

#### 6) 근거 메모

- §6 본표와 §6-1에서 DENY-3는 `INTERVIEW_DONE` → `DELIVERED`, 유지 사유는 승인·문서 절차 없이 전달 금지로 일치한다. ([221] 문서 축 재확인)
- §6 DENY 8행은 impl_ref 공백·간접 검증 과제이며, 최소 1축 통제 근거가 필요하다.
- 업로드 파일만으로는 전달 UI·전달 API·전달 액션 출발 상태·전이 유틸·운영 규칙 직접 근거가 없어 4축은 ☐ 유지한다. `check-status`는 서버 축 ☑ 근거가 될 수 없다. ([221] 실점검 범위)

#### 7) 남은 이슈

- `INTERVIEW_DONE` 상태에서 전달 액션 UI 노출 여부 확인 필요
- 상태 변경/전달 API의 직접 차단 여부 확인 필요
- `DELIVER_DOCUMENT` 출발 상태 및 전이 유틸 직접 문구 확인 필요
- 운영·감사 규칙 직접 문구 확인 필요

#### 8) 다음 작업

- 실파일 기준으로 DENY-3 4축 근거 재확인
- 최소 1축 이상 ☑ 확보 후 본 문서·[1차 기입 초안](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_FIRST_PASS_DRAFT.md)·통합 시트 갱신
- 증빙은 **[215]**·**[221]** 흐름에 맞춰 `IMPLEMENTATION_EVIDENCE.md` 누적 · DENY-4는 **[222]**·DENY-5는 **[223]**·DENY-6는 **[224]**·DENY-7는 **[225]**에 반영 · §6 DENY-1~7 묶음·DENY-8 후속

---

### DENY-4

#### 1) 대상 행

- **행 번호:** DENY-4
- **대상 전이:** `DRAFTING` → `DELIVERED` — §6-1 고정 판정표와 동일
- **현재 분류:** 승인 누락 전달 금지형

#### 2) 작업 목적

초안 작성 단계에서 바로 전달로 건너뛰는 흐름을 금지하는 의미를 보강하고, 검토·승인 절차 생략이 허용되지 않는다는 통제선을 확인한다.

**4축 근거 채움 점검 순서:** [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY4_FOUR_AXIS_FILL_STEPS.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY4_FOUR_AXIS_FILL_STEPS.md)

**실점검(2026-04-21, 에테르니언):** [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY4_FOUR_AXIS_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY4_FOUR_AXIS_RESULT_FILLED.md) — [EVIDENCE-20260421-222]. 문서 축 일치·4축 ☐ 유지(점검 범위: 업로드 자료 기준).

#### 3) 4칸 점검 결과

- **유지 사유:** 동일. 초안 작성 중 상태에서 전달로 직행하면 검토·승인 절차를 생략하게 되므로 금지 상태를 유지한다.
- **해제 조건:** UI·API·서버·운영 중 최소 1축에서 전달 직행이 노출·실행 불가함을 입증한다.
- **문서 필요:** 본 §6-1로 충분. 역점검 결과가 생기기 전 추가 문구는 필요하지 않다.
- **코드 필요:** 필요. 초안 단계에서 전달 액션 노출 금지, 서버 차단, 운영상 통제 여부를 점검해야 한다.

#### 4) 통제 연결 4축

- **서버:** ☐
- **API:** ☐
- **UI:** ☐
- **운영·감사:** ☐

#### 5) 실무 한 줄

`DRAFTING` → `DELIVERED`는 승인·문서 절차 없이 전달 금지형 DENY로 문서상 잠겨 있으며, 현재는 통제 연결 실근거 확인 전 단계다.

#### 6) 근거 메모

- §6 본표와 §6-1에서 DENY-4는 `DRAFTING` → `DELIVERED`, 유지 사유는 승인·문서 절차 없이 전달 금지로 일치한다(DENY-3와 동일 전달 금지 계열). ([222] 문서 축 재확인)
- §6 DENY 8행은 impl_ref 공백·간접 검증 과제이며, 최소 1축 통제 근거가 필요하다.
- 업로드 파일만으로는 전달 UI·전달 API·전달 액션 출발 상태·전이 유틸·운영 규칙 직접 근거가 없어 4축은 ☐ 유지한다. `check-status`는 서버 축 ☑ 근거가 될 수 없다. ([222] 실점검 범위)

#### 7) 남은 이슈

- `DRAFTING` 상태에서 전달 액션 UI 노출 여부 확인 필요
- 상태 변경/전달 API의 직접 차단 여부 확인 필요
- `DELIVER_DOCUMENT` 출발 상태 및 전이 유틸 직접 문구 확인 필요
- 운영·감사 규칙 직접 문구 확인 필요

#### 8) 다음 작업

- 실파일 기준으로 DENY-4 4축 근거 재확인
- 최소 1축 이상 ☑ 확보 후 본 문서·[1차 기입 초안](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_FIRST_PASS_DRAFT.md)·통합 시트 갱신
- 증빙은 **[216]**·**[222]** 흐름에 맞춰 `IMPLEMENTATION_EVIDENCE.md` 누적 · DENY-5는 **[223]**·DENY-6는 **[224]**·DENY-7는 **[225]**에 반영 · §6 DENY-1~7 묶음·DENY-8 후속

---

### DENY-5

#### 1) 대상 행

- **행 번호:** DENY-5
- **대상 전이:** `REVIEW_PENDING` → `DELIVERED` — §6-1 고정 판정표와 동일
- **현재 분류:** 승인 완료 전 전달 금지형

#### 2) 작업 목적

검토 대기 상태에서 승인 완료 없이 전달하는 흐름을 금지하는 의미를 보강하고, 승인 절차의 필수성을 통제선으로 연결한다.

**4축 근거 채움 점검 순서:** [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY5_FOUR_AXIS_FILL_STEPS.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY5_FOUR_AXIS_FILL_STEPS.md)

**실점검(2026-04-21, 에테르니언):** [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY5_FOUR_AXIS_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY5_FOUR_AXIS_RESULT_FILLED.md) — [EVIDENCE-20260421-223]. 문서 축 일치·4축 ☐ 유지(점검 범위: 업로드 자료 기준).

#### 3) 4칸 점검 결과

- **유지 사유:** 승인 완료 없이 전달 금지. 검토 대기 상태는 아직 승인 전 단계이므로 전달로 직행하는 흐름을 금지하는 문서 의미가 명확하다.
- **해제 조건:** UI·API·서버·운영 중 최소 1축에서 승인 전 전달 직행이 노출·실행 불가함을 입증한다.
- **문서 필요:** 본 §6-1로 충분. 추가 문구는 역점검 결과 이후에만 반영한다.
- **코드 필요:** 필요. 검토 대기 상태에서 전달 액션 노출 여부, API 차단, 서버 전이 검증, 운영 규칙 확인이 필요하다.

#### 4) 통제 연결 4축

- **서버:** ☐
- **API:** ☐
- **UI:** ☐
- **운영·감사:** ☐

#### 5) 실무 한 줄

`REVIEW_PENDING` → `DELIVERED`는 승인 완료 없이 전달 금지형 DENY로 문서상 잠겨 있으며, 현재는 통제 연결 실근거 확인 전 단계다.

#### 6) 근거 메모

- §6 본표와 §6-1에서 DENY-5는 `REVIEW_PENDING` → `DELIVERED`, 유지 사유는 승인 완료 없이 전달 금지로 일치한다. ([223] 문서 축 재확인)
- §6 DENY 8행은 impl_ref 공백·간접 검증 과제이며, 최소 1축 통제 근거가 필요하다. DENY-3·DENY-4와 같은 전달 금지 계열이나 **승인 완료 여부**가 핵심 차이점이다.
- 업로드 파일만으로는 전달 UI·전달 API·전달 액션 출발 상태·전이 유틸·운영 규칙 직접 근거가 없어 4축은 ☐ 유지한다. `check-status`는 서버 축 ☑ 근거가 될 수 없다. ([223] 실점검 범위)

#### 7) 남은 이슈

- `REVIEW_PENDING` 상태에서 전달 액션 UI 노출 여부 확인 필요
- 상태 변경/전달 API의 직접 차단 여부 확인 필요
- `DELIVER_DOCUMENT` 출발 상태 및 전이 유틸 직접 문구 확인 필요
- 운영·감사 규칙 직접 문구 확인 필요

#### 8) 다음 작업

- 실파일 기준으로 DENY-5 4축 근거 재확인
- 최소 1축 이상 ☑ 확보 후 본 문서·[1차 기입 초안](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_FIRST_PASS_DRAFT.md)·통합 시트 갱신
- 증빙은 **[217]**·**[223]** 흐름에 맞춰 `IMPLEMENTATION_EVIDENCE.md` 누적 · DENY-6는 **[224]**·DENY-7는 **[225]**에 반영 · §6 DENY-1~7 묶음·DENY-8 후속

---

### DENY-6

#### 1) 대상 행

- **행 번호:** DENY-6
- **대상 전이:** `APPROVED` → `IN_INTERVIEW` — §6-1 고정 판정표와 동일. §5 재개 축과 구분
- **현재 분류:** 이력 왜곡 방지형 / 재개 축 분리형

#### 2) 작업 목적

승인 완료 상태에서 인터뷰 단계로 직접 되돌아가는 흐름을 금지하는 의미를 보강하고, 재개 축은 §5의 `REOPEN_CASE`와 별도로 정합된다는 점을 분리해 적는다.

**4축 근거 채움 점검 순서:** [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY6_FOUR_AXIS_FILL_STEPS.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY6_FOUR_AXIS_FILL_STEPS.md)

**실점검(2026-04-21, 에테르니언):** [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY6_FOUR_AXIS_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY6_FOUR_AXIS_RESULT_FILLED.md) — [EVIDENCE-20260421-224]. 문서 축 일치·재개 축 구분 유지·4축 ☐ 유지(점검 범위: 업로드 자료 기준).

#### 3) 4칸 점검 결과

- **유지 사유:** 이력 왜곡 방지. [181] 이후 재개 축은 §5·`REOPEN_CASE`로 별도 정합되므로, 승인 후 곧바로 인터뷰로 되돌아가는 흐름을 금지하는 의미가 유지된다.
- **해제 조건:** UI·API·서버·운영 중 최소 1축에서 본 금지 위반이 노출·실행 불가함을 입증한다. 재개가 필요한 경우에도 §5 예외 축과 혼동되지 않도록 별도 근거가 필요하다.
- **문서 필요:** 본 §6-1로 충분. 재개/복귀 정책과 충돌하지 않도록 §5와 교차 참조를 유지한다.
- **코드 필요:** 필요. 승인 이후 인터뷰 복귀 UI, API, 서버 검증 또는 운영상 예외 허용 여부를 점검해야 한다.

#### 4) 통제 연결 4축

- **서버:** ☐
- **API:** ☐
- **UI:** ☐
- **운영·감사:** ☐

#### 5) 실무 한 줄

`APPROVED` → `IN_INTERVIEW`는 이력 왜곡 방지형 DENY로 문서상 잠겨 있으며, 현재는 재개 예외 축과 직접 복귀 금지의 통제 연결 실근거 확인 전 단계다.

#### 6) 근거 메모

- §6 본표와 §6-1에서 DENY-6는 `APPROVED` → `IN_INTERVIEW`, 유지 사유는 이력 왜곡 방지로 일치한다. ([224] 문서 축 재확인)
- §6-1은 재개 축이 §5·`REOPEN_CASE`와 별도 정합된다고 명시하므로, 본 행은 재개 허용 예외와 승인 후 직접 복귀 금지를 구분하는 항목이다.
- 업로드 파일만으로는 재개 UI·재개 API·`REOPEN_CASE` 출발 상태·전이 유틸·운영 규칙 직접 근거가 없어 4축은 ☐ 유지한다. `check-status`는 서버 축 ☑ 근거가 될 수 없다. ([224] 실점검 범위)

#### 7) 남은 이슈

- `APPROVED` 상태에서 인터뷰 복귀/재개 액션 UI 노출 여부 확인 필요
- 상태 변경/재개 API의 직접 차단 여부 확인 필요
- `REOPEN_CASE` 출발 상태 및 전이 유틸 직접 문구 확인 필요
- 운영·감사 규칙 직접 문구 확인 필요

#### 8) 다음 작업

- 실파일 기준으로 DENY-6 4축 근거 재확인(`REOPEN_CASE`·직접 복귀 혼동 방지)
- 최소 1축 이상 ☑ 확보 후 본 문서·[1차 기입 초안](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_FIRST_PASS_DRAFT.md)·통합 시트·§5 문구 정합
- 증빙은 **[218]**·**[224]** 흐름에 맞춰 `IMPLEMENTATION_EVIDENCE.md` 누적 · DENY-7 실기입은 **[225]**에 반영 · §6 DENY-1~7 묶음·DENY-8 후속

---

### DENY-7

#### 1) 대상 행

- **행 번호:** DENY-7
- **대상 전이:** `CLOSED` → `DRAFTING` — §6-1 고정 판정표와 동일. 재개는 `IN_INTERVIEW` 예외 축과 구분
- **현재 분류:** 종결 후 직접 작성 단계 복귀 금지형

#### 2) 작업 목적

종결된 사건이 직접 작성 단계로 되돌아가는 흐름을 금지하는 의미를 보강하고, 재개는 `IN_INTERVIEW` 예외 축과 구분된다는 점을 명확히 한다.

**4축 근거 채움 점검 순서:** [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY7_FOUR_AXIS_FILL_STEPS.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY7_FOUR_AXIS_FILL_STEPS.md)

**실점검(2026-04-21, 에테르니언):** [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY7_FOUR_AXIS_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY7_FOUR_AXIS_RESULT_FILLED.md) — [EVIDENCE-20260421-225]. 문서 축 일치·`IN_INTERVIEW` 예외 재개와 `DRAFTING` 직접 복귀 구분 유지·4축 ☐ 유지(점검 범위: 업로드 자료 기준).

#### 3) 4칸 점검 결과

- **유지 사유:** 종결 후 직접 작성 단계 복귀 금지. [CASE_LIFECYCLE_DEFINITION.md](./CASE_LIFECYCLE_DEFINITION.md) §6 기준으로 종결 이후 재개는 별도 예외 축으로 다뤄야 하며, `CLOSED` → `DRAFTING` 직접 복귀는 금지 의미가 유지된다. `IN_INTERVIEW` 재개 예외와도 구분된다.
- **해제 조건:** UI·API·서버·운영 중 최소 1축에서 종결 후 초안 작성 직행이 노출·실행 불가함을 입증한다.
- **문서 필요:** 본 §6-1로 충분. 재개는 `IN_INTERVIEW` 예외 축이라는 점을 함께 유지한다.
- **코드 필요:** 필요. 종결 후 작성 복귀 UI, API, 서버 검증, 운영상 예외 유무를 점검해야 한다.

#### 4) 통제 연결 4축

- **서버:** ☐
- **API:** ☐
- **UI:** ☐
- **운영·감사:** ☐

#### 5) 실무 한 줄

`CLOSED` → `DRAFTING`는 종결 후 직접 작성 단계 복귀 금지형 DENY로 문서상 잠겨 있으며, 현재는 `IN_INTERVIEW` 예외 재개와 직접 작성 복귀 금지의 통제 연결 실근거 확인 전 단계다.

#### 6) 근거 메모

- §6 본표와 §6-1에서 DENY-7는 `CLOSED` → `DRAFTING`, 유지 사유는 종결 후 직접 작성 단계 복귀 금지로 일치한다. ([225] 문서 축 재확인)
- §6-1은 재개가 `IN_INTERVIEW` 예외 축과 구분된다고 명시하므로, 본 행은 종결 후 재개 허용 예외와 직접 작성 복귀 금지를 구분하는 항목이다.
- 업로드 파일만으로는 재개 UI·재개 API·`REOPEN_CASE` 목적지·전이 유틸·운영 규칙 직접 근거가 없어 4축은 ☐ 유지한다. `check-status`는 서버 축 ☑ 근거가 될 수 없다. ([225] 실점검 범위)

#### 7) 남은 이슈

- `CLOSED` 상태에서 작성 단계 복귀/재개 액션 UI 노출 여부 확인 필요
- 상태 변경/재개 API의 직접 차단 여부 확인 필요
- `REOPEN_CASE` 목적지 및 전이 유틸 직접 문구 확인 필요
- 운영·감사 규칙 직접 문구 확인 필요

#### 8) 다음 작업

- 실파일 기준으로 DENY-7 4축 근거 재확인(`IN_INTERVIEW` 예외·`DRAFTING` 직접 복귀 혼동 방지)
- 최소 1축 이상 ☑ 확보 후 본 문서·[1차 기입 초안](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_FIRST_PASS_DRAFT.md)·통합 시트 갱신
- §6 **DENY-1~7** 실기입 묶음 정리·묶음 evidence·P1/OPEN/DENY 재판정 준비(본 순서표 §9)
- 증빙은 **[219]**·**[225]** 흐름에 맞춰 `IMPLEMENTATION_EVIDENCE.md` 누적 · **DENY-8**은 OPEN-4 교차 축으로 기존 런북·체크리스트 유지

---

## DENY-8 / OPEN-4 교차 정리 (본문 초안)

### 1. 교차 정리 목적

`DELETED` → `CREATED`는 §6-1 **DENY-8**과 §11 **OPEN-4**에서 동시에 다루지만, 두 행은 서로 모순되는 판정이 아니라 **서로 다른 층위의 설명 축**이다. 본 교차 정리의 목적은 다음 두 가지를 동시에 고정하는 데 있다.

- **DENY-8:** 일반 흐름 재진입 금지
- **OPEN-4:** 복원 / 재생성 / soft delete 후 처리 해석 축 추적

즉, `DELETED` → `CREATED`를 **직접 허용 전이로 단정하지 않으면서도**, 삭제 이후 처리 경로를 문서상 계속 추적할 수 있도록 두 행의 역할을 분리해 정렬한다.

### 2. 고정 판정 문안

#### DENY-8

`DELETED` → `CREATED`는 §6-1 기준에서 **일반 흐름 재진입 금지**로 유지한다. 여기서 `CREATED`는 **예시 토큰**이며, 실제 의미는 삭제된 사건이 별도 복구 정책 없이 일반 업무 상태로 재진입하는 전반을 가리킨다. 따라서 본 행은 **직접 허용 전이 부정**과 **통제 연결 필요**를 문서 축으로 잠그는 역할을 가진다.

#### OPEN-4

같은 `DELETED` → `CREATED`는 §11 기준에서 직접 허용 전이 여부를 확정하는 행이 아니라, 삭제 이후 처리 성격이 **복원 / 신규 재생성 / soft delete 후 처리** 중 무엇으로 읽혀야 하는지 추적하는 **설명 축**으로 유지한다. **OPEN-4는 DENY-8을 뒤집는 행이 아니라**, DENY-8과 충돌하지 않는 범위에서 후속 해석을 보수적으로 분리하는 메타 설명 축이다.

### 3. 교차 정리 원칙

- `DELETED` → `CREATED`를 **직접 허용 전이로 단정하지 않는다.**
- 삭제 후 경로는 우선 **복원 / 재생성 / soft delete 후 처리** 설명 축으로 읽는다.
- **DENY-8**은 일반 흐름 재진입 금지를 잠그는 행이다.
- **OPEN-4**는 그 금지와 충돌하지 않는 범위에서 삭제 이후 처리의 해석 여지를 추적하는 행이다.
- 최종 허용·금지 판정은 문서 문구만으로 끝나지 않고, **운영 정책·실구현·통제 근거**와 함께 후속 증빙으로 정리한다.

### 4. 실무용 한 줄 정리

`DELETED` → `CREATED`는 현재 기준에서 **직접 허용 전이 아님**으로 읽고, 문서상으로는 **DENY-8**이 일반 재진입 금지, **OPEN-4**가 복원·재생성·삭제 후 처리 설명 축을 맡는 구조로 유지한다.

---

### DENY-8

#### 1) 대상 행

- **행 번호:** DENY-8
- **대상 전이:** (`DELETED` → 일반 흐름; 요약·§6-1에서는 `CREATED` 예시 토큰 — **OPEN-4와 교차 확인**)
- **현재 분류:** 설명 충돌 방지형 / 직접 허용 전이 단정 금지형

#### 2) 작업 목적

OPEN-4와 충돌하지 않도록 `DELETED` 이후 처리 해석을 **직접 허용 전이**가 아니라 **복원·재생성·soft delete 후 처리** 설명 축으로 분리해 적는다.

**교차 정리에서 DENY-8 측에 고정한 삽입 문안 ([227]):**

- `DELETED` → `CREATED`는 **직접 허용 전이로 단정하지 않는다.**
- 본 행은 삭제된 사건이 별도 복구 정책 없이 일반 흐름으로 재진입하는 것을 금지하는 **문서 축**이다.
- **OPEN-4**는 본 금지와 충돌하지 않도록, 삭제 이후 처리의 성격을 복원 / 재생성 / soft delete 후 처리 설명 축으로 분리해 추적한다.

#### 3) 4칸 점검 결과

- **유지 사유:** 삭제 후 경로를 직접 허용 전이로 단정하면 OPEN-4 보강 방향과 충돌할 수 있으므로 DENY-8 설명 축을 유지한다.
- **해제 조건:** 삭제/복원/재생성의 실제 처리 성격이 문서와 코드에서 단일 해석으로 고정되면 해소 검토 가능.
- **문서 필요:** §6 본표 / §6-1 / OPEN-4 / 통합 시트 / 재판정 런북 교차 반영 필요.
- **코드 필요:** 삭제·복원·재생성 실경로 추가 추적 필요 시 후속 과제로 분리.

#### 4) 통제 연결 4축

- **서버:** ☐
- **API:** ☐
- **UI:** ☐
- **운영·감사:** ☐

#### 5) 실무 한 줄

`DELETED` → `CREATED`는 현재 기준에서 직접 허용 전이 아님으로 읽고, **DENY-8**은 일반 재진입 금지·**OPEN-4**는 복원·재생성·삭제 후 처리 설명 축으로 역할을 분리해 유지한다 ([227]).

#### 6) 근거 메모

- OPEN-4 증빙에서 DENY-8과의 교차 정합이 직접 언급되어 있다.
- 직접 허용 전이 단정은 보수적이지 않다고 이미 적혀 있다.
- 전제 2 재판정은 OPEN과 DENY 보강 이후에만 들어간다.
- **[228]:** `softDeleteCaseService`는 권한 확인 후 `updateCaseById(..., { status: "DELETED" })` 직접 호출로 **진입** 확인. **`case.service.ts` 단일 파일 기준**으로는 **상태별 삭제 제한**·`DELETED` → `CREATED` 직접 복구는 미확인 — [227] 문서 정리와 확인된 범위에서 정합.

#### 7) 남은 이슈

- 삭제/복원/재생성 실경로 추가 코드 추적
- 운영 정책·실구현·4축 통제 근거 확인 ([227] 교차는 문서 역할 분리까지 고정)

#### 8) 다음 작업

- 운영 정책·실구현·통제 근거를 별도 evidence로 누적
- 통합 시트·1차 기입 초안과 실점검 결과 정합

---

## 지금 단계의 결론

**묶음 상태:** **[EVIDENCE-20260421-226]** 에서 §6 **DENY-1~7**의 1차 사이클(점검 순서·`RESULT_FILLED`·본 문서·1차 기입·통합 시트·개별 evidence) 완료와, **문서 축 확정 대비 4축 실근거 미확정** 구분을 고정했다. **DENY-8 / OPEN-4** 교차는 **[EVIDENCE-20260421-227]** 에서 금지 축·설명 축 역할 분리를 문서상 고정했다. **`DELETED` 진입**(`softDeleteCaseService`)·**상태별 삭제 제한·직접 복구** 경계는 **[EVIDENCE-20260421-228]** 에서 스냅샷으로 고정했다. 다음 실무 축은 **삭제 가드·복원·재생성·운영·4축** 실점검이다.

현재 저장소 기준으로 §6 DENY의 **행별 보강 초안 형식**은 위 **8블록 템플릿 + DENY-1~8**로 고정하는 것이 가장 안전하다. 특히 **[EVIDENCE-20260421-190]** 이 이미 DENY 8행 **1차 기입 초안**의 존재를 보여 주므로, 본 문서는 그 1차본을 **실작업용 문서 형식**으로 재정렬한 뒤, **DENY-1~7**에 대해 §6-1 **행별 유지 사유**(절차 누락·단계 건너뜀·전달 직행 금지·재개 축 분리 등)와 맞춘 **통제 연결 중심 문장**을 채운 상태다. 문서 축은 §6-1로 충분한 행과, 역점검 후에만 추가 문구를 보강하는 원칙을 분리해 두었다. **DENY-8**은 OPEN-4와의 교차를 명시한 축으로 유지한다. 행별 4축 ☑/☐ 갱신·evidence 누적은 후속 실코드 확인 후 진행하면 된다. **DENY-1**은 [EVIDENCE-20260421-213]·[실기입](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_RESULT_FILLED.md)에서 §6/§6-1 **문서 축 일치**와 4축 **☐ 유지**(점검 세션 범위)를 고정했다. **DENY-2**는 [EVIDENCE-20260421-220]·[실기입](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY2_FOUR_AXIS_RESULT_FILLED.md)에서 동일하게 **문서 축 일치**·4축 **☐ 유지**(업로드 자료 범위)를 고정했다. **DENY-2**는 [EVIDENCE-20260421-214]·[4축 점검 순서](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY2_FOUR_AXIS_FILL_STEPS.md)로 실작업 절차를 맞춰 두었다. **DENY-3**는 [EVIDENCE-20260421-221]·[실기입](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY3_FOUR_AXIS_RESULT_FILLED.md)에서 동일하게 **문서 축 일치**·4축 **☐ 유지**(업로드 자료 범위)를 고정했다. **DENY-3**는 [EVIDENCE-20260421-215]·[4축 점검 순서](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY3_FOUR_AXIS_FILL_STEPS.md)로 동일 패턴을 맞춰 두었다. **DENY-4**는 [EVIDENCE-20260421-222]·[실기입](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY4_FOUR_AXIS_RESULT_FILLED.md)에서 동일하게 **문서 축 일치**·4축 **☐ 유지**(업로드 자료 범위)를 고정했다. **DENY-4**는 [EVIDENCE-20260421-216]·[4축 점검 순서](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY4_FOUR_AXIS_FILL_STEPS.md)로 전달 금지 계열(작성 중 직행) 점검 절차를 맞춰 두었다. **DENY-5**는 [EVIDENCE-20260421-223]·[실기입](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY5_FOUR_AXIS_RESULT_FILLED.md)에서 동일하게 **문서 축 일치**·4축 **☐ 유지**(업로드 자료 범위)를 고정했다. **DENY-5**는 [EVIDENCE-20260421-217]·[4축 점검 순서](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY5_FOUR_AXIS_FILL_STEPS.md)로 전달 금지 계열(검토 대기·승인 전 직행) 점검 절차를 맞춰 두었다. **DENY-6**는 [EVIDENCE-20260421-224]·[실기입](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY6_FOUR_AXIS_RESULT_FILLED.md)에서 동일하게 **문서 축 일치**·4축 **☐ 유지**(업로드 자료 범위)를 고정했다. **DENY-6**은 [EVIDENCE-20260421-218]·[4축 점검 순서](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY6_FOUR_AXIS_FILL_STEPS.md)로 이력 왜곡 방지·`REOPEN_CASE`와 직접 복귀 구분 점검 절차를 맞춰 두었다. **DENY-7**는 [EVIDENCE-20260421-225]·[실기입](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY7_FOUR_AXIS_RESULT_FILLED.md)에서 동일하게 **문서 축 일치**·4축 **☐ 유지**(업로드 자료 범위)를 고정했다. **DENY-7**은 [EVIDENCE-20260421-219]·[4축 점검 순서](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY7_FOUR_AXIS_FILL_STEPS.md)로 종결 후 작성 단계 직접 복귀 금지·`IN_INTERVIEW` 예외 재개 구분 점검 절차를 맞춰 두었다. **§6 DENY-1~7** 행별 점검 순서표 **추가**는 여기까지로 묶인다(실점검·evidence 누적은 후속). 병행 문서: [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_FIRST_PASS_DRAFT.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_FIRST_PASS_DRAFT.md).
