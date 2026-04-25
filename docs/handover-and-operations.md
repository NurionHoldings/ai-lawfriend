# AI법친 운영 영역 인수인계 · 운영 매뉴얼

본 문서는 **BulkActionJob 운영 확장**, **OpsQueue 운영 큐**, **SLA/WIP**, **운영 대시보드**, **감사·타임라인·알림**, **배포·안정화** 범위를 인수인계하고 일상 운영할 때 참고하기 위한 자료입니다.

> **경로 표기**: UI·API는 코드 기준으로 `admin` 하위에 **`alerts`** 세그먼트가 있습니다.  
> 예: `/admin/alerts/ops-queue/board`, `/api/admin/alerts/ops-queue/...`

**관련 문서**

| 문서 | 용도 |
|------|------|
| [deployment-checklist.md](./deployment-checklist.md) | 배포 전 점검 |
| [release-runbook.md](./release-runbook.md) | 릴리즈·롤백 런북 |
| [grep-rg-troubleshooting.md](./grep-rg-troubleshooting.md) | 오류 발생 시 `rg`/검색으로 원인 좁히기 |
| [post-patch-verification.md](./post-patch-verification.md) | 패치 후 단계별 점검 명령·curl·브라우저 순서 |
| [ops-platform-finishing.md](./ops-platform-finishing.md) | 운영 플랫폼 마감(충돌·경로 맵·스모크·검수) |
| [incident-recovery-playbook.md](./incident-recovery-playbook.md) | 장애 시 P0~P3 우선순위·롤백·복구 판단 |
| [minimum-rollback-playbook.md](./minimum-rollback-playbook.md) | 최소 롤백·초최소 4파일·10분 복구 순서 |
| [operations-recovery-checklist.md](./operations-recovery-checklist.md) | 운영 복구 체크리스트(P0~P3)·명령·롤백·재적용 순서 |
| [README.md](./README.md) | docs·루트 운영 문서 상위 인덱스(4종 세트) |
| [OPERATIONS_INDEX.md](./OPERATIONS_INDEX.md) | 운영 문서 인덱스(루트 3종·상황별 진입) |
| [OPERATIONS_RECOVERY.md](../OPERATIONS_RECOVERY.md) | 운영 복구 체크리스트(증상·1차 복구·최소 롤백) |
| [PATCH_FINAL_CHECKLIST.md](../PATCH_FINAL_CHECKLIST.md) | 운영 패치 최종 검수 |
| [DEPLOY_PRECHECK.md](../DEPLOY_PRECHECK.md) | 배포 직전 확인만 |

---

## 1. 인수인계 문서

### 1-1. 문서 개요

**인수인계 대상 범위**

- BulkActionJob 운영 확장
- OpsQueue 운영 큐 고도화
- SLA 스캔 및 overdue 자동 알림
- WIP limit 관리
- 재분배 추천 및 재분배 적용
- 운영 대시보드
- 감사로그 / 타임라인 / 알림 연동
- 대량 편집 툴바
- 운영 안정화 세트(토스트, optimistic UI, 권한, feature flag 등)
- 배포용 마감 세트(헬스체크, 릴리즈 메타, 체크리스트, E2E 등)

### 1-2. 현재 시스템 구성 요약

**기술 스택**

- Next.js App Router  
- Prisma · PostgreSQL  
- jose · bcryptjs · Zod  
- Tailwind CSS · Recharts  
- Vitest · Playwright  

**핵심 도메인(코드 기준)**

- 사건(`Case`)
- 타임라인(`CaseTimelineMemo` 등, 사건 흐름과 연동)
- 감사로그(`AuditLog`)
- 알림(`AdminNotification` 등)
- `BulkActionJob` 및 관련 스케줄·실패 항목
- 운영 큐: Prisma 모델 **`OpsQueueTicket`** (문서상 “OpsQueue 항목”과 동일 의미로 이해)

**설정·한도**

- WIP 한도 등은 `OpsQueueWipLimit` / 설정 유틸(`lib/ops-queue/wip`)로 관리

### 1-3. 핵심 기능 요약

**BulkActionJob 운영**

