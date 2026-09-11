# Phase A — 다플랫폼 사전 심기 실행 계획

**범위**: 아르카온 참여·협업 규칙 + Inicis AML **순수 정책 스텁**  
**금지**: 실지급 훅 연결, `APPROVED_STATUSES` 추정 채움, `ENABLED=true`, 0063급 DB 일괄 이식  
**기준선**: [MJN PR #79](https://github.com/NurionHoldings/mjn/pull/79) (`eter/0062-inicis-openmall-aml`)

---

## 0. Done 정의 (Phase A Exit)

- [ ] 대상 레포에 **동일 규칙 문구**(Intent DNA + HQ-only + AML propose-only) 존재
- [ ] 대상 레포에 **동일 env 이름 계약**이 `.env.example`에 문서화 (`ENABLED=false`, allowlist 공란)
- [ ] Python/TS **순수 eligibility** 모듈이 있고, 단위 테스트로 `allowlist empty → ineligible` 검증
- [ ] 아르카온 **읽기전용 AML checklist** 엔드포인트 또는 정적 JSON/문서 노출
- [ ] 플랫폼 **manifest**(시크릿 없음)가 kit/코어에 등록
- [ ] **지급/정산 실행 경로에 import·호출 없음** (grep 게이트)

---

## 1. 대상 레포 체크리스트

### Tier 1 — 필수 (이번 Phase A)

| # | Repo | Stack | A1 규칙/kit | A2 AML stub | A3 가이던스 | A4 env 문서 | A5 테스트 | Owner |
|---|------|-------|-------------|-------------|-------------|-------------|-----------|-------|
| 1 | `NurionHoldings/mjn` | FastAPI | PR79 머지 후 기준선 | 원본 `.py` | `/hq/arkaon/aml-guidance` | `.env.example` | `test_inicis_openmall_aml.py` | HQ |
| 2 | `NurionHoldings/wither` | FastAPI+Alembic | kit 재배포 | `inicis_openmall_aml.py` copy | FastAPI read-only route | API `.env.example` | py_compile + unit | HQ |
| 3 | `NurionHoldings/aibaeby` | FastAPI | kit 재배포 | `.py` copy | read-only guidance | API env example | unit | HQ |
| 4 | `NurionHoldings/ai-lawfriend` | Next+Prisma | 규칙 동기화(이미 있음→PR79 문구 맞춤) | **TS stub** | admin briefing JSON | `.env.example` | Vitest | 범/GPT |
| 5 | `NurionHoldings/nurypay` | Next+Prisma | kit Next route(없으면) | **TS stub** | admin read-only | `.env.example` | Vitest/node:test | HQ |
| 6 | `NurionHoldings/honfile` | Next+Prisma | kit | **TS stub** | docs+optional route | `.env.example` | unit | HQ |

### Tier 2 — 권장

| # | Repo | A1 | A2 | Notes |
|---|------|----|----|-------|
| 7 | `NurionHoldings/dosirak` | kit(Netlify fn) | **JS stub** (Functions) | 지급 훅 금지 |
| 8 | `NurionHoldings/arkaon_core` | policy/skill meta | AML skill **propose-only** | 실행 커넥터 없음 |

### Tier 3 — 규칙만

| # | Repo | 범위 |
|---|------|------|
| 9 | `phone_friend_ARKAON` | mdc + host_profile 정렬 |
| 10 | `between` | mdc + 계약 문서 |
| 11 | `gwo` | mdc만 (선택) |

### 레포별 완료 체크 (복사용)

```text
[ ] A1 .cursor/rules/arkaon-intent-dna-participation.mdc = kit template (PR79)
[ ] A1 docs/ARKAON_PARTICIPATION_CONTRACT.md (또는 동등)
[ ] A1 .arkaon/participation/host_profile.json (secret 값 없음)
[ ] A2 AML stub 파일 존재 (아래 경로표)
[ ] A3 aml-guidance 읽기전용 노출
[ ] A4 .env.example 에 INICIS_OPENMALL_* 6키 + 주석
[ ] A5 allowlist empty → false 테스트 PASS
[ ] A6 grep: payout/disburse/settlement execute 경로에 AML client 호출 0건
[ ] A7 PR 본문에 "Phase A only / fail-closed / no live gate" 명시
```

---

## 2. 파일 위치표

### 2.1 Kit 원본 (배포 소스) — `mjn`

| 항목 | 경로 |
|------|------|
| Kit root | `tools/arkaon-participation-kit/` |
| 규칙 템플릿 | `.../arkaon-intent-dna-participation.mdc.template` |
| 계약 템플릿 | `.../ARKAON_PARTICIPATION_CONTRACT.md.template` |
| 배포 스크립트 | `.../deploy_to_platforms.py` / `deploy-to-platforms.ps1` |
| FastAPI 참여 스니펫 | `.../fastapi_arkaon_participation.py` |
| Netlify 참여 스니펫 | `.../netlify-arkaon-participation.js` |
| **추가할** AML py 템플릿 | `.../templates/inicis_openmall_aml.py` ← PR79 `app/integrations/` 복사 |
| **추가할** AML guidance | `.../templates/arkaon_aml_guidance.py` |
| **추가할** TS stub | `.../templates/inicis-openmall-aml.ts` |
| **추가할** env 조각 | `.../templates/inicis-openmall-aml.env.example` |
| **추가할** manifest | `.../platform-manifests/<product>.json` |

### 2.2 Python 제품 — stub / copy

| Repo | AML 순수 모듈 | Guidance | Env | Test |
|------|----------------|----------|-----|------|
| **mjn** | `app/integrations/inicis_openmall_aml.py` | `app/services/arkaon_aml_guidance.py` | `.env.example` | `tests/test_inicis_openmall_aml.py` |
| **wither** | `services/api/app/integrations/inicis_openmall_aml.py` | `services/api/app/services/arkaon_aml_guidance.py` | `services/api/.env.example` | `services/api/tests/test_inicis_openmall_aml.py` |
| **aibaeby** | `services/api/app/integrations/inicis_openmall_aml.py` (실경로에 맞게) | `.../arkaon_aml_guidance.py` | API env example | `tests/test_inicis_openmall_aml.py` |

Python 규칙:
- FastAPI/SQLAlchemy import **금지**
- `httpx` 클라이언트가 있어도 **어떤 서비스에서도 호출하지 않음** (Phase A)
- export: `decide_aml_eligibility`, `parse_aml_status`, `AmlStatus`, `AmlDecision`

### 2.3 TypeScript / JS 제품 — stub 위치

| Repo | 순수 정책 스텁 | Guidance | Env | Test |
|------|----------------|----------|-----|------|
| **ai-lawfriend** | `src/features/payments/inicis-openmall-aml.ts` | `src/features/arkaon/arkaon-aml-guidance.ts` | `.env.example` | `src/features/payments/inicis-openmall-aml.test.ts` |
| **nurypay** | `src/lib/payments/inicis-openmall-aml.ts` | `src/lib/arkaon/arkaon-aml-guidance.ts` | `.env.example` | `src/lib/payments/inicis-openmall-aml.test.ts` |
| **honfile** | `src/lib/payments/inicis-openmall-aml.ts` | `src/lib/arkaon/arkaon-aml-guidance.ts` | `.env.example` | 동등 `*.test.ts` |
| **dosirak** | `netlify/functions/_lib/inicis-openmall-aml.js` (또는 `arkon/` 인접) | `.../arkaon-aml-guidance.js` | Netlify UI 문서화 | node:test |

**ai-lawfriend 추가(선택, Phase A)**:
- 브리핑 합류: `src/app/api/admin/arkaon/aml-guidance/route.ts` → guidance JSON만 반환
- **하지 않음**: Prisma 모델, 지급 API에서 stub 호출

### 2.4 TS stub 최소 API (모든 TS 레포 동일)

```ts
// inicis-openmall-aml.ts — 네트워크 호출 없음
export type AmlDecision = { eligible: boolean; reason: string };
export type AmlStatus = {
  examinationStatus: string | null;
  authValid: boolean;
  validFrom: string | null; // YYYY-MM-DD
  validTo: string | null;
  requestId?: string | null;
};

export function decideAmlEligibility(
  status: AmlStatus,
  approvedExaminationStatuses: Iterable<string>,
  today?: string, // Asia/Seoul calendar date
): AmlDecision;

export function readApprovedStatusesFromEnv(
  raw: string | undefined = process.env.INICIS_OPENMALL_AML_APPROVED_STATUSES,
): string[]; // trim/split; empty → []
```

필수 단위 테스트:
1. allowlist `[]` → `approved_status_allowlist_empty`
2. authValid false → `aml_auth_expired`
3. 기간 밖(KST today) → expired/not_started
4. 정상 조합 → `eligible` (allowlist에 값이 있을 때만)

### 2.5 공통 env 계약 (이름 고정)

```dotenv
INICIS_OPENMALL_AML_ENABLED=false
INICIS_OPENMALL_MERCHANT_ID=
INICIS_OPENMALL_API_KEY=
INICIS_OPENMALL_API_BASE_URL=https://apiwi.inicis.com
INICIS_OPENMALL_TIMEOUT_SECONDS=5
# KG이니시스 서면 확인 전 비움 → 모든 판정 ineligible
INICIS_OPENMALL_AML_APPROVED_STATUSES=
```

---

## 3. Kit 확장 항목 (`tools/arkaon-participation-kit`)

### 3.1 신규 파일

| 파일 | 역할 |
|------|------|
| `templates/inicis_openmall_aml.py` | MJN 순수 모듈 스냅샷 |
| `templates/inicis-openmall-aml.ts` | TS 동등 정책 (네트워크 없음 권장) |
| `templates/inicis-openmall-aml.js` | dosirak Functions용 |
| `templates/arkaon_aml_guidance.py` | 체크리스트 상수 |
| `templates/arkaon-aml-guidance.ts` | TS 체크리스트 |
| `templates/inicis-openmall-aml.env.example` | env 조각 |
| `templates/INICIS_OPENMALL_AML.md` | 적용 가이드 요약본 |
| `templates/ARKAON_COLLABORATION_CONTROL.md` | 협업관제 계약(규칙만, DB 없음) |
| `platform-manifests/*.json` | 제품별 비시크릿 manifest |
| `PHASE_A_CHECKLIST.md` | 본 문서의 레포 체크 복제 |

### 3.2 `deploy_to_platforms.py` 확장

현재: 규칙 mdc + participation contract + FastAPI/Netlify/Next 참여 스니펫.

추가 동작:

1. **TARGETS**에 `(root, product, api_base, kind, api_host, secret_policy, stacks)`  
   - `stacks`: `python` | `next` | `netlify_fn` | `rules_only`
2. `stacks=python` → `integrations/inicis_openmall_aml.py` + guidance 복사 (경로 매핑 테이블)
3. `stacks=next` → `src/.../inicis-openmall-aml.ts` 경로 매핑 + `.env.example` append(중복 방지)
4. `stacks=netlify_fn` → `_lib` JS 스텁
5. `stacks=rules_only` → mdc/docs만
6. **드라이런** `--dry-run` + **금지 grep**:  
   `require_live_eligible|get_aml_status|InicisOpenMallAmlClient(` 가 payout 파일에 생기면 fail
7. manifest 갱신: `policy_packs: ["security-core","inicis-openmall-aml@phase-a","arkaon-collab-rules@phase-a"]`

### 3.3 platform-manifest 스키마 (시크릿 금지)

```json
{
  "product": "ai-lawfriend",
  "repo": "NurionHoldings/ai-lawfriend",
  "ops_url": "https://xn--ai-e61jh10d.com",
  "api_host": "netlify",
  "expected_sha": null,
  "deployed_sha": null,
  "policy_packs": [
    "arkaon-participation@phase-a",
    "inicis-openmall-aml@phase-a"
  ],
  "aml": {
    "stub": true,
    "enabled": false,
    "live_gate_wired": false
  }
}
```

### 3.4 TARGETS 초안 (로컬 루트는 환경마다 조정)

| product | kind | stack | AML 대상 경로 |
|---------|------|-------|----------------|
| Wither | fastapi | python | `services/api/app/integrations/` |
| AI법친 | next | next | `src/features/payments/` |
| Nurypay | next | next | `src/lib/payments/` |
| Honfile | next | next | `src/lib/payments/` |
| Dosirak | netlify | netlify_fn | `netlify/functions/_lib/` |
| Aibaeby | fastapi | python | API integrations |
| PhoneFriend | rules_only | rules_only | — |
| Between | rules_only | rules_only | — |
| GWO | rules_only | rules_only | — |

---

## 4. 실행 순서 (운영)

1. **mjn** PR79 CI 복구·머지(또는 Phase A 파일만 cherry-pick 가능 시 kit 먼저 머지)
2. Kit에 §3 템플릿·deploy 확장 커밋
3. `deploy_to_platforms.py --dry-run` → 경로 확인
4. Tier 1 레포에 실제 적용 → 각 레포 PR (제목: `chore(arkaon): Phase A AML stub + participation sync`)
5. 각 PR 체크리스트 §1 통과
6. HQ 보드에 manifest 목록 게시 (시크릿 없음)

예상 PR 단위: **레포당 1개**, 금융 enable 변경 없음 → 리뷰 부담 낮음.

---

## 5. Phase A → B/C 경계 (실수 방지)

| 행동 | Phase A | Phase B+ |
|------|---------|----------|
| stub/copy 모듈 | ✅ | ✅ |
| env 문서화 | ✅ | ✅ |
| `ENABLED=true` | ❌ | 계약 후 |
| allowlist 값 입력 | ❌ | 서면 확인 후 (C) |
| 지급 직전 `amlstatus` 호출 | ❌ | C |
| Prisma/Alembic AML 프로필 테이블 | ❌ | B |
| Work Contract DB(0063) | ❌ | D |

---

## 6. ai-lawfriend (이 워크스페이스) 즉시 작업 목록

1. [x] `src/features/payments/inicis-openmall-aml.ts` + `.test.ts`
2. [x] `src/features/arkaon/arkaon-aml-guidance.ts` (+ test)
3. [x] `.env.example`에 §2.5 키 추가
4. [x] `src/app/api/admin/arkaon/aml-guidance/route.ts`
5. [x] `.cursor/rules/...` AML·협업 사전고지 보강
6. [x] `docs/arkaon/INICIS_OPENMALL_AML_PHASE_A.md`
7. [x] Vitest PASS (8 tests) + `LIVE_GATE_WIRED=false`

샘플 구현 완료일: 2026-09-11. 타 레포 kit 배포는 MJN kit 확장 후 진행.
