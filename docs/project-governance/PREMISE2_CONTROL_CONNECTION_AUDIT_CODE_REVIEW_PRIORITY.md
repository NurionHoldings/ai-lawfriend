# 17행 중 실제 코드 역점검 우선순위표

| 항목 | 내용 |
|------|------|
| 기준 | [EVIDENCE-20260421-191] 이후 상태 · [17행 1차 채움 요약](./PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET_FIRST_PASS_STATUS_SUMMARY.md) · [통합 감사 시트](./PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md) |
| 행 ID·엣지 | P1·OPEN·DENY는 [CASE_LIFECYCLE_TRANSITION_SUMMARY.md](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) §9-1·§11-1·**§6 본표·§6-1** 과 동일 |
| 본 문서 증빙 | [EVIDENCE-20260421-192] |

**내비게이터:** `tools/aibeopchin_navigator.py` 기준 **Phase 5**는 「정의서 대비 구현 역점검」, **Phase 6**은 「구현 재정렬 패치」이다. 지금은 **문서 추가보다 실제 코드·화면·운영 연결 역점검이 우선**이며, Phase 5의 역점검과 Phase 6의 재정렬 사이를 잇는 구간으로 보는 것이 맞다.

---

## 0. 우선순위 부여 원칙

이번 우선순위는 아래 **4가지**를 기준으로 잡는다.

1. **제품 위험도:** 잘못 열리면 사건 상태가 크게 틀어지는가  
2. **정책/합의 미확정도:** 문서상 미해소 성격이 큰가  
3. **구현 확인 난이도:** UI / API / 서버 / 운영·감사를 실제로 확인하기 쉬운가  
4. **후속 파급력:** 하나를 확인하면 다른 행 해석도 같이 풀리는가  

`check-status --scope case` 는 사건 관련 경로를 좁혀 보는 도구이지만, 여전히 **휴리스틱**이므로 **단독 판정 근거로 쓰면 안 된다** ([IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) §공통 규칙 4-1).

**실제 코드 역점검**은 아래 축을 중심으로 본다.

- `prisma/schema.prisma`
- `src/lib/definitions/case-status.ts`
- `src/lib/case-*`
- `src/features/cases/`
- `src/app/api/cases/`
- `src/app/(protected)/cases/`
- `src/components/cases/`

---

## 1. 우선순위 총괄표

| 우선순위 | 대상 | 행 수 | 먼저 보는 이유 | 1차 확인 축 |
|----------|------|------|----------------|-------------|
| 1순위 | P1 A~D | 4 | 전이·정책·구현 공백 논점이 가장 큼 | 서버 → API → UI |
| 2순위 | OPEN-1, OPEN-2, OPEN-4 | 3 | 종료·직접 재진입·삭제–생성처럼 파급이 큼 | 서버 → API → 운영 |
| 3순위 | DENY-8, DENY-7, DENY-4, DENY-6, DENY-5 | 5 | soft delete·재생성·종결·승인·전달 우회 금지 등 통제선 확인 가치가 큼 | 서버 → API → 운영·감사 |
| 4순위 | OPEN-3, OPEN-5 | 2 | 전이보다 상태 유지·메타 성격이 강함 | UI / 운영 |
| 5순위 | DENY-1, DENY-2, DENY-3 | 3 | 문서상 금지는 강하지만 다른 축 확인 후 묶어서 보기 쉬움 | UI → API → 서버 |

**한 줄:** 먼저 P1 4건으로 전이·정책 논점을 잡고, 그다음 OPEN의 파급 큰 3행, 그다음 DENY의 복원·종결·승인·전달 우회 금지 축을 확인하는 순서가 가장 효율적이다.

---

## 2. 1순위 — P1 A~D

| 행 | 이유 | 가장 먼저 볼 곳 | 확인 질문 |
|----|------|------------------|-----------|
| **P1-A** `CREATED` → `INTAKE_PENDING` | 조건 흐름인지 실제 전이인지 자체가 미확정 | `src/lib/case-*`, `src/features/cases/` | 전이 테이블에 있는가, 아니면 생성 후 후속 절차인가 |
| **P1-B** `REVIEW_PENDING` → `DRAFTING` | 전이 vs 문서 API 합의 전 | `src/app/api/cases/`, 문서 생성 서비스 | 상태 변경 호출인가, 문서 작성 진입인가 |
| **P1-C** `APPROVED` → `CLOSED` | 종료 액션과 가장 직접 연결 | 종료·승인 관련 route·service | `CLOSE_CASE` 같은 명시 액션이 있는가 |
| **P1-D** `HOLD` → `REJECTED` | 정책 합의와 `REJECT_CASE` from-state 확인 필요 | reject 관련 route·service·policy | `HOLD`에서 거절이 실제 허용·차단되는가 |

