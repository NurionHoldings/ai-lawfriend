# 대시보드 4.6 — QA 회신 대기 중 후속 보완 항목 분리표

## 0. 기준 문서

- `docs/project-governance/DASHBOARD_3_11_FINAL_SEAL_SUMMARY.md` (§12~§13, 3.x 봉인)
- `docs/project-governance/DASHBOARD_4_0_PREDEPLOY_OPERATION_CHECK_PHASE.md`
- `docs/project-governance/DASHBOARD_4_1_ROLE_ACCESS_PERMISSION_CHECKLIST.md`
- `docs/project-governance/DASHBOARD_4_2_PREDEPLOY_MANUAL_QA_SCENARIOS.md`
- `docs/project-governance/DASHBOARD_4_3_EMPTY_ERROR_STATE_MANUAL_CHECKLIST.md`
- `docs/project-governance/DASHBOARD_4_4_PREDEPLOY_OPERATOR_FINAL_CHECKLIST.md`
- `docs/project-governance/DASHBOARD_4_5_QA_CLOSURE_REFLECTION_PREP.md`
- `docs/project-governance/DASHBOARD_4_7_AI_ASSISTED_QA_EVIDENCE_REFLECTION_DESIGN.md` (AI **초안**·**사람** **승인** **후** **반영** **설계**; 구현 **아님**)
- `docs/project-governance/IMPLEMENTATION_EVIDENCE.md`
  - `#evidence-20260428-398` · `#evidence-20260428-399` (본 문서)
  - `#evidence-20260428-predeploy-qa-closure` — **공식 확정 표 / 회신 원문은 미기입 유지** (QA 실측 전문 수신 전)
- `tools/aibeopchin_navigator.py` — `dashboard_4_6_qa_pending_followup_tracker` (본 문서)

## 1. 문서 목적

- QA **closure**(`#predeploy-qa-official-confirm`)는 **미기입**을 유지한다.
- **실측 QA 회신 전**에는 **최종 통과** / **배포 가능** 판정을 **기재하지 않는다**.
- 이후 회신에서 나올 수 있는 **FAIL / BLOCKED / 보완 필요** 를 **미리 분류할 표 틀**만 둔다(예상·후보; **확정 아님**).
- **앱·API·DB·권한·집계 코드 변경은 하지 않는다.** — 관리용 문서만 준비한다.
- **대시보드 3.x 봉인**을 유지하고, **4.0~4.5** 운영 점검·QA 문서 **흐름**을 깨지 않는다.

## 2. 이 문서에서 하지 않는 것 (잠금)

- `#evidence-20260428-predeploy-qa-closure` **공식 확정 표** 를 이 문서로 **대체하거나** 미리 **채우지** 않는다.
- **회신 원문**을 작성·가정하지 않는다.
- **최종 통과** / **배포 가능** 판정을 내리지 않는다.
- **대시보드 3.x** 범위를 **재오픈**하거나 **되돌리지** 않는다.
- **앱 코드** / **API** / **DB** / **권한** / **집계** 변경

## 3. 분류 틀 (QA 회신 **전** — *후보만*)

**원칙:** 아래 표는 **가능한 이슈**를 **메모**하기 위한 것이다. **QA 전문·회신이 있기 전**에는「후보」열에만 적고, **closure 표**에 옮기지 않는다.

| 분류 | 이 표에 적는 경우 (안내) |
| --- | --- |
| **FAIL 후보** | 4.2/4.4 등에서 **실패가 예상되는** 점검·시나리오(근거: 문서·내부 점검만; 실측 아님) |
| **BLOCKED 후보** | 환경·계정·URL 미확인 등으로 **막힐 수 있는** 항목 |
| **N/A 후보** | **해당 없음**이 될 수 있는 점검(역할·데이터 없음 등) |
| **문서 보완** | **문서**만 손보면 되는 **후보**(코드 변경 없이 문구·경로·체크리스트) |
| **기능 보완** | **코드/동작** 변경이 **필요할 수 있다**고 **예상**되는 항목(확정은 회신 후) |
| **운영 확인** | **스테이징/운영**에서만 확인되는 항목(로그, 계정, URL) |

