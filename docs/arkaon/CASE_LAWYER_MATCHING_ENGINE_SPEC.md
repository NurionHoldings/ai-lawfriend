# 사건–변호사 매칭 엔진 스펙 (Advice-only v1)

**상태**: SPEC LOCK 초안 · HQ 제품 확정 대기  
**경계**: 추천 ≠ 배정. 자동 배정·의뢰인 직접 배정 **금지**.

관련: [CASE_LAWYER_ASSIGNMENT_NOT_MATCHING.md](./CASE_LAWYER_ASSIGNMENT_NOT_MATCHING.md)

---

## 1. 목표

관리자(ADMIN)가 사건 맥락을 보고 **배정 후보를 점수순으로 제안**받는다.  
최종 배정은 기존 `createCaseAssignmentService`만 수행한다.

## 2. 역할·권한

| 행위 | CLIENT | LAWYER | STAFF | ADMIN |
|------|--------|--------|-------|-------|
| 추천 조회 | ❌ | ❌ | ❌ (v1) | ✅ |
| 자동 배정 실행 | ❌ | ❌ | ❌ | ❌ (엔진 경유 금지) |
| 수동 배정 | ❌ | ❌ | ❌ | ✅ (기존 API) |

v1은 STAFF 확장을 하지 않는다(권한 드리프트 방지).

## 3. 입·출력

### Input
- `caseId` (필수)
- 선택 힌트: `preferredPracticeAreas[]`, `excludeLawyerIds[]` (향후)

### Output (`LawyerMatchRecommendation`)
```ts
{
  mode: "advice_only",
  caseId: string,
  generatedAt: string,
  candidates: Array<{
    lawyerUserId: string,
    displayName: string,
    score: number,          // 0..100
    reasons: string[],      // 사람이 읽을 수 있는 근거 (PII 최소)
    disqualify?: string,    // 있으면 시 배정 비권고
  }>,
  policy: {
    autoAssignEnabled: false,
    createsAssignment: false,
  }
}
```

## 4. 스코어링 v1 (휴리스틱)

가용 변호사 풀 = `findAssignableLawyers()` (role=LAWYER).

| 신호 | 가중 | 비고 |
|------|------|------|
| 활성 배정 부하(낮을수록↑) | 40 | CaseAssignment active count (추후) |
| 최근 생성 순 완화 | 20 | 신규만 몰리지 않게 완만 감점 |
| 이미 동일 사건 배정 | DQ | `disqualify=already_assigned` |
| 이메일/이름 누락 | DQ | 데이터 불완전 |

v1 최소 구현: **부하 카운트 없이** 균등 베이스(50) + 안정 정렬(id hash)로 결정론적 순서만 제공.  
부하·전문분야는 Phase M2.

## 5. 비기능

- 감사: 추천 조회는 AuditLog `CASE_LAWYER_MATCH_ADVICE` (선택, v1.1)
- PII: 응답에 주민·연락처·계좌 금지. 이름·userId·email(관리자 화면 한정)만
- 테스트: advice_only · 비관리자 Forbidden · assignment API 미호출

## 6. API (v1)

`GET /api/cases/[caseId]/lawyer-match-advice`

- `requireRoleApi("ADMIN")`
- 본문: 위 Output
- **POST로 배정 생성하지 않음**

## 7. 완료 조건 (스펙 Exit → 구현 Exit)

- [x] 본 스펙 문서
- [x] advice-only 순수 스코어러 + 서비스 + ADMIN GET
- [x] Vitest: advice_only / Forbidden / no assignment side-effect
- [ ] HQ: 전문분야·부하 가중 확정 (M2)
- [ ] UI: Control/사건 배정 화면에 추천 패널 (M2)

## 8. 아르카온

- Propose: 가중치·UI 카피
- Code: advice API만 (결제·PII mutate 없음)
- Peer review: gpt → beom
