# P1 A~D 4행 1차 기입 초안

| 항목 | 내용 |
|------|------|
| 기준 문서 | [PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md) · [PREMISE2_CONTROL_CONNECTION_AUDIT_FIRST_PASS_CRITERIA.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_FIRST_PASS_CRITERIA.md) |
| 상위 판정표 | [CASE_LIFECYCLE_TRANSITION_SUMMARY.md](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) **§9-1** ([EVIDENCE-20260421-183]) |
| 증빙 흐름 | [EVIDENCE-20260421-187] · 본 초안 [EVIDENCE-20260421-188] |
| 코드 역점검 실행표 | [PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_CHECKLIST.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_CHECKLIST.md) — [EVIDENCE-20260421-193] |
| 역점검 결과 기록 템플릿 | [PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_RESULT_TEMPLATE.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_RESULT_TEMPLATE.md) — [EVIDENCE-20260421-194] |
| P1-A 기입 예시 초안 | [PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_RESULT_EXAMPLE.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_RESULT_EXAMPLE.md) — [EVIDENCE-20260421-195] |
| P1-A 실기입 점검 순서 | [PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_FILL_STEPS.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_FILL_STEPS.md) — [EVIDENCE-20260421-196] |
| P1-A 역점검 결과 실기입본 | [PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_RESULT_FILLED.md) — [EVIDENCE-20260421-197] |
| `INTAKE_PENDING` 전역 추적 | [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **[EVIDENCE-20260421-198]** — 실기입본 §2.1 |
| P1-B 역점검 결과 실기입본 | [PREMISE2_CONTROL_CONNECTION_AUDIT_P1B_CODE_REVIEW_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1B_CODE_REVIEW_RESULT_FILLED.md) — [EVIDENCE-20260421-199] |
| P1-C 역점검 결과 실기입본 | [PREMISE2_CONTROL_CONNECTION_AUDIT_P1C_CODE_REVIEW_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1C_CODE_REVIEW_RESULT_FILLED.md) — [EVIDENCE-20260421-200] |
| P1-D 역점검 결과 실기입본 | [PREMISE2_CONTROL_CONNECTION_AUDIT_P1D_CODE_REVIEW_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1D_CODE_REVIEW_RESULT_FILLED.md) — [EVIDENCE-20260421-201] |

---

## 0. 기입 원칙

- 이번 초안은 **전제 2 해소 선언용이 아니라 1차 기입용**이다.
- 상위 판정표의 **미해소** 상태를 **임의로 바꾸지 않는다.**
- 각 행은 UI / API / 서버 / 운영·감사 4축 중 **확인된 것만 ☑**로 두고, 나머지는 **☐** 또는 **—**로 둔다.
- **최소 1축 이상** 근거가 있더라도 **전제 2 자동 상향은 금지**이다.

---

## 1. P1-A — `CREATED` → `INTAKE_PENDING`

**1차 기입안**

| UI | API | 서버 | 운영·감사 |
| --- | --- | --- | --- |
| ☐ | ☐ | ☐ | — |

**실무 한 줄**

`CREATED` → `INTAKE_PENDING`은 현재 **허용 전이로 확정되지 않았고**, 조건 흐름인지 비전이 처리인지 분리가 끝나지 않아 UI/API/서버 통제 근거를 아직 입증하지 못했다.

**근거 메모**

- 상위 판정은 **구현 공백 유지 + 문서 축 COND/비전이 후보** — 아직 “실제 상태 전이”로 잠기지 않았기 때문에 4축 어디에도 성급히 ☑를 줄 수 없음.
- 운영·감사는 이 행에서 **직접 통제 축으로 보기 어려워** 일단 **—** 처리.
- 후속 확인: `CASE_TRANSITIONS` 실코드, 문서 조건문, 비전이 처리 여부 쪽이 우선.

---

## 2. P1-B — `REVIEW_PENDING` → `DRAFTING`

**1차 기입안** *(원래 초안 — 아래 실기입 [199]이 우선)*

| UI | API | 서버 | 운영·감사 |
| --- | --- | --- | --- |
| ☐ | ☐ | ☐ | — |

**실제 코드 역점검 실기입** — [PREMISE2_CONTROL_CONNECTION_AUDIT_P1B_CODE_REVIEW_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1B_CODE_REVIEW_RESULT_FILLED.md) **[EVIDENCE-20260421-199]**

| UI | API | 서버 | 운영·감사 |
| --- | --- | --- | --- |
| ☑ | ☑ | ☑ | ☑ |

**실무 한 줄**

`CASE_TRANSITIONS`에는 **`REVIEW_PENDING`→`DRAFTING` 규칙이 없고**, **`POST .../documents/generate`가 `DRAFTING`으로 직접 갱신**하며, 진행 액션「문서 초안 생성」은 **`INTERVIEW_DONE`만**. `REVIEW_PENDING`에서도 문서 목록「문서 생성」은 열림.

**근거 메모**

- 상위 판정은 **미해소 유지** — 임시 판정: **혼합 구조** + **추가 확인 필요**(제품 의도·API 가드).
- 전이표와 문서 API의 **불일치**가 코드로 확인됨.

---

## 3. P1-C — `APPROVED` → `CLOSED`

**1차 기입안** *(원래 초안 — 아래 실기입 [200]이 우선)*

| UI | API | 서버 | 운영·감사 |
| --- | --- | --- | --- |
| ☐ | ☐ | ☐ | ☐ |

**실제 코드 역점검 실기입** — [PREMISE2_CONTROL_CONNECTION_AUDIT_P1C_CODE_REVIEW_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1C_CODE_REVIEW_RESULT_FILLED.md) **[EVIDENCE-20260421-200]**

| UI | API | 서버 | 운영·감사 |
| --- | --- | --- | --- |
| ☑ | ☑ | ☑ | ☑ |

**실무 한 줄**

`APPROVED` → `CLOSED` **직접 전이는 없고**, **`CLOSE_CASE`는 `DELIVERED`→`CLOSED`만**; UI 종결도 **`DELIVERED`에서만** 노출.

**근거 메모**

- 상위 판정 **미해소 유지** — 임시 판정: **명시 종료 액션 존재** + **추가 확인 필요**(`case-status-definition` `APPROVED.next`).
- 종료 이력: **타임라인** `CASE_STATUS_CHANGED` · 별도 `writeAuditLog`는 본 경로 없음.

---

## 4. P1-D — `HOLD` → `REJECTED`

**1차 기입안** *(원래 초안 — 아래 실기입 [201]이 우선)*

| UI | API | 서버 | 운영·감사 |
| --- | --- | --- | --- |
| ☐ | ☐ | ☐ | ☐ |

**실제 코드 역점검 실기입** — [PREMISE2_CONTROL_CONNECTION_AUDIT_P1D_CODE_REVIEW_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1D_CODE_REVIEW_RESULT_FILLED.md) **[EVIDENCE-20260421-201]**

| UI | API | 서버 | 운영·감사 |
| --- | --- | --- | --- |
| ☑ | ☑ | ☑ | ☑ |

**실무 한 줄**

`REJECT_CASE` 출발에 **`HOLD` 없음** — 전이·UI·API **일관 차단** · `HOLD.next`에도 **`REJECTED` 없음**.

**근거 메모**

- 상위 판정 **미해소 유지** — 임시 판정: **정책상 금지 + 구현 차단**.
- 보류 후 반려가 필요하면 **별도 합의·구현**.

---

## 5. 표 형태로 바로 넣는 초안

| 행 | 전이/주제 | UI | API | 서버 | 운영·감사 | 실무 한 줄 |
| --- | --- | --- | --- | --- | --- | --- |
| P1-A | `CREATED` → `INTAKE_PENDING` | ☐ | ☐ | ☐ | — | 허용 전이 확정 전이며 조건 흐름/비전이 처리 분리가 끝나지 않아 통제 근거 미입증 |
| P1-B | `REVIEW_PENDING` → `DRAFTING` | ☐ | ☐ | ☐ | — | 실제 전이인지 문서 생성 API 흐름인지 합의 전이라 통제 연결 미확정 |
| P1-C | `APPROVED` → `CLOSED` | ☐ | ☐ | ☐ | ☐ | 자연 종료처럼 읽히지만 실제 종료 액션 연결 전이어서 4축 모두 추가 입증 필요 |
| P1-D | `HOLD` → `REJECTED` | ☑ | ☑ | ☑ | ☑ | [201] `HOLD` 출발 거절 없음·정책 금지+구현 차단 |

---

## 6. 이 초안의 해석 규칙

- 이 표는 **전부 미해소 유지**가 맞다.
- ☐가 많다는 이유만으로 **즉시 구현 오류**라고 단정하지 않는다.
- 다만 현재 시점에는 **통제 연결이 입증되지 않은 상태**라는 뜻이다.
- 따라서 이 4행은 다음 단계에서 **실제 코드·라우트·서비스·운영 흐름**을 보고 다시 채워야 한다.

---

## 7. 문서에 붙일 한 줄 결론

P1 A~D 4행 1차 기입은 **모두 미해소 유지** — 현재는 조건 흐름/문서 API/종료 액션/정책 합의가 각기 잠기지 않아 **4축 통제 연결을 입증하지 못한 상태**다.
