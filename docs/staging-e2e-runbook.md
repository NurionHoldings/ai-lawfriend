# 스테이징 E2E 실행 지시

스테이징 배포 후 아래 순서로 확인해 주세요.

**전제:** **스테이징 오리진**이 없으면 Playwright를 **실행하지 말고 대기**합니다.

## 1. Playwright 브라우저 설치(최초 1회 또는 CI/새 머신)

```bash
npx playwright install
```

## 2. 스테이징 오리진 설정

`PLAYWRIGHT_BASE_URL`에 **스테이징 HTTPS(또는 허용된) 오리진만** 넣습니다. 기본값 `http://localhost:3000`만으로는 `npm run test:e2e:staging`이 **실행되지 않습니다**(의도적 거부).

**PowerShell**

```powershell
$env:PLAYWRIGHT_BASE_URL="https://your-staging-host.example.com"
```

**bash**

```bash
export PLAYWRIGHT_BASE_URL="https://your-staging-host.example.com"
```

## 3. 스테이징 E2E 실행

프로젝트 루트에서:

```bash
npm run test:e2e:staging
```

## 4. 자동 검증 범위(현재 저장소)

| 구분 | 내용 |
|------|------|
| 포함 | `GET /api/health` — 200·`{ ok: true, status: "ok" }`(DB 정상 가정) |
| 포함 | 비인증 시 `GET /api/release-meta` — 401 또는 403 |
| 포함 | 비인증 시 `POST /api/admin/alerts/ops-queue/bulk-edit` — 401 또는 403 |
| 제외 | `tests/e2e/admin-role-access.spec.ts` — 로그인 헬퍼 준비 전까지 **skip** |

테스트 경로: [`tests/e2e`](../tests/e2e)

## 5. 수동 점검(전체 품질)

자동 스모크만으로는 UI·업무 흐름 전체를 덮지 않습니다. [배포 체크리스트 `docs/deployment-checklist.md`](./deployment-checklist.md) **§2·§3**의 보드·로그인·대시보드 등 수동 항목을 **스테이징 호스트** 기준으로 진행해 주세요.

## 6. 증빙 전달 (`IMPLEMENTATION_EVIDENCE.md`)

스테이징 E2E를 **실행한 뒤**, **실행 결과 표 데이터 4행**의 **상태·비고**와 **실행 일시 (KST)** 만 실측으로 **전달**합니다. **전달받은 값**은 [`IMPLEMENTATION_EVIDENCE.md`](./project-governance/IMPLEMENTATION_EVIDENCE.md#evidence-20260428-staging-e2e) **`#evidence-20260428-staging-e2e`** 안에서 **그 표 4행**과 **실행 일시** 줄에만 반영하고, **다른 문단은 수정하지 않습니다.**

- **스테이징 오리진이 없으면** Playwright를 돌리지 않고, 전달·표는 **대기**로 둡니다.

**배포 전 QA 전체 닫기:** 자동 스모크만으로는 부족하다. `deployment-checklist.md` **[`#deployment-qa-nm-request-copy`](./deployment-checklist.md#deployment-qa-nm-request-copy)** 의 **`text` 블록만** 팀에 보내고, 답을 받으면 **[§6 절차](./deployment-checklist.md#deployment-qa-nm-reply)** 대로 **닫힘 / 후속 / 보류** 중 하나로 확정한다. 확정·회신 요약은 [`IMPLEMENTATION_EVIDENCE.md` `#evidence-20260428-predeploy-qa-closure`](./project-governance/IMPLEMENTATION_EVIDENCE.md#evidence-20260428-predeploy-qa-closure)에 기록한다.

## 참고

- 로컬에서 앱을 띄운 뒤 같은 스펙(헬스 제외)을 돌리려면: `npm run test:e2e` — 이때 `PLAYWRIGHT_BASE_URL` 미설정 시 기본은 `http://localhost:3000`입니다.
- `.env.example`의 `PLAYWRIGHT_BASE_URL` 주석과 [`scripts/run-e2e-staging.mjs`](../scripts/run-e2e-staging.mjs) 동작을 함께 참고하면 됩니다.