- 실패 분류(failure taxonomy), 가이드 배지, 실패 항목 CSV, `sourceJobId` 기반 retry/compare  
- priority / queueGroup / concurrencyKey / maxConcurrency  
- worker claim-next, retry storm·anomaly 차트  
- 추천 액션 실행 연동, 예약 재시도·운영 큐 연동, 실행 이력·타임라인  

**OpsQueue**

- 칸반 보드, 필터, 보드 이동+코멘트, 감사로그·사건 타임라인 자동 기록  
- WIP 경고·WIP 설정 UI, 상세 슬라이드오버  
- 빠른 담당자·우선순위·dueAt 수정  
- 재분배 추천·재분배 적용, 대량 편집, 운영 대시보드와 통합  

**운영 안정화·배포**

- 토스트, optimistic UI(클라이언트 플래그), 역할별 권한, feature flag  
- `GET /api/health`, `GET /api/release-meta`, 배포 체크리스트·런북, Playwright E2E  

### 1-4. 주요 디렉터리 구조(요약)

```
src/app/(protected)/admin/alerts/ops-dashboard/    # 운영 대시보드 UI
src/app/(protected)/admin/alerts/ops-queue/        # 보드·설정·티켓 상세 등
src/app/(protected)/admin/audit-logs/              # 감사로그 UI
src/app/api/admin/alerts/ops-dashboard/             # 대시보드 API
src/app/api/admin/alerts/ops-queue/                 # 운영 큐 API
src/app/api/health/                                 # 헬스체크
src/app/api/release-meta/                           # 릴리즈·플래그 메타
src/app/api/internal/cron/alerts/                   # 내부 cron (SLA·WIP 등)
src/components/admin/alerts/ops-queue/               # 칸반·슬라이드오버·툴바 등
src/lib/auth/                                       # 역할·requireRole 등
src/lib/ops-queue/                                  # SLA·WIP·재분배·optimistic 등
src/lib/audit/                                      # 감사로그
prisma/schema.prisma
prisma/seed.ts
docs/deployment-checklist.md
docs/release-runbook.md
docs/grep-rg-troubleshooting.md
docs/post-patch-verification.md
docs/ops-platform-finishing.md
docs/incident-recovery-playbook.md
docs/minimum-rollback-playbook.md
docs/operations-recovery-checklist.md
docs/README.md
docs/OPERATIONS_INDEX.md
OPERATIONS_RECOVERY.md
PATCH_FINAL_CHECKLIST.md
DEPLOY_PRECHECK.md
tests/e2e/
```

### 1-5. 운영 핵심 API 목록(실제 경로)

**OpsQueue 조회·관리**

| 메서드 | 경로 |
|--------|------|
| GET | `/api/admin/alerts/ops-queue/board` |
| POST | `/api/admin/alerts/ops-queue/board/reorder` |
| GET | `/api/admin/alerts/ops-queue/[ticketId]` |
| POST | `/api/admin/alerts/ops-queue/[ticketId]/quick-update` |
| POST | `/api/admin/alerts/ops-queue/[ticketId]/edit` |
| POST | `/api/admin/alerts/ops-queue/[ticketId]/due-at` |
| POST | `/api/admin/alerts/ops-queue/bulk-edit` |

**설정·재분배**

| 메서드 | 경로 |
|--------|------|
| GET | `/api/admin/alerts/ops-queue/settings/wip-limit` |
| POST | `/api/admin/alerts/ops-queue/settings/wip-limit` |
| GET | `/api/admin/alerts/ops-queue/rebalance-recommendations` |
| POST | `/api/admin/alerts/ops-queue/rebalance-apply` |

**상세 연관(예시)**

- 타임라인·알림·감사로그 연동 API는 `ops-queue/[ticketId]/...` 및 `admin/audit-logs` 하위 라우트를 참고(구현 기준).

**대시보드·점검**

| 메서드 | 경로 |
|--------|------|
| GET | `/api/admin/alerts/ops-dashboard/summary` |
| GET | `/api/health` |
| GET | `/api/release-meta` |

**Cron(내부, `CRON_SECRET` 필요)**

