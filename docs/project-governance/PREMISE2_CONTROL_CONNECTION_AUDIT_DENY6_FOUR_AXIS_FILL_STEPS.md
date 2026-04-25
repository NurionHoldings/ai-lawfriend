# DENY-6 4축 근거 채움용 점검 순서표

| 항목 | 내용 |
|------|------|
| 대상 행 | **DENY-6** — `APPROVED` → `IN_INTERVIEW` |
| 상위 판정 | [CASE_LIFECYCLE_TRANSITION_SUMMARY.md](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) §6 본표 · §6-1 · §5 재개 축 |
| 행별 8블록 초안 | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_ROW_ENHANCEMENT_DRAFT.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_ROW_ENHANCEMENT_DRAFT.md) **DENY-6** |
| 통합 시트 | [PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md) §6 DENY-6 |
| 1차 기입 | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_FIRST_PASS_DRAFT.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_FIRST_PASS_DRAFT.md) — [EVIDENCE-20260421-190] |
| 점검 결과 기입(절 구조) | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_RESULT_TEMPLATE.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_RESULT_TEMPLATE.md) — **§1~9**를 DENY-6 전이·문구에 맞게 치환해 기입 |
| 선행 예시 | [DENY-5 순서표](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY5_FOUR_AXIS_FILL_STEPS.md) · [DENY-1 실기입](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_RESULT_FILLED.md) |
| DENY-6 실기입(2026-04-21) | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY6_FOUR_AXIS_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY6_FOUR_AXIS_RESULT_FILLED.md) — [EVIDENCE-20260421-224] |

---

## 0. 시작 전 고정

- **대상 행:** DENY-6
- **대상 전이:** `APPROVED` → `IN_INTERVIEW`
- **문서 축 고정 판정:** DENY 유지·잠금
- **유지 사유:** 이력 왜곡 방지
- **보조 해석:** 재개는 §5의 별도 축(`REOPEN_CASE`)과 구분
- **목표:** 4축 중 **최소 1축 이상**을 근거와 함께 ☐→☑로 전환

---

## 1. 문서 기준 먼저 재확인

먼저 아래 문서들이 **같은 뜻**으로 읽히는지 확인한다.

1. [CASE_LIFECYCLE_TRANSITION_SUMMARY.md](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) **§6 본표**의 DENY-6
2. 같은 파일 **§6-1**의 DENY-6 고정 판정
3. [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_ROW_ENHANCEMENT_DRAFT.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_ROW_ENHANCEMENT_DRAFT.md)의 **DENY-6** 8블록 본문
4. [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_FIRST_PASS_DRAFT.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_FIRST_PASS_DRAFT.md)의 **DENY-6** 초안 문구

**확인 포인트**

- 모두 `APPROVED` → `IN_INTERVIEW`를 **이력 왜곡 방지**로 서술하는지
- 재개 축이 **§5** / **`REOPEN_CASE`** 예외 흐름과 **구분**되어 있는지
- 해소 조건이 **최소 1축 통제 근거 확인**으로 맞는지
- 실무 한 줄과 근거 메모가 「재개 허용」과 「직접 되돌림 금지」를 **혼동하지 않는지**

**이 단계 결과 기록 예시**

- 문서 기준 일치 / 부분 불일치 / 불일치
- 불일치 시 우선 기준 문서
- 수정 필요 문서 목록

---

## 2. UI 축 점검

**승인 완료** 상태에서 **인터뷰 복귀** 액션이 보이는지부터 확인한다.

**확인 질문**

- `APPROVED` 상태에서 인터뷰 재개 / 인터뷰 복귀 / 상태 되돌리기 계열 버튼이나 메뉴가 보이는가
- 사건 상세 / 목록 / 빠른 액션 / 상태 드롭다운 어디에서도 `IN_INTERVIEW`로 **직접** 진입 가능한가
- 보이더라도 disabled 또는 클릭 후 차단되는가
- 사용자가 이것을 `REOPEN_CASE` 예외와 **혼동**할 수 있는 UI가 존재하는가

