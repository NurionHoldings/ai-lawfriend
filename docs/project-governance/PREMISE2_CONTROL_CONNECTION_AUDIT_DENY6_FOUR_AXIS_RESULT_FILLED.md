# DENY-6 실제 점검 결과 (실기입)

| 항목 | 내용 |
|------|------|
| 대상 | **DENY-6** — `APPROVED` → `IN_INTERVIEW` |
| 빈 서식 | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_RESULT_TEMPLATE.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY1_FOUR_AXIS_RESULT_TEMPLATE.md) — §1~9 치환 |
| 점검 순서 | [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY6_FOUR_AXIS_FILL_STEPS.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY6_FOUR_AXIS_FILL_STEPS.md) |
| 증빙 | [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **[EVIDENCE-20260421-224]** |

---

## 1) 기본 정보

- **행 번호:** DENY-6
- **대상 전이:** `APPROVED` → `IN_INTERVIEW`
- **문서 축 고정 판정:** DENY 유지·잠금
- **유지 사유:** 이력 왜곡 방지
- **보조 해석:** 재개는 §5의 별도 축(`REOPEN_CASE`)과 구분

**점검 기준 문서**

- [CASE_LIFECYCLE_TRANSITION_SUMMARY.md](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) §6 / §6-1
- [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_FIRST_PASS_DRAFT.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_FIRST_PASS_DRAFT.md)
- [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_ROW_ENHANCEMENT_DRAFT.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_ROW_ENHANCEMENT_DRAFT.md)
- [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY6_FOUR_AXIS_FILL_STEPS.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY6_FOUR_AXIS_FILL_STEPS.md)

- **점검 일시:** 2026-04-21
- **점검자:** 에테르니언

---

## 2) 문서 기준 재확인 결과

- **확인 결과:** 일치
- **상세 메모:**
  - §6 본표에서 `APPROVED` → `IN_INTERVIEW`는 DENY로 고정되어 있다.
  - §6-1 DENY-6의 문서 축 고정 판정은 DENY 유지·잠금, 유지 사유는 이력 왜곡 방지로 명시되어 있다. 또한 [181] 이후 재개 축은 §5·`REOPEN_CASE`로 별도 정합된다고 적혀 있어, 본 행은 재개 허용과 직접 복귀 금지를 구분하는 항목임이 분명하다.
  - 역점검 완료 조건은 UI·API·서버·운영 중 최소 1축에서 금지 위반 노출·실행 불가 입증으로 잠겨 있다.
- **조치 필요 여부:** 없음
- **조치 내용:** —

**한 줄 정리:** §6 본표 / §6-1 / DENY 실작업 흐름의 DENY-6 문서 기준은 일치하며, 재개 예외 축과 직접 복귀 금지의 구분도 유지되고 있다.

---

## 3) UI 축 점검 결과

- **확인 경로:** 미확인
- **UI 노출 여부:** 미확인
- **실행 가능 여부:** 미확인
- **근거 위치:** 현재 업로드 파일만으로는 사건 UI 컴포넌트 실코드 미제공
- **판정:** ☐
- **판정 사유:** §6 DENY는 UI/API 노출·실행 역점검 과제로 남아 있다고만 확인되며, `APPROVED` 상태에서 인터뷰 복귀/재개 액션이 실제로 비노출/비활성인지 확인할 실파일이 아직 없다. 재개 UI가 있더라도 그것이 `REOPEN_CASE` 예외 축인지, `APPROVED` → `IN_INTERVIEW` 직접 복귀와 구분되는지까지는 현재 자료만으로 확정할 수 없다.

---

## 4) API 축 점검 결과

- **확인 route / handler:** 미확인
- **입력 조건:** 현재 상태 = `APPROVED`, 목표 상태/액션 = `IN_INTERVIEW` 또는 재개 계열 액션
- **응답 결과:** 미확인
- **응답 형태:** 미확인
- **근거 위치:** 현재 업로드 파일만으로는 `APPROVED` → `IN_INTERVIEW` 요청을 직접 차단하는 route/handler 본문 미제공
- **판정:** ☐
- **판정 사유:** §6-1은 API 차단이 필요하다고 잠겨 있으나, DENY-6에 대한 실제 응답 코드, 에러 메시지, 분기 위치는 아직 확보되지 않았다. 재개 전용 API가 있더라도 `APPROVED` 상태를 허용하는지 여부는 실코드 확인 전까지 확정할 수 없다.

---

## 5) 서버 축 점검 결과

**정적 참고**

- §6 DENY 8행 전체는 impl_ref 전부 공백이며, 코드 직접 대응 행이 없을 수 있는 간접 검증 과제로 분류돼 있다.
- §6-1 DENY-6의 설명은 재개 축이 §5·`REOPEN_CASE`와 별도 정합된다고 적고 있으므로, 서버 축 점검의 핵심은 `REOPEN_CASE`가 `APPROVED`를 출발 상태에 포함하는지 여부와, `APPROVED` → `IN_INTERVIEW` 직접 규칙이 존재하는지 여부다.
- 해소 조건표는 §6 DENY 8행에 대해 UI 차단, API 차단, 서버 검증, 운영/감사 규칙 중 최소 1개 이상 연결을 요구한다.

**실행 경로 확인:** 미확인

- **근거 위치:** 현재 업로드 파일만으로는 `case-lifecycle.ts`, `REOPEN_CASE`, `applyCaseStatusTransition`, `evaluateCaseTransition`, `checkCaseTransitionOrThrow`의 DENY-6 직접 실행 경로 본문 미제공
- **판정:** ☐
- **판정 사유:** 정적 문서 기준은 확보됐지만, 최종 판정에 필요한 재개 액션 출발 상태와 전이 유틸 실행 경로 확인은 아직 끝나지 않았다. `check-status`는 직접 근거가 아니므로 서버 축 ☑의 근거로 사용할 수 없다.

---

## 6) 운영·감사 축 점검 결과

- **확인 문서/근거:** 미확인
- **운영상 허용 여부:** 미확인
- **감사/기록 요구:** 미확인
- **근거 위치:** 현재 업로드 파일만으로는 DENY-6 전용 운영 규칙/감사 절차 문서 미제공
- **판정:** ☐
- **판정 사유:** §6-1과 해소 조건표는 운영·감사 축도 가능한 통제 근거로 열어 두고 있으나, 승인 완료 후 인터뷰 복귀 금지 및 재개 예외 축 구분에 대한 직접 운영 문구는 아직 확보되지 않았다.

---

## 7) 4축 최종 정리

- **서버:** ☐
- **API:** ☐
- **UI:** ☐
- **운영·감사:** ☐
- **최소 1축 이상 ☑ 여부:** 아니오
- **현재 단계 판정:** 문서 기준 확정 완료 / 재개 예외 축과 직접 복귀 금지의 통제 근거 실점검 전

**한 줄 결론:** DENY-6는 문서 축은 완전히 고정됐지만, 업로드된 자료만으로는 UI·API·서버·운영 실근거를 아직 확정할 수 없어 4축은 모두 ☐ 유지가 맞다. 다만 본 행의 핵심 쟁점은 재개 예외 허용과 승인 후 직접 복귀 금지의 구분임이 문서상 분명하다.

---

## 8) 본문 반영용 갱신 문안

**실무 한 줄**

`APPROVED` → `IN_INTERVIEW`는 이력 왜곡 방지형 DENY로 문서상 잠겨 있으며, 현재는 재개 예외 축과 직접 복귀 금지의 통제 연결 실근거 확인 전 단계다.

**근거 메모**

- §6 본표와 §6-1에서 DENY-6는 `APPROVED` → `IN_INTERVIEW`, 유지 사유는 이력 왜곡 방지로 일치한다.
- §6-1은 재개 축이 §5·`REOPEN_CASE`와 별도 정합된다고 명시하므로, 본 행은 재개 허용 예외와 승인 후 직접 복귀 금지를 구분하는 항목이다.
- 현재 업로드 파일만으로는 재개 UI, 재개 API, `REOPEN_CASE` 출발 상태, 운영 규칙의 직접 근거가 없어 4축은 모두 ☐로 유지한다.

**남은 이슈**

- `APPROVED` 상태에서 인터뷰 복귀/재개 액션 UI 노출 여부 확인 필요
- 상태 변경/재개 API의 직접 차단 여부 확인 필요
- `REOPEN_CASE` 출발 상태 및 전이 유틸 직접 문구 확인 필요
- 운영·감사 규칙 직접 문구 확인 필요

**다음 작업**

- 사건 UI / API / 재개 액션 / 전이 유틸 실파일 기준으로 DENY-6 4축 근거 재확인
- 최소 1축 이상 ☑ 확보 후 `PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_ROW_ENHANCEMENT_DRAFT`와 `PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_FIRST_PASS_DRAFT` 갱신
- 증빙은 **[218]**(점검 순서)·**[224]**(실기입) 흐름에 맞춰 `IMPLEMENTATION_EVIDENCE.md`에 누적

---

## 9) evidence 반영용 요약

**작업 목적:** DENY-6 문서 축 일치·재개 축 구분 확정, 4축은 점검 범위 한계상 ☐ 유지 고정.

**수정 파일(반영 후):** 본 실기입, ROW_ENHANCEMENT, FIRST_PASS, SHEET, FILL_STEPS 메타, `IMPLEMENTATION_EVIDENCE.md` **[224]**.

---

## 축약본 (복사용)

```markdown
## DENY-6 실제 점검 결과 (2026-04-21 · 에테르니언)

- 대상 전이: `APPROVED` → `IN_INTERVIEW`
- 문서 축: 일치 · 조치 없음 · 재개는 §5 `REOPEN_CASE`와 구분
- 4축: 모두 ☐ · 최소 1축 ☑ 아니오
- 단계: 문서 기준 확정 완료 / 재개·직접 복귀 통제 실점검 전
- 상세: PREMISE2_CONTROL_CONNECTION_AUDIT_DENY6_FOUR_AXIS_RESULT_FILLED.md · [224]
```
