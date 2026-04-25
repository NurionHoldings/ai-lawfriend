# P1-A~D 실제 코드 역점검 체크리스트

| 항목 | 내용 |
|------|------|
| 기준 | [EVIDENCE-20260421-192] · [PREMISE2_CONTROL_CONNECTION_AUDIT_CODE_REVIEW_PRIORITY.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_CODE_REVIEW_PRIORITY.md) · [PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md) |
| 상위 판정표 | [CASE_LIFECYCLE_TRANSITION_SUMMARY.md](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) **§9-1** ([EVIDENCE-20260421-183]) |
| 내비게이터 | `tools/aibeopchin_navigator.py` — **Phase 5** 정의서 대비 구현 역점검 → **Phase 6** 구현 재정렬 패치 |
| 본 문서 증빙 | [EVIDENCE-20260421-193] |
| 결과 기록 템플릿 | [PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_RESULT_TEMPLATE.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_RESULT_TEMPLATE.md) — [EVIDENCE-20260421-194] |
| P1-A 기입 예시 초안 | [PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_RESULT_EXAMPLE.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_RESULT_EXAMPLE.md) — [EVIDENCE-20260421-195] |
| P1-A 실기입 점검 순서 | [PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_FILL_STEPS.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_FILL_STEPS.md) — [EVIDENCE-20260421-196] |
| P1-A 역점검 결과 실기입본 | [PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_RESULT_FILLED.md) — [EVIDENCE-20260421-197] |
| `INTAKE_PENDING` 전역 추적 | [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **[EVIDENCE-20260421-198]** — 실기입본 §2.1 |
| P1-B 역점검 결과 실기입본 | [PREMISE2_CONTROL_CONNECTION_AUDIT_P1B_CODE_REVIEW_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1B_CODE_REVIEW_RESULT_FILLED.md) — [EVIDENCE-20260421-199] |
| P1-C 역점검 결과 실기입본 | [PREMISE2_CONTROL_CONNECTION_AUDIT_P1C_CODE_REVIEW_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1C_CODE_REVIEW_RESULT_FILLED.md) — [EVIDENCE-20260421-200] |
| P1-D 역점검 결과 실기입본 | [PREMISE2_CONTROL_CONNECTION_AUDIT_P1D_CODE_REVIEW_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1D_CODE_REVIEW_RESULT_FILLED.md) — [EVIDENCE-20260421-201] |

---

## 0. 목적

이 체크리스트의 목적은 **P1-A~D 4건**을 문서상 「미해소」 상태로만 두지 않고, 실제 저장소에서 **서버 → API → UI → 운영·감사** 순서로 확인해 **통제 연결 근거**가 있는지 점검하는 것이다.

즉, **전제 2를 바로 올리기 위한 문서가 아니라**, 실제 코드 역점검 **착수용 실행표**이다.

---

## 1. 공통 시작 체크

**기준선**

- `npx tsc --noEmit`
- `npm run lint`
- `npm run verify:canonical-sources`  
→ 결과 **3종 정상** 확인

**고정 원칙**

- 상태 이름 기준은 **`prisma/schema.prisma`** 와 **`src/lib/definitions/case-status.ts`** 만 인정
- `check-status --scope case` 는 **참고용 휴리스틱**일 뿐 **단독 판정 근거로 쓰지 않음** ([IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) §공통 규칙 4-1)
- 상위 판정표 **§9-1**의 **미해소** 판정을 **임의로 바꾸지 않음**
- 이번 체크리스트는 **「확인 결과 기록」**이지 **「즉시 해소 선언」**이 아님

---

## 2. 코드 읽는 기본 순서

### 1단계: 서버

먼저 아래를 본다.

- `prisma/schema.prisma`
- `src/lib/definitions/case-status.ts`
- `src/lib/case-*`
- `src/features/cases/`

**확인 질문**

- 이 전이가 **상태 전이 테이블/정책 함수**에 존재하는가
- 아예 **금지**되는가
- 전이가 아니라 **조건 흐름/문서 흐름**으로 처리되는가

### 2단계: API

그다음 아래를 본다.

- `src/app/api/cases/`

**확인 질문**

- 액션 **라우트**가 존재하는가
- **상태 검증**이 라우트에서 수행되는가
- 잘못된 상태 요청 시 **4xx/거부** 응답이 있는가

### 3단계: UI

그다음 아래를 본다.

- `src/app/(protected)/cases/`
- `src/components/cases/`

**확인 질문**

- 버튼/액션이 **노출**되는가
- 잘못된 상태에서 **숨김/비활성화**가 되는가
- 문구상 허용처럼 보이는 **오해**가 있는가

### 4단계: 운영·감사

마지막으로 아래를 본다.

- 감사 로그 관련 서비스/페이지
- 운영 문서/관리 흐름

**확인 질문**

- 예외 시 **추적** 가능한가
- 운영상 승인/거절/보류 흐름이 있는가
- 관리자 확인 절차와 **연결**되는가

---

## 3. P1-A — `CREATED` → `INTAKE_PENDING`

**상위 판정**

- 고정 판정: **미해소**
- 분류: 구현 공백 유지 + 문서 축 COND/비전이 후보

**서버 체크**

- 상태 전이 테이블에 `CREATED` → `INTAKE_PENDING` 이 있는지 확인
- 없으면 「전이 아님」인지 확인
- 생성 후 후속 절차/조건 흐름으로 처리되는지 확인
- 관련 서비스에서 상태 자동 전환 코드가 있는지 확인

**API 체크**

- 이 전이를 직접 호출하는 API가 있는지 확인
- 있으면 상태 검증이 있는지 확인
- 없으면 생성 API 후 별도 후속 절차인지 기록

**UI 체크**

- 생성 직후 intake 성격 액션/버튼이 보이는지 확인
- 사용자가 상태 전이처럼 오해할 만한 문구가 있는지 확인

**운영·감사 체크**

- 직접 운영 통제 축이 있는지 확인
- 직접 축이 약하면 **—** 유지 가능 여부 검토

**판정 기록** — 아래 **네 가지 중 하나**로 임시 고정

- 실제 전이
- 조건 흐름
- 비전이 처리
- 구현 공백

**실무 메모란**

- 「전이 테이블 존재/부재」
- 「생성 후 후속 절차 여부」
- 「API 직접 호출 여부」
- 「UI 오해 가능 문구 여부」

**기입 예시 초안(형식만):** [PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_RESULT_EXAMPLE.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_RESULT_EXAMPLE.md) — [EVIDENCE-20260421-195].

**실기입 점검 순서:** [PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_FILL_STEPS.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_FILL_STEPS.md) — [EVIDENCE-20260421-196].

---

## 4. P1-B — `REVIEW_PENDING` → `DRAFTING`

**상위 판정**

- 고정 판정: **미해소**
- 분류: 전이 vs 문서 API 합의 필요

**서버 체크**

- 상태 전이 로직에서 `REVIEW_PENDING` → `DRAFTING` 을 직접 허용하는지 확인
- 문서 생성 서비스가 상태를 바꾸는지 확인
- 문서 작성 진입과 상태 전이가 분리돼 있는지 확인

**API 체크**

- 문서 생성/초안 생성 라우트가 있는지 확인
- 해당 라우트가 상태 변경을 함께 수행하는지 확인
- 상태 검증과 문서 생성 검증이 분리돼 있는지 확인

**UI 체크**

- 검토대기 상태에서 「작성 시작」 또는 유사 액션이 보이는지 확인
- 그 액션이 상태 전이인지 문서 작업 진입인지 사용자 입장에서 구분되는지 확인

**운영·감사 체크**

- 직접 운영 통제선이 있는지 확인
- 운영보다 문서/API 흐름이 핵심인지 기록

**판정 기록**

- 실제 상태 전이
- 문서 API 흐름
- 혼합 구조
- 구현 공백

**실무 메모란**

- 「문서 생성 API 존재 여부」
- 「상태 변경 호출 동반 여부」
- 「UI 액션 명칭과 실제 동작 일치 여부」

---

## 5. P1-C — `APPROVED` → `CLOSED`

**상위 판정**

- 고정 판정: **미해소**
- 분류: 문서 허용 표현 vs 실제 종료 액션 분리 필요

**서버 체크**

- `CLOSE_CASE` 또는 동등 종료 액션이 서비스/정책 함수에 존재하는지 확인
- 승인 상태에서만 종료 가능한지 확인
- 자동 종료가 아니라 명시 액션 기반인지 확인

**API 체크**

- 종료 관련 라우트가 있는지 확인
- 해당 라우트가 `APPROVED` 상태를 요구하는지 확인
- 잘못된 상태에서 종료 요청 시 거부되는지 확인

**UI 체크**

- 승인 상태에서 종료 버튼/액션이 보이는지 확인
- 승인 이전 상태에서는 숨김/차단되는지 확인
- 종료 액션 명칭이 문서 표현과 맞는지 확인

**운영·감사 체크**

- 종료 이력이 감사로그/운영 흐름에 남는지 확인
- 누가 종료 책임 주체인지 확인
- 승인과 종료가 운영상 동일 단계로 오해되지 않는지 확인

**판정 기록**

- 명시 종료 액션 존재
- 자동 종료로 처리
- 문서 표현만 존재
- 구현 공백

**실무 메모란**

- 「종료 route/service 존재 여부」
- 「승인 상태 요구 여부」
- 「감사 흔적 존재 여부」
- 「문서 표현과 실제 동작 일치 여부」

---

## 6. P1-D — `HOLD` → `REJECTED`

**상위 판정**

- 고정 판정: **미해소**
- 분류: 정책 합의 필요 + `REJECT_CASE` from-state 역점검 필요

**서버 체크**

- `REJECT_CASE` 허용 출발 상태 목록에 `HOLD` 가 포함되는지 확인
- 정책 함수/전이 테이블에서 `HOLD` → `REJECTED` 가 허용/금지 중 무엇인지 확인
- 예외 처리 로직이 있는지 확인

**API 체크**

- 거절 관련 라우트가 있는지 확인
- `HOLD` 상태에서 호출 시 허용/거부되는지 확인
- 에러 응답 또는 상태 검증이 명시되는지 확인

**UI 체크**

- 보류 상태에서 거절 버튼/액션이 노출되는지 확인
- 노출된다면 실제로 동작 가능한지, 아니면 오해 소지가 있는지 확인

**운영·감사 체크**

- 보류 후 거절이 운영 절차상 허용되는지 확인
- 거절 이력/사유/승인 주체가 감사 가능한지 확인
- 정책 문서와 운영 문구가 충돌하지 않는지 확인

**판정 기록**

- 정책상 허용 + 구현 있음
- 정책상 금지 + 구현 차단
- 정책 미합의
- 구현 공백

**실무 메모란**

- 「`REJECT_CASE` from-state 목록」
- 「`HOLD` 상태 UI 액션 노출 여부」
- 「거절 이력/사유 감사 가능 여부」

---

## 7. P1 4건 결과 표

| 행 | 서버 | API | UI | 운영·감사 | 핵심 확인 질문 | 임시 판정 |
| --- | --- | --- | --- | --- | --- | --- |
| **P1-A** | ☐ | ☐ | ☐ | ☐ | 전이인가, 조건 흐름인가 | |
| **P1-B** | ☑ | ☑ | ☑ | ☑ | 전이인가, 문서 API 흐름인가 | 혼합+추가 확인 ([199]) |
| **P1-C** | ☑ | ☑ | ☑ | ☑ | 종료가 명시 액션인가 | 명시 종료+추가 확인 ([200]) |
| **P1-D** | ☑ | ☑ | ☑ | ☑ | `HOLD`에서 거절이 허용되는가 | 정책 금지+구현 차단 ([201]) |

**체크 표기 규칙** (SHEET [4축 정의](./PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md) 와 동일 해석)

| 기호 | 의미 |
|------|------|
| **☐** | 해당 축에서 **근거 미입증** (미점검) |
| **☑** | 해당 축에서 **근거 확인** |
| **—** | 해당 행에서 그 축이 **직접 관련 약함** |

---

## 8. 역점검 후 기록 규칙

각 행마다 최소 아래 **3가지**는 남긴다.

- 확인한 **파일 경로**
- 확인한 **함수/라우트/컴포넌트** 이름
- **판정 한 줄**

**예시 형식**

```
파일:
확인 지점:
결과:
메모:
```

**정식 기록 양식:** [PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_RESULT_TEMPLATE.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_RESULT_TEMPLATE.md) — [EVIDENCE-20260421-194].

---

## 9. 전제 2 판정 규칙

- P1 4건 중 **하나라도 미확정**이면 **전제 2 상향 금지**
- P1 결과만으로 전제 2 전체를 올리지 **않음**
- 다만 P1이 정리되면 OPEN·DENY 일부 해석이 같이 정리될 수 있음
- 역점검 후에는 새 **`[EVIDENCE-YYYYMMDD-00n]`** 블록으로 증빙 추가

---

## 10. 가장 짧은 실행 순서

**[192] 확인 → 서버 코드 확인 → API 라우트 확인 → UI 액션 확인 → 운영·감사 확인 → P1 4건 결과 표 채움 → 새 증빙 추가**

---

## 문서에 붙일 한 줄 결론

P1-A~D 실제 코드 역점검은 **전이·정책·구현 공백의 핵심 축**을 확인하는 단계이며, **서버 → API → UI → 운영·감사** 순서로 각 행의 **실제 통제 연결 근거**를 확인해야 한다.
