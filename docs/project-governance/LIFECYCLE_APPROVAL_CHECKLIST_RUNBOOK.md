# AI법친 승인 반영 체크리스트 (실행본)

| 항목 | 내용 |
|------|------|
| 기준 | [EVIDENCE-20260421-179] |
| 전제 2 | 정의서·요약표 **실제 승인 반영 전까지** **미충족 유지** |

---

## 0. 시작 전 고정 확인

### 기준선 재확인

- [ ] `npx tsc --noEmit` 실행
- [ ] `npm run lint` 실행
- [ ] `npm run verify:canonical-sources` 실행
- [ ] 위 3개 모두 정상인지 확인
- [ ] 이번 반영 대상이 **문서 본문**인지, **코드 수정이 아닌지** 확인

### 고정 원칙

- 상태 이름의 유일 기준은 `prisma/schema.prisma` 와 `src/lib/definitions/case-status.ts` 로 유지한다.
- 새 기능 추가보다 **기준문서 잠금**이 우선임을 다시 확인한다.
- 이번 반영은 **[179]**의 적용 순서대로만 진행한다.

---

## 1. A1 — `CASE_LIFECYCLE_DEFINITION.md` §5 표 교체

### 작업 위치

- `CASE_LIFECYCLE_DEFINITION.md` §5

### 실행

- [ ] [179]에서 지정한 **§8-4 (1) 교체 전문**을 기준으로 §5 표를 교체한다.
- [ ] 기존 §5 표 안의 **`REJECTED` → `CREATED`** (허용 서술 제거 대상)
- [ ] 기존 §5 표 안의 **`REJECTED` → `INTAKE_PENDING`** (동일)
- [ ] 위 2개가 **제거 대상**인지 다시 확인한다.
- [ ] **`REJECTED` → `IN_INTERVIEW`** 단일 재개 축으로 정렬되었는지 확인한다.
- [ ] **`CLOSED` → `IN_INTERVIEW`** 재개 예외가 반영되었는지 확인한다.

### 완료 확인

- [ ] 교체 후 §5가 **B2·B3의 `lifecycle_ref` 근거**로 사용 가능함을 확인한다.

---

## 2. A2 — `CASE_LIFECYCLE_DEFINITION.md` §10 bullet 치환

### 작업 위치

- `CASE_LIFECYCLE_DEFINITION.md` §10

### 실행

- [ ] 구 `CLOSED` 재진입 bullet 찾기
- [ ] 해당 bullet 삭제
- [ ] [179] 기준 **§8-4 (2)** 의 1줄 문안으로 치환

### 저장 전 대조

- [ ] §8-4 **(2)** 와 글자 단위로 대조
- [ ] 의미 변경 없이 **1줄 치환**인지 확인

---

## 3. A3 — `CASE_LIFECYCLE_DEFINITION.md` §11 bullet 치환

### 작업 위치

- `CASE_LIFECYCLE_DEFINITION.md` §11

### 실행

- [ ] 구 `REJECTED` → `CREATED` 재접수 bullet 찾기
- [ ] 해당 bullet 삭제
- [ ] [179] 기준 **§8-4 (3)** 의 1줄 문안으로 치환

### 저장 전 대조

- [ ] §8-4 **(3)** 와 글자 단위로 대조
- [ ] `REJECTED` 재개 축이 **`IN_INTERVIEW`** 기준과 충돌하지 않는지 확인

---

## 4. A4 — `CASE_LIFECYCLE_DEFINITION.md` §4~§8 통독 점검

### 통독 범위

- §4 · §5 · §6 · §7 · §8

### 점검 포인트

- [ ] MVP 흐름과 충돌 문구 없음
- [ ] §5 새 표와 설명 문안이 서로 모순되지 않음
- [ ] `REOPEN_CASE` 표현이 **`IN_INTERVIEW` 단일 재개** 축과 충돌하지 않음
- [ ] `CLOSED` 재개 표현이 §10과 **중복·충돌**하지 않음
- [ ] `REJECTED` 재개 표현이 §11과 **중복·충돌**하지 않음
- [ ] 어휘만 다르고 의미가 갈라지는 문장이 없는지 확인

### 통과 기준

- “표는 수정됐는데 본문 설명은 예전 상태” 같은 **잔존 충돌이 없음**

---

## 5. B1 — `CASE_LIFECYCLE_TRANSITION_SUMMARY.md` §5 요약표 행 삭제