**점검 포인트**

- 사건 상세 상단 액션
- 상태 변경 드롭다운
- 재개/복귀 관련 버튼명
- 관리자/변호사 역할별 노출 차이
- 「재개」 버튼이 실제로는 `CLOSED` / `REJECTED` 전용인지 여부

**UI 축 ☑ 판정 조건** (아래 **하나**면 UI 축 ☑ 가능)

- `APPROVED` 상태에서 `IN_INTERVIEW`로 가는 **직접 복귀** 버튼이 **비노출**
- 관련 메뉴는 보여도 **disabled**
- 클릭 시 즉시 **차단 메시지**로 종료
- 재개 UI가 있어도 `APPROVED` 상태에서는 **활성화되지 않음**

**기록 문장 예시**

- 「`APPROVED` 상태에서는 인터뷰 복귀 액션이 UI에 노출되지 않음.」
- 「재개 관련 메뉴는 존재하나 `APPROVED` 상태에서는 활성 조건을 만족하지 않음.」
- 「UI 조건식을 아직 확인하지 못해 ☐ 유지.」

---

## 3. API 축 점검

다음은 **승인 완료** 상태에서 **인터뷰 복귀** 요청이 API에서 차단되는지 확인한다.

**확인 질문**

- 상태 변경 API에서 `APPROVED` → `IN_INTERVIEW` 요청이 들어오면 **거절**되는가
- 재개 전용 route가 있더라도 `APPROVED` 상태를 **허용하지 않는가**
- 응답이 **금지 전이** 또는 잘못된 상태 조합으로 해석 가능한가

**우선 확인 대상**

- `PATCH` `/api/cases/[caseId]/status` (또는 프로젝트 내 동등 경로)
- 재개 관련 별도 route / action
- route 내부의 전이 검사 호출 여부 (`applyCaseStatusTransition`, `evaluateCaseTransition`, `checkCaseTransitionOrThrow` 등)
- `REOPEN_CASE`가 있다면 **출발 상태 제한**이 `APPROVED`를 **포함하는지** 여부

**API 축 ☑ 판정 조건** (아래 **하나**면 API 축 ☑ 가능)

- `APPROVED` → `IN_INTERVIEW` 요청 시 4xx/금지 응답
- route 내부에서 전이 검사 실패
- 재개 전용 API가 `APPROVED` 상태를 입력 전제에서 제외
- `REOPEN_CASE` 입력 전제에 `APPROVED`가 **없음**

**기록 문장 예시**

- 「상태 변경 API는 `APPROVED` → `IN_INTERVIEW` 요청을 허용하지 않음.」
- 「재개 API는 `APPROVED` 상태를 출발 조건에서 배제함.」
- 「API 응답 근거를 아직 재현하지 못해 ☐ 유지.」

---

## 4. 서버 축 점검

핵심 축이다. **승인 후 인터뷰 복귀**가 전이표나 유틸에서 차단되는지 확인한다.

**확인 질문**

- `CASE_TRANSITIONS`에 `APPROVED` → `IN_INTERVIEW` **직접 규칙**이 존재하는가
- `REOPEN_CASE` 또는 동등 재개 액션의 `from`-state에 `APPROVED`가 **포함**되는가
- 공통 전이 유틸이 이 조합을 **차단**하는가
- 승인 후 복귀를 허용하는 **다른 우회 액션**이 존재하는가

**서버 축 점검 순서**

1. `src/lib/definitions/case-lifecycle.ts`의 `CASE_TRANSITIONS`에서  
   `from: APPROVED`, `to: IN_INTERVIEW` 또는 재개 액션 검색
