# DENY-2 4축 근거 채움용 점검 순서표

| 항목 | 내용 |
|------|------|
| 대상 행 | **DENY-2** — `IN_INTERVIEW` → `APPROVED` |
| 상위 판정 | [CASE_LIFECYCLE_TRANSITION_SUMMARY.md](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) §6 본표 · §6-1 |
| 행별 8블록 초안 | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_ROW_ENHANCEMENT_DRAFT.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_ROW_ENHANCEMENT_DRAFT.md) **DENY-2** |
| 통합 시트 | [PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md) §6 DENY-2 |
| 1차 기입 | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_FIRST_PASS_DRAFT.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_FIRST_PASS_DRAFT.md) — [EVIDENCE-20260421-190] |
| 점검 결과 기입(절 구조) | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_RESULT_TEMPLATE.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_RESULT_TEMPLATE.md) — **§1~9**를 DENY-2 전이·문구에 맞게 치환해 기입 |
| 선행 예시 | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_FILL_STEPS.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_FILL_STEPS.md) · [DENY-1 실기입](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_RESULT_FILLED.md) |
| DENY-2 실기입(2026-04-21) | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY2_FOUR_AXIS_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY2_FOUR_AXIS_RESULT_FILLED.md) — [EVIDENCE-20260421-220] |

---

## 0. 시작 전 고정

- **대상 행:** DENY-2
- **대상 전이:** `IN_INTERVIEW` → `APPROVED`
- **문서 축 고정 판정:** DENY 유지·잠금
- **유지 사유:** 단계 건너뜀 금지
- **목표:** 4축 중 **최소 1축 이상**을 근거와 함께 ☐→☑로 전환

---

## 1. 문서 기준 먼저 재확인

먼저 아래 문서들이 **같은 뜻**으로 읽히는지 확인한다.

1. [CASE_LIFECYCLE_TRANSITION_SUMMARY.md](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) **§6 본표**의 DENY-2
2. 같은 파일 **§6-1**의 DENY-2 고정 판정
3. [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_ROW_ENHANCEMENT_DRAFT.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_ROW_ENHANCEMENT_DRAFT.md)의 **DENY-2** 8블록 본문
4. [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_FIRST_PASS_DRAFT.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_FIRST_PASS_DRAFT.md)의 **DENY-2** 초안 문구

**확인 포인트**

- 모두 `IN_INTERVIEW` → `APPROVED`를 **단계 건너뜀 금지**로 서술하는지
- 해소 조건이 **최소 1축 통제 근거 확인**으로 맞는지
- 실무 한 줄과 근거 메모가 §6-1 의미와 **충돌하지 않는지**

**이 단계 결과 기록 예시**

- 문서 기준 일치 / 부분 불일치 / 불일치
- 불일치 시 우선 기준 문서
- 수정 필요 문서 목록

---

## 2. UI 축 점검

가장 먼저 확인하기 쉬운 축이다.

**확인 질문**

- `IN_INTERVIEW` 상태에서 승인 버튼이나 승인 액션 메뉴가 보이는가
- 사건 상세 / 목록 / 빠른 액션 / 드롭다운 어디에서도 승인 진입이 가능한가
- 보이더라도 disabled 또는 클릭 후 차단되는가

**점검 포인트**

- 인터뷰 화면 상단 액션
- 사건 상세 액션 버튼
- 상태 변경 드롭다운
- 관리자/변호사 역할별 차이

**UI 축 ☑ 판정 조건** (아래 **하나**면 UI 축 ☑ 가능)

- `IN_INTERVIEW` 상태에서 승인 버튼이 **비노출**
- 승인 메뉴는 보여도 **disabled**
- 클릭 시 즉시 **차단 메시지**로 종료

**기록 문장 예시**

- 「`IN_INTERVIEW` 상태에서는 승인 액션이 UI에 노출되지 않음.」
- 「승인 메뉴는 있으나 `IN_INTERVIEW` 상태에서는 비활성 처리됨.」
- 「UI 조건식을 아직 확인하지 못해 ☐ 유지.」

---

## 3. API 축 점검

다음은 API에서 **인터뷰 중 바로 승인** 요청이 차단되는지 본다.

**확인 질문**

- 상태 변경 API에서 `IN_INTERVIEW` → `APPROVED` 요청이 들어오면 **거절**되는가
- 승인 전용 route가 있더라도 `IN_INTERVIEW` 상태를 **허용하지 않는가**
- 응답이 **금지 전이**로 해석 가능한가

**우선 확인 대상**

