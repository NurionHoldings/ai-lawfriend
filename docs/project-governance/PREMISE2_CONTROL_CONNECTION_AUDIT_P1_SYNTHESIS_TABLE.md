# P1 4건 종합 판정표

| 항목 | 내용 |
|------|------|
| 기준 증빙 축 | **[EVIDENCE-20260421-201]** — P1-D 실기입까지 누적 ([IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md)) |
| 상위 판정표 | [CASE_LIFECYCLE_TRANSITION_SUMMARY.md](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) **§9-1** |
| 반영 기준 | P1-A~D 각 [실기입본](./PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md) 메타·통합 시트 점검 메모 |

---

## 1. 종합 판정표

| 항목 | 전이/주제 | 현재 종합 판정 | 핵심 근거 | 4축 판정 | 남은 이슈 |
| --- | --- | --- | --- | --- | --- |
| **P1-A** | `CREATED` → `INTAKE_PENDING` | 직접 허용 전이 아님 + 조건 흐름·비전이 처리 후보 | `CASE_TRANSITIONS`에 직접 규칙 없음, `POST /api/cases`는 `status` 입력 거부, 기본값은 `CREATED`, 첫 인터뷰 저장은 `CREATED` → `IN_INTERVIEW` | UI ☐ / API ☐ / 서버 ☐ / 운영·감사 — | `INTAKE_PENDING` 실제 설정 경로 추가 추적 필요 |
| **P1-B** | `REVIEW_PENDING` → `DRAFTING` | 혼합 구조 + 추가 확인 필요 | 전이표에는 직접 규칙 없음, 그러나 문서 초안 생성 API가 `case.status = "DRAFTING"` 직접 갱신, UI는 진행 액션과 문서 목록 액션 전제가 다름 | UI ☑ / API ☑ / 서버 ☑ / 운영·감사 ☑ | `REVIEW_PENDING`에서 추가 초안 생성을 허용할지 합의 필요 |
| **P1-C** | `APPROVED` → `CLOSED` | 명시 종료 액션 존재 + 추가 확인 필요 | 직행 전이 없음, 실제는 `APPROVED` → `DELIVERED` → `CLOSED`, API와 UI도 이 2단계 구조를 따름, 다만 정의서 `APPROVED.next`에 `CLOSED`가 남아 있음 | UI ☑ / API ☑ / 서버 ☑ / 운영·감사 ☑ | 정의서 정합 수정 필요 |
| **P1-D** | `HOLD` → `REJECTED` | 정책상 금지 + 구현 차단 | `REJECT_CASE` `from`에 `HOLD` 없음, UI에서 반려 액션 미노출, API 검증 오류, `HOLD.next`에도 `REJECTED` 없음 | UI ☑ / API ☑ / 서버 ☑ / 운영·감사 ☑ | 현재 기준 추가 이슈 작음 |

**세부 증빙:** P1-A [197]·[198] · P1-B [199] · P1-C [200] · P1-D [201] — 각 실기입본·`IMPLEMENTATION_EVIDENCE.md` 참조.

---

## 2. 항목별 한 줄 결론

- **P1-A:** `INTAKE_PENDING`은 정의와 비교·UI는 존재하지만, 현재 저장소 기준 실제 설정 경로가 확인되지 않아 직접 전이로 보기 어렵습니다.
- **P1-B:** 전이표에는 없지만 문서 생성 API의 직접 상태 갱신으로 같은 효과가 발생하는 혼합 구조입니다.
- **P1-C:** 종료 액션은 분명히 있으나 `APPROVED` → `CLOSED` 직행이 아니라 `APPROVED` → `DELIVERED` → `CLOSED`라서 정의서 보정이 필요합니다.
- **P1-D:** 문서·전이표·UI·API가 모두 같은 방향으로 `HOLD` → `REJECTED`를 막고 있어 가장 깔끔하게 잠긴 항목입니다.

---

## 3. P1 4건 성격 분류

| 항목 | 성격 분류 |
| --- | --- |
| P1-A | 설정 경로 부재형 |
| P1-B | 우회 갱신형 |
| P1-C | 정의서-구현 불일치형 |
| P1-D | 정합된 차단형 |

---

## 4. 전제 2 관점 요약

| 항목 | 요약 |
| --- | --- |
| P1-A | 미해소 |
| P1-B | 미해소 |
| P1-C | 미해소 |
| P1-D | 사실상 잠김 |

**상위:** §9-1 **미해소 유지** — 본 표는 P1 행별 해석을 정리한 것이며, 전제 2 전체 상향을 의미하지 않는다.

---

## 5. 실무용 한 줄

P1 4건 중 **A·B·C**는 잔여 이슈가 남아 있고, **D**만 정책·구현 정합이 명확하게 잠긴 상태다.

---

## 6. 증빙

- [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **[EVIDENCE-20260421-202]** — 본 종합 판정표 고정.
- 통합 역점검표: [PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md).
