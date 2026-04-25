# DENY-1 4축 근거 채움용 점검 순서표

| 항목 | 내용 |
|------|------|
| 대상 행 | **DENY-1** — `CREATED` → `APPROVED` |
| 상위 판정 | [CASE_LIFECYCLE_TRANSITION_SUMMARY.md](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) §6 본표 · §6-1 |
| 행별 8블록 초안 | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_ROW_ENHANCEMENT_DRAFT.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_ROW_ENHANCEMENT_DRAFT.md) **DENY-1** |
| 통합 시트 | [PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md) §6 DENY-1 |
| 1차 기입 | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_FIRST_PASS_DRAFT.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_FIRST_PASS_DRAFT.md) — [EVIDENCE-20260421-190] |
| 점검 결과 기입 포맷 | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_RESULT_TEMPLATE.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_RESULT_TEMPLATE.md) |
| DENY-1 실기입(2026-04-21) | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_RESULT_FILLED.md) — [EVIDENCE-20260421-213] |

---

## 0. 시작 전 고정

- **대상 행:** DENY-1
- **대상 전이:** `CREATED` → `APPROVED`
- **문서 축 고정 판정:** DENY 유지·잠금
- **유지 사유:** 절차 누락 방지
- **목표:** 4축 중 **최소 1축 이상**을 근거와 함께 ☐→☑로 전환

---

## 1. 문서 기준 먼저 재확인

먼저 아래 3개가 **같은 뜻**으로 읽히는지 확인한다.

1. [CASE_LIFECYCLE_TRANSITION_SUMMARY.md](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) **§6 본표**의 DENY-1
2. 같은 파일 **§6-1**의 DENY-1 고정 판정
3. [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_ROW_ENHANCEMENT_DRAFT.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_ROW_ENHANCEMENT_DRAFT.md)의 **DENY-1** 8블록 본문

**확인 포인트 (하나로 묶음)**

- 모두 `CREATED` → `APPROVED`를 **직접 승인 건너뜀 금지**로 서술하는지
- 「절차 누락 방지」 문구가 일관되는지
- 해소 조건이 **「최소 1축 통제 근거」**로 맞는지

**이 단계 결과 기록 예시**

- 문서 기준 일치 / 불일치
- 불일치 시 어느 문서 표현을 기준으로 맞출지 메모

---

## 2. UI 축 점검

가장 먼저 확인하기 좋은 축이다.

**질문**

- 사건이 `CREATED` 상태일 때 화면에서 **승인에 해당하는** 버튼이나 액션이 보이는가
- 사건 상세·목록·빠른 액션 메뉴 어디에서도 `APPROVED`로 가는 흐름이 보이는가
- 보인다면 클릭 후 **실제 실행 가능**한가, 아니면 차단되는가

**점검 포인트**

- 사건 상세 액션 버튼
- 상태 변경 드롭다운
- 검토/승인 관련 버튼 노출 조건
- 관리자/변호사 역할별 노출 차이

**UI 축 ☑ 판정 조건** (아래 **하나**면 UI 축 ☑ 가능)

- `CREATED` 상태에서 승인 버튼이 **비노출**
- 승인 메뉴가 보여도 **비활성**
- 클릭 시 즉시 **차단 메시지**로 종료

**기록 문장 예시**

- 「`CREATED` 상태에서는 승인 액션이 UI에 노출되지 않음.」
- 「승인 메뉴는 존재하나 `CREATED`에서는 disabled 처리됨.」

---

## 3. API 축 점검

상태 변경 API에서 `CREATED` → `APPROVED` 요청이 **실제로 차단**되는지 본다.

**확인 질문**

- 상태 변경 route에서 `CREATED`에서 `APPROVED` 요청이 들어오면 **거절**되는가
- 승인 전용 route / action이 있어도 `CREATED` 상태에서는 **실패**하는가
- 에러 응답이 **금지 전이**로 해석 가능한가

**우선 확인 대상**

- `PATCH` `/api/cases/[caseId]/status` (또는 프로젝트 내 동등 경로)
- 승인 관련 별도 route가 있으면 그 route
- route 내부에서 `applyCaseStatusTransition` 또는 전이 검사 호출 여부

**API 축 ☑ 판정 조건** (아래 **하나**면 API 축 ☑ 가능)

- `CREATED` 상태로 승인 요청 시 4xx/금지 응답
- route 내부에서 전이 검사 실패
- 승인 전용 API가 `CREATED` 상태를 입력 전제에서 제외

**기록 문장 예시**

- 「상태 변경 API는 `CREATED` → `APPROVED` 요청을 허용하지 않음.」
- 「승인 API는 `CREATED` 상태를 입력 전제에서 배제함.」

---

## 4. 서버 축 점검

