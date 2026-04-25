# Batch A-2 수동 점검 체크리스트 (V1)

**관련**

- 코드: `src/app/api/cases/[caseId]/interview/route.ts` · `.../interview/complete/route.ts`
- 증빙: `IMPLEMENTATION_EVIDENCE.md` **§[EVIDENCE-20260423-275]** (수동 점검 **기록**)

**API 필드명:** POST 본문 키는 구현 기준 **`questionKey`** 입니다. (일부 절차서에서 `questionId`로 쓰인 경우, 여기서는 **`questionKey`**로 치환해 호출하세요.)

---

## 1) 비로그인 시나리오

### 1-1. 인터뷰 조회 GET

- **대상:** `GET /api/cases/[caseId]/interview`
- **조건:** 로그인 세션 없이 호출
- **확인사항:**
  - 401 또는 인증 실패 응답인지
  - 응답 포맷이 전역 API 에러 포맷과 충돌하지 않는지

### 1-2. 인터뷰 저장 POST

- **대상:** `POST /api/cases/[caseId]/interview`
- **조건:** 로그인 세션 없이 호출
- **body 예시:**

```json
{
  "questionKey": "q-basic-1",
  "value": "테스트"
}
```

- **확인사항:**
  - 401 또는 인증 실패 응답인지
  - 서버 에러가 아닌 **인증** 에러로 처리되는지

### 1-3. 인터뷰 완료 POST

- **대상:** `POST /api/cases/[caseId]/interview/complete`
- **조건:** 로그인 세션 없이 호출
- **body 예시:** `{}`
- **확인사항:**
  - `UnauthorizedError` 기준 응답인지
  - `ok: false` 계열 에러 응답으로 내려오는지
  - 프런트가 실패를 정상 인식하는지

---

## 2) 잘못된 payload 시나리오

**전제:** 아래 2-1~2-5, 2-4·2-5 **성공** 케이스는 **로그인 세션(유효 쿠키) + 유효 `caseId`**가 있어야 함. 비로그인이면 401이 선행됨.

### 2-1. object 값 전달

- **body:**

```json
{
  "questionKey": "q-basic-1",
  "value": { "foo": "bar" }
}
```

- **기대:** 저장 실패 · `ValidationError` · 메시지: `value는 string, number, boolean, string[], null 중 하나여야 합니다.`

### 2-2. number[] 전달

- **body:**

```json
{
  "questionKey": "q-basic-1",
  "value": [1, 2]
}
```

- **기대:** 저장 실패 · 동일 `ValidationError` 메시지

### 2-3. NaN 성격 값

- **JSON**에는 `NaN`이 안전하지 않으므로 **방식 A**(클라이언트 직렬화) 또는 **방식 B**(서버/테스트)로 점검.
- **기대:** `Number.isFinite` 불통과 · 저장 실패 · 동일 `ValidationError` 메시지

### 2-4. value 누락

- **body:**

```json
{
  "questionKey": "q-basic-1"
}
```

- **기대:** 서버에서 `undefined` → `null` 로 간주 · 검증 통과 · 저장 성공 · 응답: `ok({ saved: true, flow })` 형태

### 2-5. string[] 정상 입력

- **body:**

```json
{
  "questionKey": "q-multi-1",
  "value": ["A", "B"]
}
```

- **기대:** 저장 성공 · `ok({ saved: true, flow })` 형태

---

## 3) STAFF 권한 시나리오

### 3-1 ~ 3-3

- **STAFF** + 사건 **배정(안 A)** 가정 시 `GET` / `POST` / `interview/complete` **정책 일치** 여부
- **불일치** 시: `IMPLEMENTATION_EVIDENCE` **§[EVIDENCE-20260423-275]**에 **「정책/구현 불일치 후보」**로 기록

---

## 4) 완료 후 상태 전이 시나리오

### 4-1. 필수 응답 누락 → 완료

- **기대:** 완료 실패 · 사건 상태 변경 없음

### 4-2. 필수 응답 충족 → 완료

- **기대:** 완료 성공 · `CASE_LIFECYCLE`·`allowed-actions` **정의서** 기준 **다음** 상태 전이

### 4-3. 완료 직후 GET interview

- **기대:** 최신 flow / completion 반영 여부

### 4-4. 완료 직후 사건 상세

- **기대:** 상태 배지·`allowedActions` 갱신

---

## 기대 응답표