### 3.1 FAIL 후보

| # | 시나리오/항목(참조) | 출처(문서·절) | 메모(비확정) | 회신 후 조치(비움) |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

### 3.2 BLOCKED 후보

| # | 항목 | 출처(문서·절) | 메모(비확정) | 회신 후 조치(비움) |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

### 3.3 N/A 후보

| # | 항목 | 출처(문서·절) | 메모(비확정) | 회신 후 조치(비움) |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

### 3.4 문서 보완 (후보)

| # | 항목 | 출처(문서·절) | 메모(비확정) | 회신 후 조치(비움) |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

### 3.5 기능 보완 (후보)

| # | 항목 | 출처(문서·절) | 메모(비확정) | 회신 후 조치(비움) |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

### 3.6 운영 확인 (후보)

| # | 항목 | 출처(문서·절) | 메모(비확정) | 회신 후 조치(비움) |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

## 4. closure 확정 **전** — 어디에 무엇을 쓰는가

- **4.6 본문 표(§3):** 팀·내부 **메모**로만. **공식** 의미 **아님**.
- **closure 공식 확정:** 오직 `IMPLEMENTATION_EVIDENCE.md` `#predeploy-qa-official-confirm` — **QA 실측 전문 수신 후**, [`#predeploy-qa-1-4`](IMPLEMENTATION_EVIDENCE.md#predeploy-qa-1-4) 3~4단계.
- **회신 전**에는 4.6을 **“분류 연습/대기”**로만 쓰고, **배포 가능·최종 통과** 를 **4.6에 적지 않는다**.

## 5. QA 회신 수신 후

- `DASHBOARD_4_5_QA_CLOSURE_REFLECTION_PREP.md` 의 순서·판정 힌트를 따른다.
- **PASS 전부:** `#evidence-20260428-predeploy-qa-closure`에 **(1) 공식 확정 표 (2) 회신 원문** 만 갱신.
- **FAIL / 미해소 BLOCKED:** closure **보류**; 4.6·별도 EVIDENCE에 **후속** 항목으로 분리(필요 시 4.x·별도 Phase).

## 6. 관련 앵커 (IMPLEMENTATION_EVIDENCE.md)

- `[EVIDENCE-20260428-399]`: 본 4.6 문서·범위 고정
- `[EVIDENCE-20260428-398]`: 배포 전 QA 1~4단계·Message — **닫힘** 유지
- `#predeploy-qa-1-4` · `#predeploy-qa-message-copy` · `#predeploy-qa-official-confirm`

## 7. 완료·잠금 · 다음 (고정)

- **4.6** 본 문서(`§0~§7`)·`[EVIDENCE-20260428-399]`·내비 키 **개설**은 **완료**·**잠김**으로 본다. **운영 잠금·다음 분기**는 `IMPLEMENTATION_EVIDENCE.md`의 [`#evidence-20260428-399-snap`](IMPLEMENTATION_EVIDENCE.md#evidence-20260428-399-snap) · [`#evidence-20260428-399-next`](IMPLEMENTATION_EVIDENCE.md#evidence-20260428-399-next) 를 본다.

**확인 순서 (고정):**

1. `IMPLEMENTATION_EVIDENCE.md` — `#evidence-20260428-399` · `#evidence-20260428-399-now` · `#evidence-20260428-399-snap` · `#evidence-20260428-399-next` · 상단 **실제 기록** 399 항목
2. 본 파일 `DASHBOARD_4_6_QA_PENDING_FOLLOWUP_TRACKER.md`
3. `tools/aibeopchin_navigator.py` — `dashboard_4_6_qa_pending_followup_tracker` · `show-plan` 대시보드 4.6 절

- **다음 실제 행동 (둘 중 하나):** (1) QA **실측 전문** 수신 시 — `#evidence-20260428-predeploy-qa-closure` **공식 확정 표**·**회신 원문** 갱신; FAIL/BLOCKED/N/A/보완 필요는 **§3**·**§5** 기준으로 분리. (2) 전문 **미** 수신 시 — closure **미기입** 유지, **추가 개발**·**불필요**한 증빙 수정 **없이** 대기.