| 메서드 | 경로 |
|--------|------|
| POST | `/api/internal/cron/alerts/ops-queue-sla-scan` |
| POST | `/api/internal/cron/alerts/ops-queue-wip-alert` |

인증: `Authorization: Bearer <CRON_SECRET>`, 또는 쿼리 `?secret=`, 또는 헤더 `x-cron-secret`(구현과 동일).

### 1-6. 역할별 권한 구조(요약)

| 역할 | 운영 큐 |
|------|---------|
| **SUPER_ADMIN** | 조회·수정 전반, WIP 한도 **저장**, 재분배 적용, 대량 편집 |
| **ADMIN** | 조회·수정, 재분배 적용, 대량 편집, WIP **조회** (한도 **저장**은 SUPER_ADMIN) |
| **STAFF** | 조회·대시보드 등(정책에 맞게), 수정·재분배·대량 편집은 제한 |
| **LAWYER** | 운영 큐 관리 권한 없음(사건 중심 기능 권장) |

세부는 `src/lib/auth/ops-queue-permissions.ts`, API의 `requireRole(...)` 호출을 기준으로 한다.

### 1-7. 인수인계 시 꼭 전달할 것

**개발팀**

- Prisma 스키마 변경 이력·마이그레이션 절차  
- 주요 API 요청/응답 계약(특히 `bulk-edit`, `rebalance-apply`, `wip-limit`)  
- `NEXT_PUBLIC_FF_*` feature flag 의미·비상 시 끄는 방법  
- Cron 보안(`CRON_SECRET`, Bearer / `x-cron-secret`)  
- `npm test`, `npm run test:e2e`, `npm run predeploy:check`  
- 롤백 기준: `docs/deployment-checklist.md`, `docs/release-runbook.md`  

**운영팀**

- 운영 대시보드·보드 URL, WIP 경고 해석, 재분배·대량 편집 주의사항  
- 장애 시 1차: `/api/health` → DB·배포 버전·로그 → feature flag  

**관리자(업무)**

- 운영 큐 흐름, 수정·이동 시 감사로그·타임라인 확인 방법  
- WIP 한도 변경은 **최고 권한**만 가능함을 안내  

---

## 2. 운영 매뉴얼

### 2-1. 운영 시작 전 점검

**기본**

- `GET /api/health` 정상  
- `GET /api/release-meta` 정상  
- 관리자 로그인, `/admin/alerts/ops-dashboard`, `/admin/alerts/ops-queue/board` 접근  

**데이터**

- 최근 감사로그·타임라인·알림 적재 여부  
- SLA 초과·WIP 초과 알림 빈도 이상 여부  

### 2-2. 운영 대시보드 보는 법

우선 확인할 지표(화면에 표시되는 항목 기준):

- 열린 운영 항목·**SLA 초과**·**URGENT**·**BLOCKED**  
- **WIP 경고**(컬럼별 한도 대비)  
- 워크로드(담당자 부담), **재분배 추천**, 최근 변경 이력  

SLA 초과가 늘면 backlog·기한 정책을 점검한다.

### 2-3. OpsQueue 보드 운영 흐름

- **TRIAGE**: 신규·분류 전  
- **QUEUED**: 착수 전  
- **WORKING**: 처리 중  
- **BLOCKED**: 외부 의존·의사결정 대기  
- **DONE**: 완료(이력은 감사로그·타임라인에 유지)  

### 2-4. 카드 이동 원칙

가능하면 이동 코멘트를 남긴다(특히 BLOCKED·DONE·TRIAGE→WORKING·긴급 조정 직후).

### 2-5. 재분배 추천 운영 원칙

자동 실행이 아니라 **운영 판단 보조**. 사건 맥락·권한·커뮤니케이션 연속성을 사람이 최종 판단한다.

### 2-6. 대량 편집 주의

강력한 기능이므로 필터·선택 대상 재확인, **note 권장**, 대량·DONE 이동은 더블체크.

### 2-7. WIP limit 운영 원칙

너무 낮으면 경고 피로, 너무 높으면 과부하 발견이 늦다. WORKING은 상대적으로 엄격히 관리하는 것을 권장한다.

