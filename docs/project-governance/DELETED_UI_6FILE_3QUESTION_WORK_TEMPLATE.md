# DELETED UI 6파일 3질문 실사 — 실무 붙여넣기 템플릿

**용도:** [239] 실행 순서에 따라 UI 6파일을 실사할 때, 아래 블록을 복사해 채운 뒤 `IMPLEMENTATION_EVIDENCE.md`·체크리스트·시트에 반영한다.

**기준 증빙:** 실행 허브 **[239]** · 서버 재확인·중간 결론 **[240]** · 실사 완료 후 새 블록 예시 번호 **[241]**

---

## 1) 3질문 표

### 파일: `src/components/cases/delete-case-button.tsx`

| 질문 | 확인 결과 | 근거 요약 | 판정 |
|------|-----------|-------------|------|
| 삭제 버튼 노출 조건 | [기입] | [예: status !== 'DELETED'일 때만 노출 / canDelete true일 때만 노출] | [확정/보류] |
| DELETED 복구·재생성 버튼 존재 여부 | [기입] | [예: restore / recover / recreate / undelete 관련 버튼 없음] | [있음/없음/보류] |
| getAllowedCaseActions / allowedLifecycleActions / 독자 조건 소비 방식 | [기입] | [예: getAllowedCaseActions(case) 사용 / case.allowedLifecycleActions.includes(...) 사용 / 로컬 조건식 단독 사용] | [서버소비/UI가드/독자조건] |

### 파일: `src/components/cases/case-status-actions.tsx`

| 질문 | 확인 결과 | 근거 요약 | 판정 |
|------|-----------|-------------|------|
| 삭제 버튼 노출 조건 | [기입] | [ ] | [ ] |
| DELETED 복구·재생성 버튼 존재 여부 | [기입] | [ ] | [ ] |
| getAllowedCaseActions / allowedLifecycleActions / 독자 조건 소비 방식 | [기입] | [ ] | [ ] |

### 파일: `src/components/cases/case-detail-client.tsx`

| 질문 | 확인 결과 | 근거 요약 | 판정 |
|------|-----------|-------------|------|
| 삭제 버튼 노출 조건 | [기입] | [ ] | [ ] |
| DELETED 복구·재생성 버튼 존재 여부 | [기입] | [ ] | [ ] |
| getAllowedCaseActions / allowedLifecycleActions / 독자 조건 소비 방식 | [기입] | [ ] | [ ] |

### 파일: `src/components/cases/case-status-card.tsx`

| 질문 | 확인 결과 | 근거 요약 | 판정 |
|------|-----------|-------------|------|
| 삭제 버튼 노출 조건 | [기입] | [ ] | [ ] |
| DELETED 복구·재생성 버튼 존재 여부 | [기입] | [ ] | [ ] |
| getAllowedCaseActions / allowedLifecycleActions / 독자 조건 소비 방식 | [기입] | [ ] | [ ] |

### 파일: `src/app/(protected)/cases/[caseId]/page.tsx`

| 질문 | 확인 결과 | 근거 요약 | 판정 |
|------|-----------|-------------|------|
| 삭제 버튼 노출 조건 | [기입] | [ ] | [ ] |
| DELETED 복구·재생성 버튼 존재 여부 | [기입] | [ ] | [ ] |
| getAllowedCaseActions / allowedLifecycleActions / 독자 조건 소비 방식 | [기입] | [ ] | [ ] |

### 파일: `src/app/(protected)/cases/page.tsx`

| 질문 | 확인 결과 | 근거 요약 | 판정 |
|------|-----------|-------------|------|
| 삭제 버튼 노출 조건 | [기입] | [ ] | [ ] |
| DELETED 복구·재생성 버튼 존재 여부 | [기입] | [ ] | [ ] |
| getAllowedCaseActions / allowedLifecycleActions / 독자 조건 소비 방식 | [기입] | [ ] | [ ] |

---

## 2) 판정 문장

아래는 파일별 판정 문장 템플릿이다. 필요한 항목만 골라 쓴다.

### A. 삭제 버튼 노출 조건 판정 문장

- `delete-case-button.tsx`는 삭제 버튼을 **[조건]**에서만 노출한다. 따라서 UI에서 삭제 진입은 **[상태/권한/조건]**에 의해 제한된다.
- `case-status-actions.tsx`는 삭제 액션을 [조건] 기준으로 렌더링한다. 이 파일 기준 삭제 버튼 노출은 **[서버 응답 기반/로컬 조건 기반]**이다.
- `case-detail-client.tsx`는 삭제 버튼을 직접 렌더링하지 않고 **[하위 컴포넌트명]**로 위임한다 / 직접 **[조건]**으로 노출을 제어한다.
- `case-status-card.tsx`는 상태 카드 내 액션 영역에서 삭제 관련 UI를 **[노출함/노출하지 않음]**으로 확인했다.
- `[caseId]/page.tsx`는 상세 페이지에서 삭제 관련 UI를 **[직접 제어하지 않음/props 전달로 간접 제어함/직접 제어함]**으로 확인했다.
- `cases/page.tsx`는 목록 화면에서 삭제 진입을 **[없음/행 단위 액션으로 제공/별도 버튼 제공]**으로 확인했다.

