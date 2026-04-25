# OPEN-1~OPEN-5 실작업 체크리스트

**기준:** [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **[EVIDENCE-20260421-202]** 이후 흐름 · [PREMISE2_SECTION2_REJUDGEMENT_RUNBOOK.md](./PREMISE2_SECTION2_REJUDGEMENT_RUNBOOK.md) §3.5 · [CASE_LIFECYCLE_TRANSITION_SUMMARY.md](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) §11, §11-1 · [PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md) OPEN 구간

---

## 0. 시작 전 공통 체크

- [ ] [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **[EVIDENCE-20260421-202]** 확인
- [ ] [PREMISE2_SECTION2_REJUDGEMENT_RUNBOOK.md](./PREMISE2_SECTION2_REJUDGEMENT_RUNBOOK.md) **§3.5** 열기
- [ ] [CASE_LIFECYCLE_TRANSITION_SUMMARY.md](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) **§11** 과 **§11-1** 함께 열기
- [ ] [PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md) **OPEN-1 ~ OPEN-5** 구간 열기
- [ ] 이번 작업 목적이 “**전제 2 상향**”이 아니라 “**OPEN 잔여 성격 보강**”임을 다시 확인
- [ ] 새 증빙 블록은 **OPEN 실작업 결과가 실제로 반영된 뒤** 추가

---

## 1. 공통 판정 기준

각 OPEN 행마다 아래 **4칸**을 반드시 점검한다.

| 칸 | 점검 내용 |
| --- | --- |
| **유지 사유** | 왜 아직 OPEN으로 남아 있는가 |
| **해제 조건** | 무엇이 확인되면 이 행을 닫을 수 있는가 |
| **문서 필요** | 정의서/요약표/런북/기준표 중 무엇을 더 보강해야 하는가 |
| **코드 필요** | 서버 / API / UI / 운영·감사 중 실제 확인이 더 필요한 축이 무엇인가 |

**공통 규칙**

- `notes`가 있어도 **4칸이 비면 미해소 유지**
- 문서 설명만으로 닫지 않음
- 실제 코드 근거가 필요한 행은 **코드 필요**를 남김
- 상위 고정 판정표 **§11-1**의 미해소 상태를 **임의로 바꾸지 않음**

---

## 2. OPEN-1 체크리스트

**대상:** `APPROVED` → `CLOSED`

### OPEN-1 실작업용 점검 순서

1. [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **[EVIDENCE-20260421-203]** 확인
2. 본 문서 **§2 OPEN-1** 절을 연 상태에서 아래 세부 체크를 진행한다
3. [CASE_LIFECYCLE_TRANSITION_SUMMARY.md](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) **§11** 및 **§11-1**에서 **OPEN-1** (`APPROVED` → `CLOSED`) 현재 `notes` 확인
4. [PREMISE2_CONTROL_CONNECTION_AUDIT_P1C_CODE_REVIEW_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1C_CODE_REVIEW_RESULT_FILLED.md) 등 **P1-C 실기입 결과**와 대조해 `APPROVED` → `CLOSED` 직행인지, 실제는 `APPROVED` → `DELIVERED` → `CLOSED`인지 확인
5. **유지 사유 / 해제 조건 / 문서 필요 / 코드 필요** 4칸을 현재 문구 기준으로 채우거나 보강
6. 필요하면 종료 관련 **서버·API·UI·타임라인** 근거를 다시 확인
7. **§11**, **§11-1**, [PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md) **OPEN-1** 메모를 같은 기준으로 반영
8. 결과를 새 **`[EVIDENCE-YYYYMMDD-00n]`** 블록으로 `IMPLEMENTATION_EVIDENCE.md`에 추가
9. `npx tsc --noEmit`, `npm run lint`, `npm run verify:canonical-sources` 재실행 후 증빙에 기록

### 1차 확인

- [ ] §11 본표에서 OPEN-1 현재 `notes` 확인
- [ ] §11-1에서 OPEN-1 고정 판정 문구 확인
- [ ] P1-C 결과와 충돌하는지 확인

### 유지 사유

- [ ] 왜 이 행이 아직 OPEN으로 남는지 **한 줄**로 적기
- [ ] `APPROVED` → `CLOSED` 직행이 아니라 실제 구현은 **다른 구조**인지 확인
- [ ] 문서 `notes`가 그 차이를 충분히 설명하는지 확인

### 해제 조건

- [ ] 정의서/요약표 표현이 구현과 일치하면 닫을 수 있는지 / 아니면 구현 추가 확인이 더 필요한지
- [ ] `APPROVED` → `DELIVERED` → `CLOSED` 구조가 문서에 명확히 반영되면 해소 가능한지 적기

### 문서 필요

- [ ] [CASE_LIFECYCLE_TRANSITION_SUMMARY.md](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) §11
- [ ] §11-1
- [ ] 필요 시 [PREMISE2_CONTROL_CONNECTION_AUDIT_P1_SYNTHESIS_TABLE.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1_SYNTHESIS_TABLE.md) P1-C 종합 판정표 참조 링크

### 코드 필요

- [ ] **서버:** 종료 전이 구조 확인
- [ ] **API:** 종료 라우트의 상태 요구 확인
- [ ] **UI:** 종결 버튼 노출 상태 확인
- [ ] **운영·감사:** 타임라인 기록 구조 확인

**한 줄 메모:** OPEN-1은 종료 구조가 이미 확인된 P1-C와 **충돌 없이 연결되는지** 중심으로 본다.

**문서 보강 반영:** §11·§11-1·통합 시트 OPEN-1은 **[EVIDENCE-20260421-205]** · [P1-C 실기입](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1C_CODE_REVIEW_RESULT_FILLED.md)([200])와 정합.

---

## 3. OPEN-2 체크리스트

**대상:** `REJECTED` → `CREATED`

### OPEN-2 실작업용 점검 순서

1. [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **[EVIDENCE-20260421-205]** 확인
2. 본 문서 **§3 OPEN-2** 절을 연 상태에서 아래 세부 체크를 진행한다
3. [CASE_LIFECYCLE_TRANSITION_SUMMARY.md](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) **§11** 및 **§11-1**에서 **OPEN-2** (`REJECTED` → `CREATED`) 현재 `notes` 확인
4. **[EVIDENCE-20260421-175]** 정합안 A · [PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_RESULT_FILLED.md) **P1-A 실기입**과 대조해 **직접 재진입**인지, **재접수 설명**인지, **비전이 처리 후보**인지 확인
5. **유지 사유 / 해제 조건 / 문서 필요 / 코드 필요** 4칸을 현재 문구 기준으로 채우거나 보강
6. 필요하면 **`REJECTED` → `CREATED` 실경로** 존재 여부를 **서버 → API → UI** 순서로 다시 확인
7. **§11**, **§11-1**, [PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md) **OPEN-2** 메모를 같은 기준으로 반영
8. 결과를 새 **`[EVIDENCE-YYYYMMDD-00n]`** 블록으로 `IMPLEMENTATION_EVIDENCE.md`에 추가
9. `npx tsc --noEmit`, `npm run lint`, `npm run verify:canonical-sources` 재실행 후 증빙에 기록

### 1차 확인

- [ ] §11 본표에서 OPEN-2 현재 `notes` 확인
- [ ] §11-1에서 OPEN-2 고정 판정 문구 확인
- [ ] **[EVIDENCE-20260421-175]** 정합안 A와 현재 설명이 맞는지 확인

### 유지 사유

- [ ] 직접 재진입인지, 재접수 설명인지, 금지인지 — 아직 왜 열린 상태인지 적기
- [ ] `notes`가 문서 의미 정렬까지만 했는지 확인
- [ ] 실제 제품 통제선 설명이 부족한지 확인

### 해제 조건

- [ ] 직접 재생성 / 재오픈 / 비전이 처리 중 **무엇인지 확정**되면 닫을 수 있는지
- [ ] 서버/API에서 실제 경로가 확인되면 해소 가능한지 적기
- [ ] 문서상 direct re-entry 표현이 정리되면 충분한지 여부 적기

### 문서 필요

- [ ] §11 `notes` 보강 필요 여부
- [ ] §11-1 유지 사유와 해제 조건 문구 보강 필요 여부
- [ ] 필요 시 P1-A와의 연결 메모

### 코드 필요

- [ ] **서버:** `REJECTED` → `CREATED` 실경로 존재 여부
- [ ] **API:** 재생성/재개 관련 라우트 여부
- [ ] **UI:** 재접수/재생성처럼 보이는 액션 여부
- [ ] **운영·감사:** 직접 관련 약하면 — 유지 가능 여부

**한 줄 메모:** OPEN-2는 문서 정합보다 “**직접 재진입을 실제로 어떻게 다루는가**” 확인이 핵심이다.

**문서 보강 반영:** §11·§11-1·통합 시트 OPEN-2는 **[EVIDENCE-20260421-207]** · [175] 정합안 A · [P1-A 실기입](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_RESULT_FILLED.md)([197])와 정합.

---

## 4. OPEN-3 체크리스트

**대상:** `HOLD` → `HOLD`

### OPEN-3 실작업용 점검 순서

1. [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **[EVIDENCE-20260421-209]** 확인(전제 2 잔여·OPEN-4 기준선·직전 증빙 흐름)
2. 본 문서 **§4 OPEN-3** 절을 연 상태에서 아래 세부 체크를 진행한다
3. [CASE_LIFECYCLE_TRANSITION_SUMMARY.md](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) **§11** 및 **§11-1**에서 **OPEN-3** (`HOLD` → `HOLD`) 현재 `notes` 확인
4. `CASE_TRANSITIONS`·`case-action-guard`·`PUT_ON_HOLD` / `RESUME_CASE` 를 대조해 **`HOLD`→`HOLD` 자기 전이가 있는지**, 보류 해제가 **`HOLD`→`IN_INTERVIEW` 단일 목적지인지** 확인
5. **유지 사유 / 해제 조건 / 문서 필요 / 코드 필요** 4칸을 현재 문구 기준으로 채우거나 보강
6. 필요하면 **HOLD** 표시·보류/재개 액션·보류 사유·운영 추적 흐름을 UI·API·서버에서 재확인
7. **§11**, **§11-1**, [PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md) **OPEN-3** 메모를 같은 기준으로 반영
8. 결과를 새 **`[EVIDENCE-YYYYMMDD-00n]`** 블록으로 `IMPLEMENTATION_EVIDENCE.md`에 추가
9. `npx tsc --noEmit`, `npm run lint`, `npm run verify:canonical-sources` 재실행 후 증빙에 기록

### 1차 확인

- [ ] §11 본표에서 OPEN-3 현재 `notes` 확인
- [ ] §11-1에서 OPEN-3 고정 판정 문구 확인

### 유지 사유

- [ ] 상태 유지 행으로 왜 아직 OPEN인지 적기
- [ ] 전이 자체보다 상태 유지/보류 관리 설명이 부족한지 확인

### 해제 조건

- [ ] 보류 상태 유지 의미가 문서와 UI에서 분명하면 닫을 수 있는지
- [ ] 운영상 보류 추적/해제 조건이 문서화되면 충분한지 적기

### 문서 필요

- [ ] 보류 유지 사유 문구 보강 필요 여부
- [ ] 해제 조건을 `notes`나 별도 표로 넣어야 하는지 확인

### 코드 필요

- [ ] **UI:** HOLD 상태 표시/액션 확인
- [ ] **운영·감사:** 보류 사유/추적 가능 여부
- [ ] **API/서버:** 직접 관련이 약하면 — 유지 가능한지 검토

**한 줄 메모:** OPEN-3은 전이 확인보다 **보류 상태 유지와 추적 가능성** 설명이 핵심이다. **문서 보강 반영:** [EVIDENCE-20260421-210] — §11·§11-1·통합 시트·`RESUME_CASE`·`CASE_TRANSITIONS` 교차 참조.

---

## 5. OPEN-4 체크리스트

**대상:** `DELETED` → `CREATED`

### OPEN-4 실작업용 점검 순서

1. [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **[EVIDENCE-20260421-207]** 확인
2. 본 문서 **§5 OPEN-4** 절을 연 상태에서 아래 세부 체크를 진행한다
3. [CASE_LIFECYCLE_TRANSITION_SUMMARY.md](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) **§11** 및 **§11-1**에서 **OPEN-4** (`DELETED` → `CREATED`) 현재 `notes` 확인
4. [CASE_LIFECYCLE_TRANSITION_SUMMARY.md](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) **§6-1** **DENY-8**([PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md) 통합 표)·삭제/복원 관련 문구와 대조해 **직접 생성**인지, **복원**인지, **soft delete 이후 재생성** 해석인지 확인
5. **유지 사유 / 해제 조건 / 문서 필요 / 코드 필요** 4칸을 현재 문구 기준으로 채우거나 보강
6. 필요하면 **삭제·복원·생성** 관련 **서버·API·UI·운영** 흐름을 다시 확인
7. **§11**, **§11-1**, [PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md) **OPEN-4** 메모를 같은 기준으로 반영
8. 결과를 새 **`[EVIDENCE-YYYYMMDD-00n]`** 블록으로 `IMPLEMENTATION_EVIDENCE.md`에 추가
9. `npx tsc --noEmit`, `npm run lint`, `npm run verify:canonical-sources` 재실행 후 증빙에 기록

### 1차 확인

- [ ] §11 본표에서 OPEN-4 현재 `notes` 확인
- [ ] §11-1에서 OPEN-4 고정 판정 문구 확인
- [ ] soft delete/복원 이슈와 연결되는지 확인

### 유지 사유

- [ ] 왜 이 행이 아직 열린 상태인지 적기
- [ ] 복원인지 재생성인지 문서상 불분명한지 확인
- [ ] 삭제 후 직접 생성 금지/허용/우회 경로가 불명확한지 확인

### 해제 조건

- [ ] soft delete와 새 생성 흐름이 분리 확인되면 닫을 수 있는지
- [ ] 복원/재생성 정책이 문서나 코드에서 확정되면 해소 가능한지 적기

### 문서 필요

- [ ] §11 `notes` 보강 여부
- [ ] §6 DENY-8과 상호참조 필요 여부
- [ ] 삭제/복원 관련 정의 문구 연결 필요 여부

### 코드 필요

- [ ] **서버:** 삭제 후 상태 처리 방식
- [ ] **API:** 복원/생성 관련 라우트
- [ ] **UI:** 삭제 후 액션 노출
- [ ] **운영·감사:** 삭제/복원 이력 추적 여부

**한 줄 메모:** OPEN-4는 §6 DENY-8과 **교차**하므로 OPEN 단독이 아니라 **삭제/복원 정책 축**으로 같이 봐야 한다. **문서 보강 반영:** [EVIDENCE-20260421-209] — §11·§11-1·통합 시트·**§6-1 DENY-8** 교차 참조.

---

## 6. OPEN-5 체크리스트

**대상:** 메타

### OPEN-5 실작업용 점검 순서

1. [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **[EVIDENCE-20260421-210]** 확인(직전 OPEN-3·증빙 흐름 기준선)
2. 본 문서 **§6 OPEN-5** 절을 연 상태에서 아래 세부 체크를 진행한다
3. [CASE_LIFECYCLE_TRANSITION_SUMMARY.md](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) **§11** 및 **§11-1**에서 **OPEN-5** (메타·`—`/`—`) 현재 `notes` 확인
4. OPEN-5가 **개별 전이**가 아니라 **재판정 추적선·문서 연결·잔여 관리** 메타 행으로 읽히는지 [PREMISE2_SECTION2_REJUDGEMENT_RUNBOOK.md](./PREMISE2_SECTION2_REJUDGEMENT_RUNBOOK.md)·[PREMISE2_CONTROL_CONNECTION_AUDIT_FIRST_PASS_CRITERIA.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_FIRST_PASS_CRITERIA.md)·[PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET_FIRST_PASS_STATUS_SUMMARY.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET_FIRST_PASS_STATUS_SUMMARY.md)·`IMPLEMENTATION_EVIDENCE.md` 최신 블록과 대조
5. **유지 사유 / 해제 조건 / 문서 필요 / 코드 필요** 4칸을 현재 문구 기준으로 채우거나 보강
6. 필요하면 통합 시트·1차 기입 기준·요약본·런북 상단 메타의 **상호참조**를 재확인
7. **§11**, **§11-1**, [PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md) **OPEN-5** 메모를 같은 기준으로 반영
8. 결과를 새 **`[EVIDENCE-YYYYMMDD-00n]`** 블록으로 `IMPLEMENTATION_EVIDENCE.md`에 추가
9. `npx tsc --noEmit`, `npm run lint`, `npm run verify:canonical-sources` 재실행 후 증빙에 기록

### 1차 확인

- [ ] §11 본표에서 OPEN-5 현재 `notes` 확인
- [ ] §11-1에서 OPEN-5 고정 판정 문구 확인

### 유지 사유

- [ ] 왜 메타 행이 아직 OPEN으로 남는지 적기
- [ ] 개별 전이보다 재판정 추적선 자체가 부족한지 확인

### 해제 조건

- [ ] 유지 사유/해제 조건/문서 필요/코드 필요가 다 차면 닫을 수 있는지
- [ ] 전제 2 재판정 루틴과 연결이 완비되면 충분한지 적기

### 문서 필요

- [ ] 런북과의 연결 보강 여부
- [ ] 요약본/감사 시트/증빙 흐름 참조 보강 여부

### 코드 필요

- [ ] 직접 전이보다는 운영·감사 중심인지 확인
- [ ] 나머지 축이 구조상 `—`인지 검토

**한 줄 메모:** OPEN-5는 개별 상태보다 “**재판정 추적선이 충분히 닫혔는가**”를 보는 행이다. **문서 보강 반영:** [EVIDENCE-20260421-211] — §11·§11-1·통합 시트·런북·증빙 흐름.

---

## 7. OPEN 5행 결과 표

| 행 | 유지 사유 점검 | 해제 조건 점검 | 문서 필요 점검 | 코드 필요 점검 | 현재 메모 갱신 여부 |
| --- | :---: | :---: | :---: | :---: | :---: |
| OPEN-1 | [ ] | [ ] | [ ] | [ ] | [ ] |
| OPEN-2 | [ ] | [ ] | [ ] | [ ] | [ ] |
| OPEN-3 | [ ] | [ ] | [ ] | [ ] | [ ] |
| OPEN-4 | [ ] | [ ] | [ ] | [ ] | [ ] |
| OPEN-5 | [ ] | [ ] | [ ] | [ ] | [ ] |

---

## 8. 반영 위치 체크

- [ ] [CASE_LIFECYCLE_TRANSITION_SUMMARY.md](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) §11
- [ ] [CASE_LIFECYCLE_TRANSITION_SUMMARY.md](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) §11-1
- [ ] [PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md) OPEN 구간
- [ ] 필요 시 [PREMISE2_CONTROL_CONNECTION_AUDIT_OPEN_FIRST_PASS_DRAFT.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_OPEN_FIRST_PASS_DRAFT.md) (OPEN 1차 기입 초안)
- [ ] 완료 후 [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) 새 증빙 블록

---

## 9. 가장 짧은 실행 순서

**`[202]` 확인** → **§11 / §11-1 열기** → **OPEN-1~5 4칸 점검** → **빈칸 보강** → **시트/본문 반영** → **새 증빙 추가**