### 작업 위치

- `CASE_LIFECYCLE_TRANSITION_SUMMARY.md` §5 요약표

### 실행

- [ ] `REJECTED` → `CREATED` 행 삭제
- [ ] `REJECTED` → `INTAKE_PENDING` 행 삭제

### 확인

- [ ] 삭제 후 요약표가 **A1 반영본**과 충돌하지 않는지 확인
- [ ] [175] **정합안 A**와 맞는지 확인

---

## 6. B2 — `REJECTED` → `IN_INTERVIEW` 통합

### 작업 위치

- `CASE_LIFECYCLE_TRANSITION_SUMMARY.md` §5 요약표

### 실행

- [ ] `REJECTED` 재개 관련 행이 여러 갈래로 남아 있지 않은지 확인
- [ ] **`REJECTED` → `IN_INTERVIEW`** 한 줄로 통합
- [ ] 액션이 **`REOPEN_CASE`** 기준인지 확인

### 확인

- [ ] 요약표의 재개 축이 **정의서 §5**와 동일한지 확인
- [ ] `lifecycle_ref`가 **A1 반영본**을 근거로 삼는지 확인

---

## 7. B3 — `CLOSED` → `IN_INTERVIEW` 정리

### 작업 위치

- `CASE_LIFECYCLE_TRANSITION_SUMMARY.md` §5 요약표

### 실행

- [ ] `CLOSED` → `IN_INTERVIEW` 행 정리
- [ ] `lifecycle_ref`가 정의서 §5를 정확히 가리키는지 확인

### 확인

- [ ] A1 **이전** 기준이 아니라 **갱신된 §5** 기준으로 연결되는지 확인
- [ ] §10 문안과 모순되지 않는지 확인

---

## 8. B4 — §11 OPEN 표 정리

### 작업 위치

- `CASE_LIFECYCLE_TRANSITION_SUMMARY.md` §11 OPEN

### 실행

- [ ] OPEN 관련 표·`notes` 확인
- [ ] A1~B3 반영 결과와 충돌하는 `notes` 수정
- [ ] 충돌 없으면 `notes` 유지
- [ ] 필요 시 `notes` 보강

### 확인

- [ ] [175] 정합안 A와 어긋나는 표현 없음
- [ ] OPEN 관련 문구가 현재 요약 구조를 깨지 않음

---

## 9. C1 — `IMPLEMENTATION_EVIDENCE.md` 최신 증빙 추가

### 작업 위치

- `IMPLEMENTATION_EVIDENCE.md` 의 **`## 실제 기록` 최상단**
- 기존 `[EVIDENCE-20260421-179]` **바로 위**

### 실행

- [ ] [179] **부록 C1** 복사
- [ ] 새 증빙 번호로 변경
- [ ] 승인 일시 기입
- [ ] 승인 근거 기입
- [ ] 수정 파일 목록 기입
- [ ] 검증 명령 3종 결과 기입
- [ ] 근거 메모 기입
- [ ] 다음 작업 기입

### 반드시 유지할 문구 성격

- [175] **정합안 A** 기준 반영 사실 명시
- **전제 2**는 이 블록만으로 **단독 상향되지 않음**을 유지
- 해소 조건표 §2 **잔여**가 남으면 **완충족**으로 올리지 않음

---

## 10. 최종 종료 체크

### 반영 직후

- [ ] `npx tsc --noEmit` 재실행
- [ ] `npm run lint` 재실행
- [ ] `npm run verify:canonical-sources` 재실행
- [ ] 3개 결과를 **C1 블록**에 실제 값으로 기입

### 최종 판정

- [ ] 정의서 A1~A4 반영 완료
- [ ] 요약표 B1~B4 반영 완료
- [ ] 증빙 C1 최상단 추가 완료
- [ ] 전제 2는 **“자동 충족”**으로 올리지 않음
- [ ] 별도 **해소 조건표** 기준으로 후속 재판정 예정

---

## 한 줄 실행 순서

`A1` → `A2`·`A3` → `A4` → `B1` → `B2` → `B3` → `B4` → `C1` → 검증 3종 재실행

---

## 상호참조

- 붙여넣기 원문: [CASE_LIFECYCLE_TRANSITION_SUMMARY.md](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) §8-4
- 적용 순서·부록 C1: [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) `[EVIDENCE-20260421-179]`
