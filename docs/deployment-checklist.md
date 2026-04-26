# AI법친 OpsQueue 운영 배포 체크리스트

## 1. 배포 전

- [ ] `.env.production` 값 점검
- [ ] `DATABASE_URL` 확인
- [ ] `JWT_SECRET` / `CRON_SECRET` 확인
- [ ] `NEXT_PUBLIC_APP_VERSION` 갱신
- [ ] feature flag 확인 (`NEXT_PUBLIC_FF_*`)
- [ ] `prisma migrate deploy` 적용 준비
- [ ] 관리자 계정 seed 가능 상태 확인 (`npm run db:seed`)

## 2. 코드 검증

- [ ] `npm run predeploy:check`
- [ ] `npm run test:e2e` 주요 흐름 통과(로컬 서버 기준)
- [ ] **스테이징 E2E:** [스테이징 E2E 실행 지시](./staging-e2e-runbook.md) — `npx playwright install`(1회) → `PLAYWRIGHT_BASE_URL` → `npm run test:e2e:staging` · 상세는 런북 참고
- [ ] 보드 / 상세 / 대량편집 / 재분배 / WIP 설정 주요 화면 수동 점검 — **N/M 구체화·최종 판정 회신:** [§6](#deployment-qa-nm-reply)

## 3. 배포 직후

- [ ] `GET /api/health` 확인
- [ ] `GET /api/release-meta` 확인
- [ ] 로그인 확인
- [ ] `/admin/alerts/ops-dashboard` 운영 대시보드 진입 확인
- [ ] `/admin/alerts/ops-queue/board` OpsQueue 보드 조회 확인
- [ ] 상세 슬라이드오버 확인
- [ ] 재분배 추천 표시 확인
- [ ] cron secret 동작 확인 (내부 cron 엔드포인트)

**N/M 구체화:** §3 항목은 위 체크박스 **8건**을 기준으로 총/완료를 적거나, 팀 내부 정의가 있으면 그 정의를 §6 회신에 명시한다.

## 4. 배포 후 1차 모니터링

- [ ] 서버 로그 에러 급증 여부 확인
- [ ] 운영 큐 수정/이동 감사로그 적재 확인
- [ ] 타임라인 적재 확인
- [ ] WIP 초과 알림 / SLA 알림 적재 확인

## 5. 롤백 기준

- [ ] 로그인 불가
- [ ] 운영 대시보드 진입 불가
- [ ] OpsQueue 보드 500 에러 지속
- [ ] 감사로그/타임라인 적재 실패
- [ ] cron 관련 과도한 중복 알림 발생

<a id="deployment-qa-nm-reply"></a>

## 6. 배포 전 QA 수동 N/M 구체화 (팀 회신)

스테이징 E2E 자동 스모크가 끝난 뒤, **배포 전 QA 전체를 닫기** 위해서는 **§2·§3 수동 점검**의 N/M과 차단 이슈를 아래 형식으로 **회신**한다.

**§2 수동:** 본 문서 §2에서 해당 항목은 체크박스 **1줄**이지만, 운영상 **보드·상세·대량편집·재분배·WIP** 등으로 **세부 항목 수를 정한 뒤** 총/완료를 적는 것을 권장한다.

**§3:** 기본적으로 위 **§3 체크박스 8건**을 총 항목 수의 기준으로 삼는다.

### 절차: 템플릿 전송 → 회신 → 확정

1. **전송:** [`#deployment-qa-nm-request-copy`](#deployment-qa-nm-request-copy)의 **`text` 블록**을 **그대로** 개발/운영팀에 보낸다(빈 칸 상태).  
2. **회신:** 팀이 총/완료·미완·P0·**최종 판정**(세 선택지 중 **하나**)을 채워 돌려준다.  
3. **확정:** 수신 측(릴리즈·운영 책임 등)이 회신을 바탕으로 배포 전 QA를 **아래 셋 중 하나로만** 공식 확정한다.  
   - **닫힘** — 회신이 **배포 전 QA 닫음 가능**에 해당. §2·§3 수동이 합의 기준을 충족하고 **P0 없음**.  
   - **후속** — 회신이 **비차단 후속만 남기고 배포 가능**에 해당. 배포는 진행하되, 미완·비차단 항목은 **별도 후속**(티켓·증빙·스프린트)으로 분리한다.  
   - **보류** — 회신이 **차단 이슈가 있어 배포 보류**에 해당. **P0** 해소 전까지 배포하지 않는다.  
4. **기록:** 확정일·회신 요약(또는 원문 위치)을 공식 기록에 남긴다. **권장 앵커:** [`IMPLEMENTATION_EVIDENCE.md` `#evidence-20260428-predeploy-qa-closure`](./project-governance/IMPLEMENTATION_EVIDENCE.md#evidence-20260428-predeploy-qa-closure) **「확정 기록」** 표·회신 원문 줄. (추가로 릴리즈 회의록 등 팀 관례가 있으면 병행.)

<a id="deployment-qa-nm-request-copy"></a>

### 배포 전 QA 최종 판정 회신 요청 (팀에 그대로 전달)

**상태 (고정):** 본 절·아래 `text` 복사 블록 정리 **완료** · **팀 회신 대기**. 기준·절차는 **`#deployment-qa-nm-reply`**(§6). **다음 행동:** `text` 블록**만** 팀에 보낸다. 회신을 받으면 §6 **절차**대로 닫힘/후속/보류를 확정하고, [`IMPLEMENTATION_EVIDENCE.md` `#evidence-20260428-predeploy-qa-closure`](./project-governance/IMPLEMENTATION_EVIDENCE.md#evidence-20260428-predeploy-qa-closure) **「확정 기록」** 표·**회신 원문** 줄**만** 갱신한다(§2·§3 총/완료/미완/P0·최종 판정).

**잠금 (회신 전·확정):** `#deployment-qa-nm-request-copy`의 **`text` 블록 형식**과 **바깥 설명**은 팀 회신이 올 때까지 원칙적으로 **변경하지 않는다**.

릴리즈·운영 담당이 아래 블록을 **복사**해 개발/운영팀에 보낸다.

**원본 위치(발신 측 참고, 팀 메시지에 넣지 않음):** 이 파일 → **`#deployment-qa-nm-request-copy`**

```text
배포 전 QA 최종 판정 회신 요청

아래 항목을 채워 회신해 주세요.

## §2 수동 점검
- 총 항목 수:
- 완료 항목 수:
- 미완 항목:
  - 없음 또는 항목명 기재
- 차단 이슈(P0):
  - 없음 또는 내용 기재

## §3 배포 직후/운영 확인 항목
- 총 항목 수:
- 완료 항목 수:
- 미완 항목:
  - 없음 또는 항목명 기재
- 차단 이슈(P0):
  - 없음 또는 내용 기재

## 최종 판정
아래 중 하나로 선택해 주세요.
- 배포 전 QA 닫음 가능
- 비차단 후속만 남기고 배포 가능
- 차단 이슈가 있어 배포 보류
```

---

**양식 단일화:** 회신 항목 전문은 위 **`text` 블록**에만 둔다. 동일 내용을 §6 다른 곳에 중복 두지 않는다(잠금·유지보수 혼선 방지).