**실무 포인트:** P1은 문서 해석 문제가 아니라 **실제 상태 엔진**을 건드리는 축이라 제일 먼저 봐야 한다. 여기서 결론이 나와야 OPEN·DENY 일부도 같이 정리된다.

**실행 체크리스트:** [PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_CHECKLIST.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_CHECKLIST.md) — [EVIDENCE-20260421-193].

---

## 3. 2순위 — OPEN 중 파급 큰 3행

**대상:** OPEN-1 · OPEN-2 · OPEN-4

| 행 | 이유 | 가장 먼저 볼 곳 | 확인 질문 |
|----|------|------------------|-----------|
| **OPEN-1** `APPROVED` → `CLOSED` | 종료 흐름과 직접 연결 | 종료 액션 route·service·UI | 종료가 자동·명시 액션 중 무엇인가 |
| **OPEN-2** `REJECTED` → `CREATED` | 직접 재진입 해석과 연결 | 재접수·재개 route·service | 직접 재생성인가, 재오픈인가, 금지인가 |
| **OPEN-4** `DELETED` → `CREATED` | 삭제 후 생성·복원과 교차 | soft delete·복원 흐름 | 복원과 새 생성이 분리되어 있는가 |

**실무 포인트:** OPEN 5행 전체를 한 번에 보기보다, 사건 흐름을 크게 흔드는 3행부터 보는 것이 좋다. 특히 `REJECTED` → `CREATED`, `DELETED` → `CREATED` 는 문서 해석과 실제 제품 동작이 어긋나기 쉬운 축이다.

---

## 4. 3순위 — DENY 중 파급 큰 5행

**대상:** DENY-8 · DENY-7 · DENY-4 · DENY-6 · DENY-5 ([§6 본표](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) 순서·엣지)

이 5개를 먼저 보는 이유는, 금지 규칙 중에서도 **복원·재생성·종결·승인·전달 우회**와 연결돼 실제 사고 가능성이 더 크기 때문이다.

| 행 | 엣지(§6-1) | 성격 | 가장 먼저 볼 곳 | 확인 질문 |
|----|------------|------|------------------|-----------|
| **DENY-8** | `DELETED` → `CREATED` | 삭제 후 일반 흐름 재진입 금지 | 삭제·복원 service, 감사 흔적 | soft delete·restore가 어떻게 분리되는가 |
| **DENY-7** | `CLOSED` → `DRAFTING` | 종결 후 작성 단계 직접 복귀 금지 | 재오픈·재작성·생성 흐름 | 종료 후 `DRAFTING` 진입과 재개가 섞이는가 |
| **DENY-4** | `DRAFTING` → `DELIVERED` | 초안에서 승인·검토 생략 전달 금지 | 전달 route·service·UI | 초안 상태에서 전달 액션이 노출·허용되는가 |
| **DENY-6** | `APPROVED` → `IN_INTERVIEW` | 승인 후 인터뷰 역행 금지 | 승인·재개 route·service·운영 | `APPROVED`에서 인터뷰 복귀가 허용되는가(재개 `REOPEN_CASE` 축과 구분) |
| **DENY-5** | `REVIEW_PENDING` → `DELIVERED` | 검토 대기에서 전달 직행 금지 | 전달·승인 정책·운영 | 검토 중 전달 요청이 막히는가 |

**실무 포인트:** 이 5행은 문서 잠금은 이미 강하지만, 제품 통제선 입증이 약하면 실제 운영 사고로 이어질 수 있다. 단순 화면보다 **서버**와 **운영·감사** 축을 먼저 보는 것이 좋다.

---

## 5. 4순위 — OPEN의 상태 유지·메타 2행

**대상:** OPEN-3 · OPEN-5