### 2-8. 장애 1차 대응

| 증상 | 확인 |
|------|------|
| 대시보드 불가 | `/api/health`, DB, 배포 버전, 서버 로그 |
| 보드 실패 | `/api/admin/alerts/ops-queue/board`, 권한, schema, feature flag |
| 재분배 실패 | 플래그·권한·감사로그·담당자 데이터 |
| 알림 과다 | cron 중복 실행·스케줄·dedupe·시간대 |

---

## 3. 관리자 사용 설명서

### 3-1. 첫 로그인 후

1. `/admin/alerts/ops-dashboard` — SLA·WIP·긴급·보류 확인  
2. `/admin/alerts/ops-queue/board` — 필터 동작 확인  
3. WIP 설정 권한이 있으면 `/admin/alerts/ops-queue/settings`에서 기준 검토  

### 3-2. 보드 카드

제목·priority·taxonomy·사건 연결·담당자·기한 등을 표시. 카드 클릭 시 **상세 슬라이드오버**.

### 3-3. 상세 슬라이드오버

기본·편집·**감사로그**·**타임라인**·**알림** 탭으로 이력 추적.

### 3-4. 보드 이동

드래그 → 코멘트 모달 → 저장 → 감사로그·타임라인·보드 반영.

### 3-5 ~ 3-7. 빠른 수정

담당자·우선순위·dueAt(프리셋·직접·해제). URGENT·HIGH 남용 금지.

### 3-8. 재분배 추천

추천 카드에서 사유 검토 → 항목 선택·메모 → 적용.

### 3-9. 대량 편집

체크박스 선택 → 툴바에서 담당·priority·dueAt·컬럼·메모 후 적용.

### 3-10. WIP 설정

`/admin/alerts/ops-queue/settings` — 컬럼별 limit 저장(**SUPER_ADMIN** 및 플래그 정책 준수).

### 시스템 점검 화면

- `/admin/system` — Health·Release Meta JSON 확인(관리자 권한).

---

## 4. 관리자용 일상 운영 루틴

- **오전**: 대시보드 → SLA·BLOCKED·WIP·재분배 검토  
- **점심 전**: WORKING 적정·긴급 분산·장기 BLOCKED 메모  
- **마감 전**: DONE·내일 due·재시도 예약·로그 이상  

---

## 5. 실무 운영 팁

1. BLOCKED는 숨김 컬럼이 아니라 병목을 드러내는 컬럼이다.  
2. note·이동 코멘트를 아낀다고 좋아지지 않는다.  
3. 대량 편집은 **메모 없이** 쓰지 말 것.  
4. 재분배 추천은 보조이며 맥락 판단은 사람.  
5. URGENT가 많아지면 조직이 무뎌진다.  

---

## 6. 신규 담당자 교육 핵심

1. 대시보드에서 SLA·WIP·BLOCKED·URGENT를 본다.  
2. TRIAGE → QUEUED → WORKING → DONE 흐름을 이해한다.  
3. 이동 시 이유를 남긴다.  
4. 급할수록 대량 편집 전 필터·선택을 다시 본다.  
5. 이상하면 **헬스체크·감사로그·타임라인·릴리즈 버전**을 본다.  

---

## 7. 최종 인계 메모(상태 요약)

다음 범위는 **실서비스 운영 가능 수준**까지 구현·정리된 상태로 인계한다는 전제에서 작성한다.

- 핵심 기능·운영 UX·감사로그·타임라인·알림 연동  
- 운영 대시보드·대량 편집·재분배 추천·적용  
- 권한 세분화·토스트·optimistic UI·feature flag  
- 헬스·릴리즈 메타·배포 체크리스트·테스트·E2E  

(실제 배포마다 `NEXT_PUBLIC_APP_VERSION`, DB 마이그레이션, 시드, 모니터링은 반드시 재확인한다.)

---

## 8. 한 줄 정리

이 시스템의 핵심은 **운영 큐를 단순 작업 목록이 아니라, 책임 추적이 가능한 운영 통제 화면으로 만든 것**이다.
