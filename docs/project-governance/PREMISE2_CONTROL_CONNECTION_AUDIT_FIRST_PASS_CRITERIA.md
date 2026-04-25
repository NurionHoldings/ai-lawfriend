# 17행 통제 연결 역점검표 1차 기입 기준표

| 항목 | 내용 |
|------|------|
| 기준 문서 | [PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md) |
| 상위 판정표 | [CASE_LIFECYCLE_TRANSITION_SUMMARY.md](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) **§9-1** · **§11-1** · **§6-1** |
| 증빙 흐름 | 역점검표 [186] · 기준표 [187] · P1 [188] · OPEN [189] · DENY [190] · 17행 1차 채움 요약 [191] · 코드 역점검 우선순위 [192] · P1 체크리스트 [193] · P1 결과 템플릿 [194] · P1-A 기입 예시 [195] · P1-A 실기입 순서 [196] · P1-A 실기입본 [197] · `INTAKE_PENDING` 전역 추적 [198] · P1-B 실기입본 [199] · P1-C 실기입본 [200] · P1-D 실기입본 [201] · **P1 4건 종합 판정표 [202]** · **OPEN-1~5 실작업 체크리스트 [203]** · **OPEN-1 실작업 순서 [204]** · **OPEN-1 문구 보강 [205]** · **OPEN-2 실작업 순서 [206]** · **OPEN-2 문구 보강 [207]** · **OPEN-3 실작업 순서·문구 보강 [210]** · **OPEN-4 실작업 순서 [208]** · **OPEN-4 문구 보강 [209]** · **OPEN-5 실작업 순서·문구 보강 [211]** ([IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md)) |

---

## 0. 목적

이 표의 목적은 전제 2 잔여 **17행**을 문서 판정 상태에서 끝내지 않고, 각 항목이 실제 제품 통제선에서 **어느 축(UI / API / 서버 / 운영·감사)** 으로 입증되는지 **1차로 채우는 것**이다.

즉, **「문서상 미해소」**를 **「실제 통제 연결 근거 있음 / 없음」**으로 바꾸는 단계다.

---

## 1. 적용 범위

**총 17행**

- **P1 A~D** 4행  
- **§11 OPEN-1 ~ OPEN-5** 5행  
- **§6 DENY-1 ~ DENY-8** 8행  

**상위 판정표 연결**

- P1 계열 → **§9-1**
- OPEN 계열 → **§11-1**
- DENY 계열 → **§6-1**

**원칙**

- 상위 판정표의 **「미해소」** 판정을 **임의로 바꾸지 않음.**
- 이번 표는 **통제 연결 1차 기입**이 목적이다.
- **전제 2 상향 판정은 이 표를 채웠다고 자동으로 하지 않음.**

---

## 2. 셀 기입 규칙

[PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md)의 기입 규칙을 **그대로** 사용한다.

| 기호 | 의미 |
|------|------|
| **☑** | 해당 축에서 **통제 근거가 확인됨** |
| **☐** | 해당 축에서 **아직 통제 근거를 확인하지 못함** |
| **—** | 해당 행에는 그 축이 **구조상 직접 관련 없음** |

**기입 금지**

- 추정으로 ☑ 표시 금지.
- “아마 막힐 것 같음” 식 서술 금지.
- 코드 미확인 상태에서 서버/API를 ☑로 올리지 않음.
- 운영 절차가 문서에만 있고 실제 증빙이 없으면 운영·감사를 ☑로 올리지 않음.

---

## 3. 4축 판정 기준

### A. UI 축

**다음 중 하나라도 명확하면 ☑**

- 버튼 비노출  
- 상태별 액션 숨김  
- 화면 진입 차단  
- 잘못된 상태에서 조작 불가  
- 안내 문구로 금지/보류가 분명히 드러남  

**아래면 ☐**

- 화면상 막히는 흔적 없음  
- 버튼은 보이는데 실제 제한 불명확  
- 문구만 애매하고 액션 차단은 없음  

**직접 관련이 없으면 —**

### B. API 축

**다음 중 하나라도 명확하면 ☑**

- 전용 라우트에서 허용 상태 검사  
- 잘못된 상태 요청 시 4xx/거부 응답  
- 액션별 권한/상태 검증이 라우트에 존재  
- 요청 자체가 특정 상태/역할에서 막힘  

**아래면 ☐**

- 라우트는 있으나 상태 검증 불명확  
- 상태와 무관하게 호출 가능해 보임  
- 문서상 액션인데 API 근거를 못 찾음  

**직접 관련이 없으면 —**

### C. 서버 축

**다음 중 하나라도 명확하면 ☑**

- 서비스/도메인 로직에서 최종 차단  
- 상태 전이 테이블/정책 함수가 명시적으로 막음  
- 서버단 검증 오류가 분명함  
- UI/API를 우회해도 서버에서 불허됨  