- `PATCH` `/api/cases/[caseId]/status` (또는 프로젝트 내 동등 경로)
- 승인 관련 별도 route / action
- route 내부의 전이 검사 호출 여부 (`applyCaseStatusTransition`, `evaluateCaseTransition`, `checkCaseTransitionOrThrow` 등)

**API 축 ☑ 판정 조건** (아래 **하나**면 API 축 ☑ 가능)

- `IN_INTERVIEW` → `APPROVED` 요청 시 4xx/금지 응답
- route 내부에서 전이 검사 실패
- 승인 전용 API가 `IN_INTERVIEW`를 입력 전제에서 제외

**기록 문장 예시**

- 「상태 변경 API는 `IN_INTERVIEW` → `APPROVED` 요청을 허용하지 않음.」
- 「승인 API는 `IN_INTERVIEW` 상태를 전제 조건에서 배제함.」
- 「API 응답 근거를 아직 재현하지 못해 ☐ 유지.」

---

## 4. 서버 축 점검

핵심 축이다. 문서상 금지를 **실제 도메인 로직**이 막고 있는지 확인한다.

**확인 질문**

- `CASE_TRANSITIONS`에 `IN_INTERVIEW` → `APPROVED` **직접 규칙**이 존재하는가
- `APPROVE_DOCUMENT` 또는 동등 승인 액션의 `from`-state에 `IN_INTERVIEW`가 **포함**되는가
- 공통 전이 유틸이 이 조합을 **차단**하는가

**서버 축 점검 순서**

1. `src/lib/definitions/case-lifecycle.ts`의 `CASE_TRANSITIONS`에서  
   `from: IN_INTERVIEW`, `to: APPROVED` 또는 승인 액션 검색
2. 승인 액션의 `from`-state에 `IN_INTERVIEW` **포함 여부** 확인
3. `applyCaseStatusTransition` / `checkCaseTransitionOrThrow` / `evaluateCaseTransition` 경로에서 금지 처리 확인

**서버 축 ☑ 판정 조건** (아래 **하나**면 서버 축 ☑ 가능)

- `CASE_TRANSITIONS`에 해당 전이가 **없음**
- 승인 액션의 `from`-state에 `IN_INTERVIEW` **없음**
- 전이 검사 유틸이 `IN_INTERVIEW` → `APPROVED`를 reject / false / throw 처리

**기록 문장 예시**

- 「`CASE_TRANSITIONS` 기준 `IN_INTERVIEW` → `APPROVED` 직접 규칙 없음.」
- 「승인 액션 `from`-state에 `IN_INTERVIEW`가 포함되지 않음.」
- 「정적 참고만 있고 실행 경로 확인이 끝나지 않아 ☐ 유지.」

---

## 5. 운영·감사 축 점검

코드 직접 차단이 약해도 **운영 절차**와 **감사 기준**이 있으면 이 축도 근거가 된다.

**확인 질문**

- 인터뷰 진행 중 바로 승인은 **운영 절차상 금지**인가
- 인터뷰 완료 / 초안 / 검토 단계를 건너뛰는 승인 **예외 절차**가 존재하는가
- 감사 로그나 운영 규정이 이를 **정상 흐름**으로 보지 않는가

**운영·감사 축 ☑ 판정 조건** (아래 **하나**면 ☑ 가능)

- 운영 문서에 단계 건너뜀 금지 명시
- 인터뷰 중 승인 예외는 별도 승인/감사 절차 필요
- 감사/타임라인에서 정상 승인 흐름으로 취급하지 않음

**기록 문장 예시**

- 「운영 기준상 인터뷰 진행 중 직접 승인은 허용되지 않음.」
- 「예외 승인은 별도 승인/감사 절차 대상이며 일반 상태 전이로 인정되지 않음.」
- 「운영·감사 문서 직접 근거 미확보로 ☐ 유지.」

---

## 6. 4축 판정 정리

점검이 끝나면 [DENY-2 8블록](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_ROW_ENHANCEMENT_DRAFT.md) 본문에 아래처럼 반영한다.

```
서버: ☐ / ☑ / —
API: ☐ / ☑ / —
UI: ☐ / ☑ / —
운영·감사: ☐ / ☑ / —
```

**판정 원칙**

- **☑:** 실제 확인 완료 + 문장 근거 있음
- **☐:** 아직 확인 못했거나 근거 불충분
- **—:** 이 행에서 직접 축이 아님

§6 DENY는 코드 직접 대응 행이 없더라도 정상일 수 있으므로, **한 축만 먼저 ☑**가 나와도 역점검 진전으로 기록할 수 있다.

---

## 7. DENY-2 본문에 바로 넣을 갱신 항목

점검 후에는 DENY-2 8블록에서 아래만 갱신하면 된다.