2. `REOPEN_CASE` / 유사 액션의 `from`-state에 `APPROVED` **포함 여부** 확인
3. `applyCaseStatusTransition` / `checkCaseTransitionOrThrow` / `evaluateCaseTransition` 경로에서 금지 처리 확인
4. `CLOSED`·`REJECTED` 전용 재개와 `APPROVED` 직접 복귀가 **혼동되지 않는지** 확인

**서버 축 ☑ 판정 조건** (아래 **하나**면 서버 축 ☑ 가능)

- `CASE_TRANSITIONS`에 해당 전이가 **없음**
- `REOPEN_CASE` `from`-state에 `APPROVED` **없음**
- 전이 검사 유틸이 `APPROVED` → `IN_INTERVIEW`를 reject / false / throw 처리
- 재개 액션이 `CLOSED` / `REJECTED`에만 한정되어 있음이 확인됨

**기록 문장 예시**

- 「`CASE_TRANSITIONS` 기준 `APPROVED` → `IN_INTERVIEW` 직접 규칙 없음.」
- 「`REOPEN_CASE` `from`-state에 `APPROVED`가 포함되지 않음.」
- 「재개 액션은 `CLOSED` / `REJECTED` 예외 축으로 한정되어 `APPROVED` 직접 복귀와 구분됨.」
- 「정적 참고만 있고 실행 경로 확인이 끝나지 않아 ☐ 유지.」

---

## 5. 운영·감사 축 점검

코드 직접 차단이 약해도 **운영 절차**와 **감사 기준**이 있으면 이 축도 근거가 된다.

**확인 질문**

- 승인 완료 후 인터뷰 단계로 **바로 되돌리는** 것은 운영 절차상 금지인가
- 재개는 **종결/반려 후** 예외 처리로만 허용되는가
- 감사 로그나 운영 규정이 **승인 후 직접 복귀**를 정상 흐름으로 보지 않는가
- 승인 후 수정이 필요할 때도 「직접 인터뷰 복귀」가 아니라 **별도 절차**를 타는가

**운영·감사 축 ☑ 판정 조건** (아래 **하나**면 ☑ 가능)

- 운영 문서에 승인 후 직접 인터뷰 복귀 금지 명시
- 재개는 별도 예외 절차(`CLOSED`/`REJECTED` 등)로만 허용
- 감사/타임라인에서 승인 후 직접 복귀를 정상 흐름으로 취급하지 않음
- 예외 복귀는 별도 승인/감사 절차가 필요함

**기록 문장 예시**

- 「운영 기준상 `APPROVED` 상태에서 직접 인터뷰 복귀는 허용되지 않음.」
- 「재개는 종결/반려 후 예외 절차로만 허용되며 승인 후 직접 복귀와 구분됨.」
- 「운영·감사 문서 직접 근거 미확보로 ☐ 유지.」

---

## 6. 4축 판정 정리

점검이 끝나면 [DENY-6 8블록](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_ROW_ENHANCEMENT_DRAFT.md) 본문에 아래처럼 반영한다.

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

§6 DENY는 코드 직접 대응 행이 없더라도 정상일 수 있으므로, **한 축만 먼저 ☑**가 나와도 역점검 진전으로 기록할 수 있다. 특히 **DENY-6**은 「재개 허용 예외」와 「직접 복귀 금지」를 **분리**하는 것이 핵심이다.

---

## 7. DENY-6 본문에 바로 넣을 갱신 항목

점검 후에는 DENY-6 8블록에서 아래만 갱신하면 된다.

1. **4축** — 실제 확인 결과로 ☐→☑ 변경
2. **실무 한 줄** — 예:  
   「`APPROVED` 상태에서는 인터뷰 복귀 액션이 UI에 노출되지 않고, 재개 축은 `CLOSED`/`REJECTED` 예외에만 한정되어 금지 위반이 실행되지 않음.」