### B. DELETED 복구·재생성 버튼 존재 여부 판정 문장

- `delete-case-button.tsx`에는 DELETED 상태에서 사건을 복구·재생성하는 전용 버튼(restore, recover, recreate, undelete)이 [없다/있다/유사 표현만 있다].
- `case-status-actions.tsx`에는 DELETED 복구·재생성 전용 UI가 [없다/있다].
- `case-detail-client.tsx`에는 DELETED 상태 전용 복구 진입 UI가 [없다/있다].
- `case-status-card.tsx`에는 DELETED 복구를 의미하는 액션 버튼이 [없다/있다].
- `[caseId]/page.tsx`와 `cases/page.tsx`에서는 DELETED 복구·재생성 버튼이 [노출되지 않는다/노출된다].

### C. 소비 방식 판정 문장

- 이 파일은 액션 허용 여부를 getAllowedCaseActions 기준으로 소비한다.
- 이 파일은 서버 응답 필드인 **allowedLifecycleActions**를 직접 소비한다.
- 이 파일은 공용 가드 없이 독자 조건식으로 버튼 노출을 판정한다.
- 이 파일은 서버 응답 + 로컬 조건을 함께 사용한다.
- 따라서 이 파일의 UI 판정 축은 **[서버 응답 중심 / UI 가드 중심 / 독자 조건 중심 / 혼합형]**이다.

---

## 3) evidence 반영 문안 (`IMPLEMENTATION_EVIDENCE.md`)

**제목 예시:** `[EVIDENCE-20260421-241] [240] 후속 — UI 6파일 3질문 실사`

### 본문 템플릿

```markdown
### [EVIDENCE-20260421-241] [240] 후속 — UI 6파일 3질문 실사

#### 기준

- 실행 허브는 [239]
- 서버 재확인 및 중간 결론은 [240]
- 이번 증빙은 UI 6파일에 대해 아래 3질문만 실제 코드 기준으로 확인한다.
  1. 삭제 버튼 노출 조건
  2. DELETED 복구·재생성 버튼 존재 여부
  3. getAllowedCaseActions / allowedLifecycleActions / 독자 조건 중 실제 소비 방식

#### 대상 파일

- src/components/cases/delete-case-button.tsx
- src/components/cases/case-status-actions.tsx
- src/components/cases/case-detail-client.tsx
- src/components/cases/case-status-card.tsx
- src/app/(protected)/cases/[caseId]/page.tsx
- src/app/(protected)/cases/page.tsx

#### 확인 결과 요약

1. delete-case-button.tsx
   - 삭제 버튼 노출 조건: [기입]
   - DELETED 복구·재생성 버튼: [없음/있음/보류]
   - 소비 방식: [getAllowedCaseActions / allowedLifecycleActions / 독자 조건 / 혼합]

2. case-status-actions.tsx
   - 삭제 버튼 노출 조건: [기입]
   - DELETED 복구·재생성 버튼: [없음/있음/보류]
   - 소비 방식: [기입]

3. case-detail-client.tsx
   - 삭제 버튼 노출 조건: [기입]
   - DELETED 복구·재생성 버튼: [없음/있음/보류]
   - 소비 방식: [기입]

4. case-status-card.tsx
   - 삭제 버튼 노출 조건: [기입]
   - DELETED 복구·재생성 버튼: [없음/있음/보류]
   - 소비 방식: [기입]

5. src/app/(protected)/cases/[caseId]/page.tsx
   - 삭제 버튼 노출 조건: [기입]
   - DELETED 복구·재생성 버튼: [없음/있음/보류]
   - 소비 방식: [기입]

6. src/app/(protected)/cases/page.tsx
   - 삭제 버튼 노출 조건: [기입]
   - DELETED 복구·재생성 버튼: [없음/있음/보류]
   - 소비 방식: [기입]

#### 종합 판정

- UI 6파일 기준 삭제 진입은 [서버 응답 기반 / 공용 가드 기반 / 독자 조건 기반 / 혼합형]으로 노출된다.
- 이번 확인 범위에서 DELETED 복구·복원·재생성 전용 UI는 [없다 / 일부 파일에만 있다 / 보류]로 판정한다.
- 따라서 [240]의 서버 기준 판정과 충돌하는 UI 복구 경로는 [확인되지 않았다 / 일부 의심 지점이 남았다].
- 중간 결론: 서버 기준 판정 유지 / DELETED 표준 복구 부재 유지 / UI 소비 축은 [완료/부분완료/보류].

#### 검증 메모

- 확인 방식: JSX 조건문, 버튼 렌더링 분기, action 배열 소비 위치, props 전달 흐름 기준으로 점검
- 검색 키워드: delete, deleted, restore, recover, recreate, undelete, allowedLifecycleActions, getAllowedCaseActions

#### 검증 명령

- [실제 사용한 grep / rg / 파일 열람 절차 기입]

#### 검증 결과

- [명령 결과 및 판정 요약 기입]
```