**아래면 ☐**

- 서버 서비스의 최종 판정 근거를 못 찾음  
- API는 있어도 서비스 로직 제한 불명확  
- 실제 구현 공백 가능성이 남아 있음  

**직접 관련이 없으면 —**

### D. 운영·감사 축

**다음 중 하나라도 명확하면 ☑**

- 감사로그에 남김  
- 운영 절차/관리자 확인 흐름 존재  
- 예외 처리 시 운영상 차단 또는 추적 가능  
- 검증/승인/보류 이력으로 통제가 보강됨  

**아래면 ☐**

- 운영 규칙은 있으나 실제 추적 근거 없음  
- 감사 흔적이나 관리자 통제선 확인 안 됨  

**직접 관련이 없으면 —**

---

## 4. 행별 1차 기입 우선순위

### 1순위 — P1 4행

**이유:** 전이/정책/구현 공백 논점이 가장 크기 때문.

- P1-A `CREATED` → `INTAKE_PENDING`
- P1-B `REVIEW_PENDING` → `DRAFTING`
- P1-C `APPROVED` → `CLOSED`
- P1-D `HOLD` → `REJECTED`

### 2순위 — §11 OPEN 5행

**이유:** notes 수준을 넘어 실제 통제 연결이 있는지 확인해야 하기 때문.

- OPEN-1 ~ OPEN-5

### 3순위 — §6 DENY 8행

**이유:** 문서 잠금은 거의 끝났고 **실제 차단 입증**만 남았기 때문.

- DENY-1 ~ DENY-8

---

## 5. 행 하나를 채울 때의 기록 형식

각 행은 아래 순서로만 판단한다.

1. **Step 1. 상위 판정표 확인** — 이 행이 §9-1 / §11-1 / §6-1 중 어디에서 왔는지, 상위 판정이 미해소인지, 상위 판정 문구와 이번 기입이 충돌하지 않는지 확인한다.  
2. **Step 2. 4축 증거 수집** — UI · API · 서버 · 운영·감사 근거를 각각 확인한다.  
3. **Step 3. 셀 표기** — 근거 있으면 ☑, 근거 없으면 ☐, 구조상 무관하면 —.  
4. **Step 4. 실무 한 줄 작성** — “17행·최소 1축·판정표와 정합” 규칙에 맞게 한 줄. 상위 판정표와 모순되는 표현 금지. “해소 완료” 같은 상향 표현 금지.

---

## 6. 1차 기입의 최소 통과 기준

각 행은 아래 중 **하나**를 만족해야 **「1차 기입 완료」**로 본다.

- 최소 1축 이상 ☑ 확인  
- 또는 4축이 모두 ☐/— 이지만, **왜 아직 입증이 없는지** 실무 한 줄에 명시  
- 상위 판정표와 연결 근거가 분명함  

**주의**

- ☑가 1개 있어도 **전제 2가 자동 해소되는 것은 아님.**  
- ☐가 많다고 바로 **구현 오류로 단정하지 않음.**  
- 1차 기입은 **「현 상태 관찰」**이지 **「최종 유죄 판정」**이 아님.

---

## 7. 전제 2와의 관계

이 표를 채운 뒤에도 아래 원칙은 유지한다.

- P1 / OPEN / DENY의 **상위 미해소** 판정은 **유지 가능**  
- 17행 전부를 채워도 **전제 2는 자동 상향되지 않음**  
- 통제 연결이 **충분히 입증된 뒤에만** 재판정 가능  
- 재판정은 **반드시 새 증빙 블록**으로 남김  

---

## 8. 실무용 기입 예시 규칙

실무 한 줄은 아래 톤으로 맞춘다.

**좋은 예**

- “UI 비노출은 확인되나 API/서버 차단은 추가 확인 필요”  
- “서버 정책 함수에서 불허 확인, 운영·감사 축은 별도 입증 필요”  
- “문서상 DENY는 잠겼으나 실제 라우트 차단 근거는 아직 미확인”  

**나쁜 예**

- “대충 막혀 보임”  
- “아마 서버에서 막을 듯”  
- “문서상 맞으니 구현도 맞을 것”  
- “이제 해소된 것 같음”  

---

## 9. 최종 출력 형식 체크

17행을 다 채운 뒤 아래를 확인한다.

- [ ] 모든 행에 ☐ / ☑ / —가 들어갔는가  
- [ ] 모든 행에 **실무 한 줄**이 있는가  
- [ ] 상위 판정표 링크가 맞는가  
- [ ] P1 / OPEN / DENY 각각 **누락 행**이 없는가  
- [ ] 증빙 링크가 **최신 상태**와 맞는가  

---

## 10. 한 줄 실행 순서