3. **근거 메모** — 예:  
   - 「§6-1 기준상 `APPROVED` → `IN_INTERVIEW`는 이력 왜곡 방지형 DENY다.」  
   - 「재개는 §5의 별도 축(`REOPEN_CASE`)과 구분되며 `APPROVED` 직접 복귀를 뜻하지 않는다.」  
   - 「서버 전이표나 재개 액션 출발 상태에 `APPROVED`가 포함되지 않음.」
4. **남은 이슈** — 예:  
   「운영·감사 축 직접 문구 확인 필요」 / 「API 응답 메시지 추가 확인 필요」 / 「재개 UI 문구가 사용자를 혼동시키는지 점검 필요」
5. **다음 작업** — 예:  
   「DENY-7 동일 순서로 진행」 / 「새 evidence 블록 초안 작성 준비」

---

## 8. DENY-6 완료 판정 기준

DENY-6는 아래면 **1차 완료**로 봐도 된다.

- [ ] 문서 기준 일치 확인
- [ ] 4축 중 **최소 1축 이상** ☑
- [ ] 실무 한 줄 갱신
- [ ] 근거 메모 2~3줄 이상 작성
- [ ] `DENY_FIRST_PASS_DRAFT` / `DENY_ROW_ENHANCEMENT_DRAFT` / 통합 **SHEET** 표현 충돌 없음
- [ ] 재개 예외 축과 직접 복귀 금지가 **혼동 없이** 정리됨

---

## 9. DENY-6 다음 연결

DENY-6가 끝나면 바로 **DENY-7**로 간다.

- **DENY-7:** §6-1상 `CLOSED` → `DRAFTING`, 유지 사유는 **종결 후 직접 작성 단계 복귀 금지**다.
- **정리:** DENY-6가 「승인 후 인터뷰 복귀 금지」였다면, DENY-7은 「종결 후 작성 단계 직접 복귀 금지」로 이어진다. 둘 다 **재개/복귀 오해 방지** 계열이지만, DENY-6는 **승인 이후**, DENY-7은 **종결 이후**라는 차이가 있다.

실제 점검 뒤 상세 기입은 [DENY-1 결과 템플릿](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_RESULT_TEMPLATE.md) **§1~9** 구조를 DENY-6에 맞게 치환해 사용한다.

---

## 바로 붙여 넣는 축약본

아래 블록을 복사해 메모·이슈·증빙 초안에 사용한다.

```markdown
## DENY-6 4축 근거 채움용 점검 순서표

### 0. 시작 전 고정
- 대상 행: DENY-6
- 대상 전이: `APPROVED` → `IN_INTERVIEW`
- 문서 축 고정 판정: DENY 유지·잠금
- 유지 사유: 이력 왜곡 방지
- 보조 해석: 재개는 §5의 별도 축(`REOPEN_CASE`)과 구분
- 목표: 4축 중 최소 1축 이상 ☐→☑ 전환

### 1. 문서 기준 먼저 재확인
- §6 본표 / §6-1 / DENY_ROW_ENHANCEMENT_DRAFT / DENY_FIRST_PASS_DRAFT 표현 일치 확인
- 재개 축과 직접 복귀 금지 혼동 여부 점검
- 확인 결과:
- 수정 필요 여부:
- 한 줄 정리:

### 2. UI 축 점검
- 확인 경로:
- 인터뷰 복귀/재개 액션 노출 여부:
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
- `REOPEN_CASE` from-state 확인
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

### 7. DENY-6 본문에 바로 넣을 갱신 항목
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

### 8. DENY-6 완료 판정 기준
- 문서 기준 일치
- 최소 1축 이상 ☑
- 실무 한 줄 갱신
- 근거 메모 2~3줄 이상
- 관련 문서 표현 충돌 없음
- 재개 예외 축과 직접 복귀 금지가 혼동 없이 정리됨

### 9. DENY-6 다음 연결
- DENY-7 (`CLOSED` → `DRAFTING`) 동일 순서 진행
```
