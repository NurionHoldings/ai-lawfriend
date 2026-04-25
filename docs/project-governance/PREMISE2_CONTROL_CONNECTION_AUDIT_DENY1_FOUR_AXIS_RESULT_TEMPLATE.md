# DENY-1 실제 점검 결과 기입 포맷

| 항목 | 내용 |
|------|------|
| 점검 순서(사전) | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_FILL_STEPS.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_FILL_STEPS.md) |
| 행별 8블록 초안 | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_ROW_ENHANCEMENT_DRAFT.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_ROW_ENHANCEMENT_DRAFT.md) **DENY-1** |
| 상위 판정 | [CASE_LIFECYCLE_TRANSITION_SUMMARY.md](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) §6 · §6-1 |
| 증빙 | [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) — 실점검 반영 시 새 블록 |
| 실기입 예시(DENY-1) | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_RESULT_FILLED.md) — [EVIDENCE-20260421-213] |
| 실기입 예시(DENY-2) | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY2_FOUR_AXIS_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY2_FOUR_AXIS_RESULT_FILLED.md) — [EVIDENCE-20260421-220] |
| 실기입 예시(DENY-3) | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY3_FOUR_AXIS_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY3_FOUR_AXIS_RESULT_FILLED.md) — [EVIDENCE-20260421-221] |
| 실기입 예시(DENY-4) | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY4_FOUR_AXIS_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY4_FOUR_AXIS_RESULT_FILLED.md) — [EVIDENCE-20260421-222] |
| 실기입 예시(DENY-5) | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY5_FOUR_AXIS_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY5_FOUR_AXIS_RESULT_FILLED.md) — [EVIDENCE-20260421-223] |
| 실기입 예시(DENY-6) | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY6_FOUR_AXIS_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY6_FOUR_AXIS_RESULT_FILLED.md) — [EVIDENCE-20260421-224] |
| 실기입 예시(DENY-7) | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY7_FOUR_AXIS_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY7_FOUR_AXIS_RESULT_FILLED.md) — [EVIDENCE-20260421-225] |

본 문서는 **실제 점검 결과를 붙여 넣는 용도**의 빈 서식이다. 한 세션에서 결과를 남길 때는 **복제 후** 파일명에 일시를 붙이거나, 별도 메모에 옮겨 적어도 된다.

---

## 1) 기본 정보

- **행 번호:** DENY-1
- **대상 전이:** `CREATED` → `APPROVED`
- **문서 축 고정 판정:** DENY 유지·잠금
- **유지 사유:** 절차 누락 방지

**점검 기준 문서:**

- [CASE_LIFECYCLE_TRANSITION_SUMMARY.md](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) §6 / §6-1
- [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_FIRST_PASS_DRAFT.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_FIRST_PASS_DRAFT.md)
- [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_ROW_ENHANCEMENT_DRAFT.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_ROW_ENHANCEMENT_DRAFT.md)
- [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_FILL_STEPS.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_FILL_STEPS.md)

- **점검 일시:** YYYY-MM-DD
- **점검자:** \<이름 또는 세션 표기\>

---

## 2) 문서 기준 재확인 결과

**확인 항목**

- §6 본표의 DENY-1 전이가 `CREATED` → `APPROVED`로 잠겨 있는가
- §6-1의 유지 사유가 「절차 누락 방지」로 일치하는가
- 행별 보강 초안과 1차 기입 초안의 표현이 충돌하지 않는가

**기입 포맷**

- **확인 결과:** 일치 / 부분 불일치 / 불일치
- **상세 메모:**
- **조치 필요 여부:** 있음 / 없음
- **조치 내용:**

**한 줄 정리**

예: §6 / §6-1 / DENY 행별 보강 문서의 DENY-1 기준 표현이 모두 일치함.

---

## 3) UI 축 점검 결과

**확인 질문**

- `CREATED` 상태에서 승인 버튼 또는 승인 액션 메뉴가 보이는가
- 목록 / 상세 / 빠른 액션 어디에서도 승인 진입이 가능한가
- 보이더라도 disabled 또는 차단 처리되는가

**기입 포맷**

- **확인 경로:**
  - 사건 상세 화면:
  - 사건 목록 화면:
  - 빠른 액션/드롭다운:
- **UI 노출 여부:** 노출 / 비노출 / 조건부 노출
- **실행 가능 여부:** 가능 / 불가 / 미확인
- **근거 위치(파일/컴포넌트/조건식):**
- **판정:** ☑ / ☐ / —
- **판정 사유:**

**기입 예시 문장**

- `CREATED` 상태에서는 승인 액션이 UI에 노출되지 않음.
- 승인 메뉴는 존재하나 `CREATED` 상태에서는 disabled 처리됨.
- UI 차단 근거를 아직 확보하지 못해 ☐ 유지.

---

## 4) API 축 점검 결과

**확인 질문**

- 상태 변경 API에서 `CREATED` → `APPROVED` 요청이 거절되는가
- 승인 전용 route가 있다면 `CREATED` 상태를 허용하지 않는가
- 응답 메시지나 에러가 금지 전이로 해석 가능한가

**기입 포맷**

- **확인 route / handler:**
- **입력 조건:**
  - 현재 상태 = `CREATED`
  - 목표 상태/액션 = `APPROVED` 또는 승인 액션
- **응답 결과:** 허용 / 거절 / 미확인
- **응답 형태:**
- **HTTP 상태:**
- **에러 메시지:**
- **예외 유틸/분기:**
- **근거 위치(파일/라우트/함수):**
- **판정:** ☑ / ☐ / —
- **판정 사유:**

**기입 예시 문장**