상위 판정표 확인 → 4축 근거 확인 → 셀 기입(☐/☑/—) → 실무 한 줄 작성 → 17행 전부 반복 → **새 증빙 연결**

---

## 실무용 한 줄 결론

이번 1차 기입은 전제 2 잔여 17행을 **해소 판정**하려는 작업이 아니라, 각 행이 실제 제품 통제선(UI·API·서버·운영) **어디에 연결되는지 증거 기반으로 채우는 작업**이다.

**P1 4행 초안(선행 사례):** [PREMISE2_CONTROL_CONNECTION_AUDIT_P1_FIRST_PASS_DRAFT.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1_FIRST_PASS_DRAFT.md) — [EVIDENCE-20260421-188].

**P1-A~D 코드 역점검 체크리스트:** [PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_CHECKLIST.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_CHECKLIST.md) — [EVIDENCE-20260421-193].

**P1-A~D 역점검 결과 기록 템플릿:** [PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_RESULT_TEMPLATE.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_RESULT_TEMPLATE.md) — [EVIDENCE-20260421-194].

**P1-A 역점검 결과 기입 예시 초안:** [PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_RESULT_EXAMPLE.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_RESULT_EXAMPLE.md) — [EVIDENCE-20260421-195].

**P1-A 실기입용 점검 순서:** [PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_FILL_STEPS.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_FILL_STEPS.md) — [EVIDENCE-20260421-196].

**P1-A 역점검 결과 실기입본:** [PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_RESULT_FILLED.md) — [EVIDENCE-20260421-197].

**`INTAKE_PENDING` 전역 추적:** [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **[EVIDENCE-20260421-198]** — 실기입본 §2.1 보강.

**P1-B 역점검 결과 실기입본:** [PREMISE2_CONTROL_CONNECTION_AUDIT_P1B_CODE_REVIEW_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1B_CODE_REVIEW_RESULT_FILLED.md) — [EVIDENCE-20260421-199].

**P1-C 역점검 결과 실기입본:** [PREMISE2_CONTROL_CONNECTION_AUDIT_P1C_CODE_REVIEW_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1C_CODE_REVIEW_RESULT_FILLED.md) — [EVIDENCE-20260421-200].

**P1-D 역점검 결과 실기입본:** [PREMISE2_CONTROL_CONNECTION_AUDIT_P1D_CODE_REVIEW_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1D_CODE_REVIEW_RESULT_FILLED.md) — [EVIDENCE-20260421-201].

**P1 4건 종합 판정표:** [PREMISE2_CONTROL_CONNECTION_AUDIT_P1_SYNTHESIS_TABLE.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1_SYNTHESIS_TABLE.md) — [EVIDENCE-20260421-202].

**OPEN-1~OPEN-5 실작업 체크리스트:** [PREMISE2_CONTROL_CONNECTION_AUDIT_OPEN1-5_WORK_CHECKLIST.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_OPEN1-5_WORK_CHECKLIST.md) — [EVIDENCE-20260421-203] · §2 **OPEN-1 실작업용 점검 순서** — [EVIDENCE-20260421-204] · **OPEN-1 문구 보강(§11·시트)** — [EVIDENCE-20260421-205] · §3 **OPEN-2 실작업용 점검 순서** — [EVIDENCE-20260421-206] · **OPEN-2 문구 보강(§11·시트)** — [EVIDENCE-20260421-207] · §4 **OPEN-3 실작업용 점검 순서**·**OPEN-3 문구 보강(§11·시트·보류·`RESUME_CASE`)** — [EVIDENCE-20260421-210] · §5 **OPEN-4 실작업용 점검 순서** — [EVIDENCE-20260421-208] · **OPEN-4 문구 보강(§11·시트·§6 DENY-8 교차)** — [EVIDENCE-20260421-209] · §6 **OPEN-5 실작업용 점검 순서**·**OPEN-5 문구 보강(§11·시트·메타·재판정 추적)** — [EVIDENCE-20260421-211].

**§11 OPEN 5행 초안:** [PREMISE2_CONTROL_CONNECTION_AUDIT_OPEN_FIRST_PASS_DRAFT.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_OPEN_FIRST_PASS_DRAFT.md) — [EVIDENCE-20260421-189].

**§6 DENY 8행 초안:** [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_FIRST_PASS_DRAFT.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_FIRST_PASS_DRAFT.md) — [EVIDENCE-20260421-190].

**17행 통합 시트 1차 채움 상태 요약:** [PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET_FIRST_PASS_STATUS_SUMMARY.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET_FIRST_PASS_STATUS_SUMMARY.md) — [EVIDENCE-20260421-191].

**17행 실제 코드 역점검 우선순위:** [PREMISE2_CONTROL_CONNECTION_AUDIT_CODE_REVIEW_PRIORITY.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_CODE_REVIEW_PRIORITY.md) — [EVIDENCE-20260421-192].