핵심 축이다. 문서상 금지를 **실제 도메인 로직**이 막고 있는지 확인한다.

**확인 질문**

- `CASE_TRANSITIONS`에 `CREATED` → `APPROVED` 또는 **동등 액션**이 존재하는가
- `applyCaseStatusTransition` · `checkCaseTransitionOrThrow` · `evaluateCaseTransition` 등 **어디에서** 금지되는가

**서버 축 점검 순서**

1. `src/lib/definitions/case-lifecycle.ts`의 `CASE_TRANSITIONS`에서  
   `from`에 `CREATED`, `to`에 `APPROVED` 또는 승인 액션 검색
2. 승인 액션이 있더라도 **`CREATED`가 출발 상태에 포함되는지** 확인
3. 상태 변경 공통 유틸이 있으면 해당 조합에서 false / throw / reject 되는지 확인

**서버 축 ☑ 판정 조건** (아래 **하나**면 서버 축 ☑ 가능)

- `CASE_TRANSITIONS`에 해당 전이가 **없음**
- 승인 액션의 `from`에 `CREATED` **없음**
- 공통 전이 검사에서 `CREATED` → `APPROVED` **차단**

**기록 문장 예시**

- 「`CASE_TRANSITIONS` 기준 `CREATED` → `APPROVED` 직접 규칙 없음.」
- 「승인 액션 `from`에 `CREATED`가 포함되지 않아 서버 전이 검사에서 차단됨.」

**정적 참고(대체 불가):** 저장소 기준 `APPROVE_DOCUMENT` 규칙은 `from: ["REVIEW_PENDING"]`만 포함한다. 최종 서버 축 판정은 위 순서대로 **전이 유틸·실행 경로**까지 확인한다.

---

## 5. 운영·감사 축 점검

코드 직접 차단이 약하더라도, **운영 기준**이나 **감사 절차**가 있으면 이 축도 근거가 된다.

**확인 질문**

- 생성 직후 승인은 **업무 절차상 금지**라고 명시돼 있는가
- 승인 전 인터뷰/작성/검토 단계 누락이 운영상 허용되지 않는가
- 예외 승인 시 별도 절차나 감사 요건이 있는가
- 로그/타임라인/감사 규칙상 이런 건너뜀을 정상 흐름으로 보지 않는가

**운영·감사 축 ☑ 판정 조건** (아래 **하나**면 ☑ 가능)

- 운영 문서에 단계 건너뜀 금지 명시
- 승인 예외는 별도 승인 절차 필요
- 감사/타임라인에서 정상 흐름으로 취급하지 않음

**기록 문장 예시**

- 「운영 기준상 생성 직후 승인은 허용되지 않으며 인터뷰·작성·검토 절차를 거쳐야 함.」
- 「예외 처리는 별도 승인/감사 대상이며 일반 상태 전이로 인정되지 않음.」

---

## 6. 4축 판정 정리

점검이 끝나면 [DENY-1 8블록](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_ROW_ENHANCEMENT_DRAFT.md) 본문에 아래처럼 반영한다.

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

## 7. DENY-1 본문에 바로 넣을 갱신 항목

점검 후에는 DENY-1 8블록에서 아래만 갱신하면 된다.

1. **4축** — 실제 확인 결과로 ☐→☑ 변경
2. **실무 한 줄** — 예:  
   「`CREATED` 상태에서는 승인 액션이 UI에 노출되지 않고, 서버 전이 규칙도 없어 금지 위반이 실행되지 않음.」
3. **근거 메모** — 예:  
   - 「§6-1 기준상 `CREATED` → `APPROVED`는 절차 누락 방지형 DENY다.」  
   - 「승인 액션은 `CREATED` 상태에서 노출되지 않음.」  
   - 「서버 전이표에 직접 규칙이 없음.」
4. **남은 이슈** — 예:  
   「운영·감사 축 직접 문구 확인 필요」 / 「API 응답 메시지까지 추가 캡처 필요」
5. **다음 작업** — 예:  
   「DENY-2 동일 순서로 진행」 / 「새 evidence 블록 초안 작성 준비」

---

## 8. DENY-1 완료 판정 기준

DENY-1은 아래면 **1차 완료**로 본다.

- [ ] 문서 기준 일치 확인
- [ ] 4축 중 **최소 1축 이상** ☑
- [ ] 실무 한 줄 갱신
- [ ] 근거 메모 2~3줄 이상 작성
- [ ] [190] / 통합 시트 / 본 문서(ROW_ENHANCEMENT) 표현 충돌 없음

---

## 9. 점검 결과 기입

실제 점검 뒤 기록은 [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_RESULT_TEMPLATE.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_RESULT_TEMPLATE.md)의 **1)~9)** 및 **축약본**을 사용한다.