1. **4축** — 실제 확인 결과로 ☐→☑ 변경
2. **실무 한 줄** — 예:  
   「`IN_INTERVIEW` 상태에서는 승인 액션이 UI에 노출되지 않고, 서버 전이 규칙도 없어 금지 위반이 실행되지 않음.」
3. **근거 메모** — 예:  
   - 「§6-1 기준상 `IN_INTERVIEW` → `APPROVED`는 단계 건너뜀 금지형 DENY다.」  
   - 「승인 액션은 `IN_INTERVIEW` 상태에서 노출되지 않음.」  
   - 「서버 전이표에 직접 규칙이 없음.」
4. **남은 이슈** — 예:  
   「운영·감사 축 직접 문구 확인 필요」 / 「API 응답 메시지 추가 확인 필요」
5. **다음 작업** — 예:  
   「DENY-3 동일 순서로 진행」 / 「새 evidence 블록 초안 작성 준비」

---

## 8. DENY-2 완료 판정 기준

DENY-2는 아래면 **1차 완료**로 봐도 된다.

- [ ] 문서 기준 일치 확인
- [ ] 4축 중 **최소 1축 이상** ☑
- [ ] 실무 한 줄 갱신
- [ ] 근거 메모 2~3줄 이상 작성
- [ ] `DENY_FIRST_PASS_DRAFT` / `DENY_ROW_ENHANCEMENT_DRAFT` / 통합 **SHEET** 표현 충돌 없음

---

## 9. DENY-2 다음 연결

DENY-2가 끝나면 바로 **DENY-3**로 간다.

- **DENY-3:** §6-1상 `INTERVIEW_DONE` → `DELIVERED`, 유지 사유는 **승인·문서 절차 없이 전달 금지**다.
- **정리:** DENY-2는 「**승인으로** 건너뜀 금지」, DENY-3는 「**전달로** 건너뜀 금지」 계열로 이어진다.

실제 점검 뒤 상세 기입은 [DENY-1 결과 템플릿](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_RESULT_TEMPLATE.md) **§1~9** 구조를 DENY-2에 맞게 치환해 사용한다.

---

## 바로 붙여 넣는 축약본

아래 블록을 복사해 메모·이슈·증빙 초안에 사용한다.

```markdown
## DENY-2 4축 근거 채움용 점검 순서표

### 0. 시작 전 고정
- 대상 행: DENY-2
- 대상 전이: `IN_INTERVIEW` → `APPROVED`
- 문서 축 고정 판정: DENY 유지·잠금
- 유지 사유: 단계 건너뜀 금지
- 목표: 4축 중 최소 1축 이상 ☐→☑ 전환

### 1. 문서 기준 먼저 재확인
- §6 본표 / §6-1 / DENY_ROW_ENHANCEMENT_DRAFT / DENY_FIRST_PASS_DRAFT 표현 일치 확인
- 확인 결과:
- 수정 필요 여부:
- 한 줄 정리:

### 2. UI 축 점검
- 확인 경로:
- 승인 액션 노출 여부:
- 실행 가능 여부:
- 근거 위치:
- 판정: ☐
- 판정 사유:

### 3. API 축 점검
- 확인 route / handler:
- 응답 결과:
- 응답 형태:
- 근거 위치:
- 판정: ☐
- 판정 사유:

### 4. 서버 축 점검
- `CASE_TRANSITIONS` 직접 규칙 확인
- 승인 액션 from-state 확인
- 전이 유틸 실행 경로 확인
- 근거 위치:
- 판정: ☐
- 판정 사유:

### 5. 운영·감사 축 점검
- 확인 문서/근거:
- 운영상 허용 여부:
- 감사/기록 요구:
- 근거 위치:
- 판정: ☐
- 판정 사유:

### 6. 4축 판정 정리
- 서버: ☐
- API: ☐
- UI: ☐
- 운영·감사: ☐
- 최소 1축 이상 ☑ 여부:
- 현재 단계 판정:
- 한 줄 결론:

### 7. DENY-2 본문에 바로 넣을 갱신 항목
- 실무 한 줄:
- 근거 메모:
  - 
  - 
  - 
- 남은 이슈:
  - 
  - 
- 다음 작업:
  - 

### 8. DENY-2 완료 판정 기준
- 문서 기준 일치
- 최소 1축 이상 ☑
- 실무 한 줄 갱신
- 근거 메모 2~3줄 이상
- 관련 문서 표현 충돌 없음

### 9. DENY-2 다음 연결
- DENY-3 (`INTERVIEW_DONE` → `DELIVERED`) 동일 순서 진행
```