| 구분 | 요청 | 조건 | 기대 결과 | 비고 |
|------|------|------|-----------|------|
| AUTH-GET-01 | GET /interview | 비로그인 | 401 계열 실패 | 인증 실패 |
| AUTH-POST-01 | POST /interview | 비로그인 | 401 계열 실패 | 인증 실패 |
| AUTH-COMP-01 | POST /interview/complete | 비로그인 | 401 계열 실패 | UnauthorizedError |
| PAYLOAD-01 | POST /interview | `value: {foo:"bar"}` | 실패 | ValidationError |
| PAYLOAD-02 | POST /interview | `value: [1,2]` | 실패 | ValidationError |
| PAYLOAD-03 | POST /interview | 비정상 number | 실패 | `Number.isFinite` 불통과 |
| PAYLOAD-04 | POST /interview | value 누락 | 성공 | `undefined` → `null` |
| PAYLOAD-05 | POST /interview | `value: ["A","B"]` | 성공 | `string[]` 허용 |
| STAFF-GET-01 | GET /interview | STAFF | 정책 기준 성공/실패 | 권한정의서 대조 |
| STAFF-POST-01 | POST /interview | STAFF | 정책 기준 성공/실패 | 권한정의서 대조 |
| STAFF-COMP-01 | POST /interview/complete | STAFF | 정책 기준 성공/실패 | 완료 권한 |
| COMPLETE-01 | POST /interview/complete | 필수 누락 | 실패 | 상태 변화 없음 |
| COMPLETE-02 | POST /interview/complete | 필수 충족 | 성공 | 상태 전이 |
| COMPLETE-03 | GET /interview | 완료 직후 | 성공 | flow 반영 |
| COMPLETE-04 | 사건 상세 | 완료 직후 | 성공 | 상태 / allowedActions |

---

## 수동 점검 기록 템플릿

### A-2 수동 점검 결과

- [ ] **AUTH-GET-01** 비로그인 `GET /api/cases/[caseId]/interview`
  - 결과:
  - 실제 상태코드:
  - 응답 요약:
  - 판정: PASS / FAIL

- [ ] **AUTH-POST-01** 비로그인 `POST /api/cases/[caseId]/interview`
  - 결과:
  - 실제 상태코드:
  - 응답 요약:
  - 판정: PASS / FAIL

- [ ] **AUTH-COMP-01** 비로그인 `POST /api/cases/[caseId]/interview/complete`
  - 결과:
  - 실제 상태코드:
  - 응답 요약:
  - 판정: PASS / FAIL

- [ ] **PAYLOAD-01** object 값 전달
  - body:
  - 실제 상태코드:
  - 실제 메시지:
  - 기대 메시지 일치 여부:
  - 판정: PASS / FAIL

- [ ] **PAYLOAD-02** number[] 전달
  - body:
  - 실제 상태코드:
  - 실제 메시지:
  - 기대 메시지 일치 여부:
  - 판정: PASS / FAIL

- [ ] **PAYLOAD-03** 비정상 number
  - 재현 방식:
  - 실제 상태코드:
  - 실제 메시지:
  - 판정: PASS / FAIL / 보류

- [ ] **PAYLOAD-04** value 누락 → null 처리
  - body:
  - 실제 상태코드:
  - saved 값:
  - flow 반환 여부:
  - 판정: PASS / FAIL

- [ ] **PAYLOAD-05** string[] 허용
  - body:
  - 실제 상태코드:
  - saved 값:
  - flow 반환 여부:
  - 판정: PASS / FAIL

- [ ] **STAFF-GET-01** STAFF 조회
  - 결과:
  - 정책 일치 여부:
  - 판정: PASS / FAIL / 확인필요

- [ ] **STAFF-POST-01** STAFF 저장
  - 결과:
  - 정책 일치 여부:
  - 판정: PASS / FAIL / 확인필요

- [ ] **STAFF-COMP-01** STAFF 완료
  - 결과:
  - 정책 일치 여부:
  - 판정: PASS / FAIL / 확인필요

- [ ] **COMPLETE-01** 필수 누락 시 완료 차단
  - 결과:
  - 상태 변경 없음 확인:
  - 판정: PASS / FAIL

- [ ] **COMPLETE-02** 필수 충족 후 완료 성공
  - 결과:
  - 상태 전이 확인:
  - 판정: PASS / FAIL

- [ ] **COMPLETE-03** 완료 후 인터뷰 재조회
  - 결과:
  - completion / flow:
  - 판정: PASS / FAIL

- [ ] **COMPLETE-04** 완료 후 사건 상세
  - 결과:
  - 상태 배지:
  - allowedActions:
  - 판정: PASS / FAIL

---

## 문서 잠금 (A-2 수동 **세트**)

**이 문서** `BATCH_A2_MANUAL_CHECKLIST_V1.md`와 `IMPLEMENTATION_EVIDENCE` **§[EVIDENCE-20260423-275]** 는, A-2 **수동 점검** **절차·기대표·템플릿**을 **한** **곳**에 **고정**한 **A-2 수동 문서 세트**로 **잠겼다**. (체크 **PASS/FAIL** **기입**이 **끝난** **선**에서 **운영** **증빙**으로 **사용**한다.)

**STAFF-***·**COMPLETE-***(완료 **후** **상태**·`allowedActions`) **중** **세션·DB**·**로그인** **실** **점검**이 **필요**한 **항목**은, **별도** **날짜**·**환경** **추가** **증빙** **블록**으로 **닫는다** (이 **세트** **잠금** **과** **분리**).

**다음 실작업 (코드·문서):** **Batch A-4** **응답** **전역** **정렬** — `IMPLEMENTATION_EVIDENCE` **[276]**.

---

## 한 줄 (닫힘)

A-2 **수동** **문서** **세트**는 **잠겼**고, **이어서** **A-4** **응답** **전역** **정렬** **([276])**; **STAFF** **완료**·**완료** **후** **상태**·`allowedActions` **실** **검**은 **세션/DB** **증빙**으로 **추가** **마감**한다.
