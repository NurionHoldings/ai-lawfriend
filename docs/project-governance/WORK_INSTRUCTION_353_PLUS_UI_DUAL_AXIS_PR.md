# 353+ UI 가용 액션 이중 축 전용 PR 작업지시서

## 0. 작업명

353+ UI 가용 액션 이중 축 정리 PR

## 1. 기준 근거

이번 작업은 아래 기준만 따른다.

- **Evidence:** `EVIDENCE-20260426-353`
- **기준 앵커** ([IMPLEMENTATION_EVIDENCE.md](IMPLEMENTATION_EVIDENCE.md)):
  - [#p0-353-plus-prep](IMPLEMENTATION_EVIDENCE.md#p0-353-plus-prep)
  - [#353-plus-separate-pr](IMPLEMENTATION_EVIDENCE.md#353-plus-separate-pr)

**이번 PR은 반드시 별도 PR로 진행한다.**

## 2. 현재 운영 판정

**P1 권한·IO-05 축**은 이미 **닫힌 상태**로 본다.

**닫힘 유지 대상:**

- RB-01
- RB-02
- RB-03
- RB-04
- RB-05
- IO-05

따라서 이번 353+ PR에서는 위 항목을 **재오픈하지 않는다.**

## 3. 이번 PR의 목적

Case 상세 화면에서 사용자에게 보이는 액션과 API가 내려주는 lifecycle action 응답의 관계를 정리한다.

이번 PR의 핵심 대상은 아래 두 축이다.

1. **UI 표시 액션 축**
   - `getAllowedCaseActions` ([`src/lib/case-action-guard.ts`](../../src/lib/case-action-guard.ts))

2. **API lifecycle action 응답 축**
   - 응답 필드 `allowedLifecycleActions`
   - `getAllowedLifecycleActionsForCase` ([`src/lib/cases/allowed-actions.ts`](../../src/lib/cases/allowed-actions.ts))

**이번 작업의 목적은 두 값을 무조건 하나로 합치는 것이 아니다.**

목적은 다음 세 가지다.

1. 두 축의 **역할 차이**를 명확히 **문서화**한다.
2. UI에 보이는 액션과 API lifecycle action 응답이 다를 경우, 그 차이가 **의도**인지 **불일치**인지 **판정**한다.
3. 불일치가 **실제 사용자 혼란이나 서버 거절**을 만들 경우에만 **최소 코드 정렬**을 한다.

## 4. 절대 혼입 금지

이번 353+ PR에는 아래 작업을 **포함하지 않는다.**

- RB-01~RB-05 재오픈
- IO-05 재오픈
- P1 권한·IO 축 재오픈
- IV-04 재오픈
- IV-05 재오픈
- LC-03 재오픈
- ST-03 재오픈
- ST-01 재오픈
- [343]~[352] 닫힌 축 재오픈
- `CaseStatus` **canonical** 변경
- `prisma/schema.prisma`의 `CaseStatus` 수정
- `src/lib/definitions/case-status.ts`의 `CaseStatus` 수정
- 권한 구조 재설계
- 사건 접근권한 재설계
- IO select/detail 직렬화 재설계

이번 PR은 오직 **UI 가용 액션 이중 축**만 다룬다.

## 5. 먼저 열어둘 파일

작업자는 아래 파일을 먼저 열고 현재 상태를 확인한다.

| 경로 |
|------|
| [`docs/project-governance/IMPLEMENTATION_EVIDENCE.md`](IMPLEMENTATION_EVIDENCE.md) |
| [`tools/aibeopchin_navigator.py`](../../tools/aibeopchin_navigator.py) |
| [`src/lib/case-action-guard.ts`](../../src/lib/case-action-guard.ts) |
| [`src/lib/cases/allowed-actions.ts`](../../src/lib/cases/allowed-actions.ts) |
| [`src/components/cases/case-detail-client.tsx`](../../src/components/cases/case-detail-client.tsx) |
| [`docs/project-governance/ALIGNMENT_AUDIT_V1.md`](ALIGNMENT_AUDIT_V1.md) |

## 6. 검증 (참고)

`src/**` 변경 시 팀 표준: `npm run verify:349-12` 등 ([IMPLEMENTATION_EVIDENCE.md](IMPLEMENTATION_EVIDENCE.md) 본 트랙 검증 문구 참고).

## 7. 완료 후 기준 앵커 (후속 세션)

**353+ 실착·닫힘** 판정과 충돌 없이 읽을 것:

- [IMPLEMENTATION_EVIDENCE.md — `#353-plus-separate-pr`](IMPLEMENTATION_EVIDENCE.md#353-plus-separate-pr)
- [IMPLEMENTATION_EVIDENCE.md — `#p0-353-plus-dual-axis-real`](IMPLEMENTATION_EVIDENCE.md#p0-353-plus-dual-axis-real)
- [IMPLEMENTATION_EVIDENCE.md — `#p0-353-plus-prep`](IMPLEMENTATION_EVIDENCE.md#p0-353-plus-prep) (착수 전 범위표·역사)
- `tools/aibeopchin_navigator.py` — `PROJECT_PLAN["post_352_next_347_tier3_alignment"]` 문자열

**요지:** API `allowedLifecycleActions`는 **구조적 후보**, UI `getAllowedCaseActions`는 **사실조건 반영**; 강제 동일화는 별도 합의 없이 후속 `PR`에서 하지 않음.