- 상태 변경 API는 `CREATED` → `APPROVED` 요청을 허용하지 않음.
- 승인 API의 전제 조건에 `CREATED` 상태가 포함되지 않음.
- API 차단 근거를 아직 재현/확인하지 못해 ☐ 유지.

---

## 5) 서버 축 점검 결과

**확인 질문**

- `CASE_TRANSITIONS`에 `CREATED` → `APPROVED` 직접 규칙이 존재하는가
- `APPROVE_DOCUMENT` 또는 동등 승인 액션의 `from`-state에 `CREATED`가 포함되는가
- `applyCaseStatusTransition`, `checkCaseTransitionOrThrow`, `evaluateCaseTransition` 등에서 차단되는가

**기입 포맷**

- **정적 참고:**
  - `APPROVE_DOCUMENT` from-state = \<확인값\>
  - `CREATED` 포함 여부 = 포함 / 미포함
- **실행 경로 확인:**
  - 전이 유틸 호출 여부:
  - 금지 판정 위치:
  - throw / false / reject 방식:
- **근거 위치(파일/함수):**
- **판정:** ☑ / ☐ / —
- **판정 사유:**

**기입 예시 문장**

- `CASE_TRANSITIONS` 기준 `CREATED` → `APPROVED` 직접 규칙 없음.
- `APPROVE_DOCUMENT` from-state에 `CREATED`가 포함되지 않음.
- 최종 판정은 전이 유틸 실행 경로 확인까지 완료되어 서버 축 ☑ 처리.
- 정적 참고만 있고 실행 경로 확인이 부족하여 아직 ☐ 유지.

---

## 6) 운영·감사 축 점검 결과

**확인 질문**

- 생성 직후 승인은 운영 절차상 금지인가
- 인터뷰/작성/검토 단계를 거치지 않은 승인에 예외 절차가 있는가
- 감사 로그, 운영 규정, 승인 예외 문구가 존재하는가

**기입 포맷**

- **확인 문서/근거:**
  - 운영 문서:
  - 감사 규칙:
  - 역할/권한 기준:
- **운영상 허용 여부:** 허용 안 함 / 예외 허용 / 미확인
- **감사/기록 요구:** 있음 / 없음 / 미확인
- **근거 위치(문서/절/링크):**
- **판정:** ☑ / ☐ / —
- **판정 사유:**

**기입 예시 문장**

- 운영 기준상 생성 직후 승인은 허용되지 않으며 단계 절차를 따라야 함.
- 예외 승인은 별도 승인/감사 절차가 필요하므로 일반 전이로 인정되지 않음.
- 운영·감사 문서 직접 근거를 아직 확보하지 못해 ☐ 유지.

---

## 7) 4축 최종 정리

**기입 포맷**

- **서버:** ☑ / ☐ / —
- **API:** ☑ / ☐ / —
- **UI:** ☑ / ☐ / —
- **운영·감사:** ☑ / ☐ / —

**종합 판단**

- **최소 1축 이상 ☑ 여부:** 예 / 아니오
- **현재 단계 판정:** 1차 통제 근거 확보 / 추가 확인 필요 / 근거 부족

**한 줄 결론**

예: UI 비노출과 서버 전이 규칙 부재가 확인되어 DENY-1은 최소 2축 통제 근거 확보 상태로 갱신 가능.

---

## 8) DENY-1 본문 반영용 갱신 문안

**4축 반영**

- **서버:**
- **API:**
- **UI:**
- **운영·감사:**

**실무 한 줄**

**근거 메모**

**남은 이슈**

**다음 작업**

---

## 9) evidence 반영용 요약 포맷

**작업 목적**

DENY-1 (`CREATED` → `APPROVED`)의 4축 통제 근거를 실제 점검 결과로 보강하고, §6-1 / DENY 1차 기입 초안 / 행별 보강 초안과 정합되게 갱신한다.

**수정 파일**

- `docs/project-governance/PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_FILL_STEPS.md`
- `docs/project-governance/PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_ROW_ENHANCEMENT_DRAFT.md`
- `docs/project-governance/PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_FIRST_PASS_DRAFT.md`
- 필요 시 `docs/project-governance/IMPLEMENTATION_EVIDENCE.md`

**점검 결과 요약**

- **UI:**
- **API:**
- **서버:**
- **운영·감사:**

**근거 메모**

**남은 이슈**

**다음 작업**

- DENY-2 동일 순서 진행

---

## 바로 붙여 넣는 축약본

아래 블록을 복사해 메모·이슈·증빙 초안에 사용한다.

```markdown
## DENY-1 실제 점검 결과

- 대상 전이: `CREATED` → `APPROVED`
- 문서 축 고정 판정: DENY 유지·잠금
- 유지 사유: 절차 누락 방지
- 점검 일시:
- 점검자:

### 문서 기준 재확인
- 확인 결과:
- 상세 메모:
- 조치 필요 여부:
- 한 줄 정리:

### UI 축
- 확인 경로:
- UI 노출 여부:
- 실행 가능 여부:
- 근거 위치:
- 판정: ☐
- 판정 사유:

### API 축
- 확인 route / handler:
- 응답 결과:
- 응답 형태:
- 근거 위치:
- 판정: ☐
- 판정 사유:

### 서버 축
- 정적 참고:
- 실행 경로 확인:
- 근거 위치:
- 판정: ☐
- 판정 사유:

### 운영·감사 축
- 확인 문서/근거:
- 운영상 허용 여부:
- 감사/기록 요구:
- 근거 위치:
- 판정: ☐
- 판정 사유:

### 4축 최종 정리
- 서버: ☐
- API: ☐
- UI: ☐
- 운영·감사: ☐
- 최소 1축 이상 ☑ 여부:
- 현재 단계 판정:
- 한 줄 결론:

### 본문 반영용 갱신 문안
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
```