| 행 | 이유 | 가장 먼저 볼 곳 | 확인 질문 |
|----|------|------------------|-----------|
| **OPEN-3** `HOLD` → `HOLD` | 전이보다 상태 유지·보류 관리 성격 | UI, 운영 추적 | 보류 상태 표시와 사유 추적이 있는가 |
| **OPEN-5** 메타 | 개별 전이보다 재판정·운영 추적 성격 | 운영·감사 문서·로그 | 해제 조건과 추적선이 문서·운영에 있는가 |

**실무 포인트:** 이 둘은 서버 전이 자체보다 보류 상태 관리와 메타 추적이 핵심이라, 앞선 고위험 전이 확인이 끝난 뒤 보는 편이 효율적이다.

---

## 6. 5순위 — DENY의 직행 금지 3행

**대상:** DENY-1 · DENY-2 · DENY-3 ([§6 본표](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) 엣지)

| 행 | 엣지(§6-1) | 이유 | 가장 먼저 볼 곳 | 확인 질문 |
|----|------------|------|------------------|-----------|
| **DENY-1** | `CREATED` → `APPROVED` | 시작 직후 승인 금지 | UI 액션 노출, 승인 route | 생성 상태에서 승인 버튼·요청이 가능한가 |
| **DENY-2** | `IN_INTERVIEW` → `APPROVED` | 인터뷰 중 직접 승인 금지 | API·서버 전이 정책 | 단계 건너뛰기가 가능한가 |
| **DENY-3** | `INTERVIEW_DONE` → `DELIVERED` | 승인·문서 절차 없이 전달 금지 | 문서·전달 흐름과 상태 전이 | 전달과 상태 전이가 섞이는가 |

**실무 포인트:** 이 3행은 중요하지 않다는 뜻이 아니라, 다른 우선행을 확인한 뒤 **묶어서** 효율적으로 볼 수 있는 행이라는 뜻이다. 특히 **DENY-3** 은 문서·전달 흐름과 혼동될 수 있어 **P1-B** 확인 뒤에 보는 것이 수월하다.

---

## 7. 실제 코드 역점검 순서

### 1단계: 서버 중심

가장 먼저 아래를 본다.

- `prisma/schema.prisma`
- `src/lib/definitions/case-status.ts`
- `src/lib/case-*`
- `src/features/cases/`

상태 전이 허용·금지와 정책 함수는 최종적으로 서버 쪽에서 잠기는 경우가 많기 때문이다.

### 2단계: API 중심

- `src/app/api/cases/`

잘못된 상태 요청이 4xx로 막히는지, 액션별 상태 검증이 있는지를 확인한다.

### 3단계: UI 중심

- `src/app/(protected)/cases/`
- `src/components/cases/`

버튼 비노출·액션 숨김·잘못된 상태에서 조작 불가를 확인한다.

### 4단계: 운영·감사

감사 로그 관련 서비스·페이지, 운영 문서 흐름. 관리자 경로·권한·검색 흐름이 정리돼 있으면 후속 추적 축으로 연결하기 좋다.

---

## 8. 최종 우선순위 리스트

아주 짧게 정리하면 아래 순서이다.

1. **P1-C** `APPROVED` → `CLOSED`  
2. **P1-D** `HOLD` → `REJECTED`  
3. **P1-B** `REVIEW_PENDING` → `DRAFTING`  
4. **P1-A** `CREATED` → `INTAKE_PENDING`  
5. **OPEN-2** `REJECTED` → `CREATED`  
6. **OPEN-4** `DELETED` → `CREATED`  
7. **OPEN-1** `APPROVED` → `CLOSED`  
8. **DENY-8** `DELETED` → `CREATED`  
9. **DENY-7** `CLOSED` → `DRAFTING`  
10. **DENY-6** `APPROVED` → `IN_INTERVIEW`  
11. **DENY-5** `REVIEW_PENDING` → `DELIVERED`  
12. **DENY-4** `DRAFTING` → `DELIVERED`  
13. **OPEN-3** `HOLD` → `HOLD`  
14. **OPEN-5** 메타  
15. **DENY-3** `INTERVIEW_DONE` → `DELIVERED`  
16. **DENY-2** `IN_INTERVIEW` → `APPROVED`  
17. **DENY-1** `CREATED` → `APPROVED`  

---

## 9. 문서에 붙일 한 줄 결론

17행 실제 코드 역점검은 **P1 4건을 최우선**으로 두고, 그다음 **OPEN의 파급 큰 3행**, 이후 **DENY의 복원·종결·승인·전달 우회 금지** 축을 확인하는 순서가 가장 효율적이다.