---

## 4) checklist 반영 문안 (`PREMISE2_CONTROL_CONNECTION_AUDIT_DELETED_TRANSITION_REVIEW_CHECKLIST.md`)

아래 블록을 체크리스트에 붙여 넣고 `[기입]`을 채운다.

```markdown
### [241] UI 6파일 3질문 실사

#### 목적

- [240]에서 보류된 UI 소비 축을 실제 JSX 기준으로 확인한다.

#### 점검 파일

- delete-case-button.tsx
- case-status-actions.tsx
- case-detail-client.tsx
- case-status-card.tsx
- [caseId]/page.tsx
- cases/page.tsx

#### 3질문

1. 삭제 버튼 노출 조건은 무엇인가
2. DELETED 복구·재생성 버튼이 존재하는가
3. getAllowedCaseActions / allowedLifecycleActions / 독자 조건 중 무엇을 실제 소비하는가

#### 점검 결과

- delete-case-button.tsx: [기입]
- case-status-actions.tsx: [기입]
- case-detail-client.tsx: [기입]
- case-status-card.tsx: [기입]
- [caseId]/page.tsx: [기입]
- cases/page.tsx: [기입]

#### 판정

- UI에서 DELETED 복구·복원 전용 진입은 [없음/있음/보류]
- [240] 서버 판정과 충돌하는 UI 경로는 [없음/있음/보류]
- 후속 필요 작업: [없음 / repository·dashboard·timeline / 전역 restore 재스캔]
```

---

## 5) sheet 반영 문안 (`PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md`)

**메타/행 추가 문안**

- [241] UI 6파일 3질문 실사 완료/진행:
  - 삭제 버튼 노출 조건 확인
  - DELETED 복구·재생성 버튼 유무 확인
  - getAllowedCaseActions / allowedLifecycleActions / 독자 조건 소비 방식 확인
  - 서버 기준 판정([240])과 UI 소비 축의 충돌 여부 대조

**OPEN-4 반영 문안 예시**

- OPEN-4
  - 표준 전이 API 기준 DELETED 복구 부재는 [240]에서 재확인 완료
  - UI 6파일 실사([241]) 기준 복구·재생성 전용 UI는 [없음/일부 의심/보류]
  - 따라서 OPEN-4는 [운영 설명·복원 시나리오 문서 축만 잔존 / UI 근거까지 포함해 재판정 필요]

**DENY-8 반영 문안 예시**

- DENY-8
  - 일반 재진입 금지 축은 [240] 서버 재확인으로 유지
  - UI 6파일 실사([241])에서 이를 뒤집는 복구 버튼/경로는 [확인되지 않음/일부 의심]
  - 현재 판정: [완료 유지 / 부분 보류]

**증빙 목록 추가 문안**

- [241] UI 6파일 3질문 실사

---

## 6) 최종 한 줄 판정 템플릿

실사 끝나고 마지막에 붙이면 좋은 문장이다.

### 전부 문제 없을 때

UI 6파일 실사 결과, 삭제 버튼은 각 파일의 기존 노출 조건에 따라 제한되며, DELETED 복구·복원·재생성 전용 버튼은 이번 확인 범위에서 보이지 않았다. 또한 액션 소비는 getAllowedCaseActions, allowedLifecycleActions, 또는 그 조합에 머물렀고, [240]의 서버 기준 판정을 뒤집는 독자 복구 경로는 확인되지 않았다.

### 일부 의심 지점이 있을 때

UI 6파일 실사 결과, 전반적으로 [240] 서버 판정과 정합적이나, **[파일명]**에서 **[조건/버튼명]**이 DELETED 복구·재진입 축과 혼동될 여지가 있어 추가 대조가 필요하다.

### 복구 버튼이 실제로 발견됐을 때

UI 6파일 실사 결과, **[파일명]**에서 DELETED 복구·재생성으로 해석될 수 있는 UI 진입이 확인되었다. 다만 해당 버튼이 실제로 어떤 API/action으로 연결되는지는 별도 코드 경로 대조가 필요하며, 서버 표준 전이 축([240])을 직접 뒤집는다고 즉시 단정하지 않는다.
