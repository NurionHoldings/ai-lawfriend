# [347] 3순 1순위 A · ALIGNMENT §6 잔여 문서 클로저 작업지시서

## 0. 작업명

[347] 3순 1순위 A · ALIGNMENT §6 잔여 **문서 클로저**

## 1. 기준

이번 작업은 [347] 3순 후속 활성 축 선정 결과에 따라 진행한다.

| 항목 | 내용 |
|------|------|
| 선정 | **팀 1순위 = A · `ALIGN-§6-문서`** |
| 범위 | [ALIGNMENT_AUDIT_V1.md §6](ALIGNMENT_AUDIT_V1.md#6-역점검표-본문) 역점검표 **잔여** 행 |
| 성격 | **문서 클로저** 중심 (`IMPLEMENTATION_EVIDENCE`·`ALIGNMENT` **판정·소개** 열 정리) |
| 후보표 | [WORK_INSTRUCTION_347_TIER3_FOLLOWUP_AXES.md](WORK_INSTRUCTION_347_TIER3_FOLLOWUP_AXES.md) **§4** |
| 증빙 앵커 | [IMPLEMENTATION_EVIDENCE.md — `#work-instruction-347-tier3-followup-axes`](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-followup-axes) · [`#work-instruction-347-tier3-align6-doc-closure`](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-align6-doc-closure) |

## 2. 이번 작업의 목적

[ALIGNMENT_AUDIT_V1.md](ALIGNMENT_AUDIT_V1.md) **§6**에 남아 있는 잔여 항목을 확인하고, 각 항목(행)을 아래 **셋 중 하나**로 판정한다.

1. **닫힘(축 포함)** — 이미 닫힌 축·증빙에 포함되어 더 이상 작업 필요 없음 → **닫힘 근거 링크**만 남기고 표현을 정리한다.
2. **문서 클로저** — 코드 갭이 아니라 **문서상 잔여·모호 표현**만 남아 있음 → **판정·조치 방향**을 갱신해 행을 **닫을 수 있는 상태**로 만든다.
3. **별도 후속** — 실제 **코드 갭 가능성**이 있어 이번 문서 클로저로 끝낼 수 없음 → **이번 PR/문서에서 코드를 수정하지 않고**, `EVIDENCE-20260426-353+` 등 **별도 후속 후보**로만 분리·기록한다.

**원칙:** 이번 작업은 **문서 클로저**이다. **코드 수정이 목적이 아니다.**

### 2-1. 스캔 우선순위(권장)

- **§6-1~§6-12** 표에서 **판정보류**·**부분일치**(잔여 문구)·**판정 필요**가 남아 있는 행을 우선 목록화한다.
- **[353-1] 스냅** 이후 이미 갱신된 **ST-01~05 · LC-01~02 · UI-03**은, 위 세 분류 중 (1) 또는 (2)로 **잔여 문장만** 정리할 수 있는지부터 본다.

## 3. 절대 재오픈 금지

아래 축은 **이미 닫힌 것**으로 본다. 이번 작업에서 **다시 검토 대상으로 끌어오지 않는다.**

| 구분 | 비고 |
|------|------|
| 353+ UI 가용 액션 이중 축 | [#p0-353-plus-dual-axis-real](IMPLEMENTATION_EVIDENCE.md#p0-353-plus-dual-axis-real) |
| P1 `RB-01~RB-05` | P1 닫힘 블록·`#p0-353-p1-rb01` 등 |
| IO-05 | `#p0-353-p1-io05` |
| P0 첫 코드 묶음 | IV-04, IV-05, LC-03, ST-03, interview/complete 경로 — [#p0-353-구현-20260426](IMPLEMENTATION_EVIDENCE.md#p0-353-구현-20260426) |
| P0 잔여·P2 통합 실착 묶음 | ST-01, [310] 예외 (1)(3), ST-02, ST-05, 운영 — [#p0-347-tier3-p0-p2-integrated-20260426](IMPLEMENTATION_EVIDENCE.md#p0-347-tier3-p0-p2-integrated-20260426) |
| `CaseStatus` **canonical** 변경 | `prisma/schema.prisma` / `src/lib/definitions/case-status.ts` **enum 수정** — 별도 합의·EVIDENCE 없이 **금지** |

**주의**

- 이미 완료된 항목은 **“닫힘 근거 링크”**로만 연결한다.
- 실제 코드 갭이 발견되더라도 **이번 문서 클로저 안에서 코드를 수정하지 않고** (3) **별도 후속**으로만 분리한다.

## 4. 먼저 열어둘 파일

```txt
docs/project-governance/ALIGNMENT_AUDIT_V1.md
docs/project-governance/IMPLEMENTATION_EVIDENCE.md
docs/project-governance/WORK_INSTRUCTION_347_TIER3_FOLLOWUP_AXES.md
tools/aibeopchin_navigator.py
docs/project-governance/WORK_INSTRUCTION_347_TIER3_ALIGN6_DOC_CLOSURE.md
```

## 5. 산출물

- **[ALIGNMENT_AUDIT_V1.md](ALIGNMENT_AUDIT_V1.md) §6** — 대상 행의 **판정**·**조치 방향**(및 필요 시 **현재 구현 관찰** 한 줄) 갱신; **닫힘 근거**는 `IMPLEMENTATION_EVIDENCE` 앵커 또는 기존 SPEC/FILE_REALIGN 링크로 명시.
- **[IMPLEMENTATION_EVIDENCE.md](IMPLEMENTATION_EVIDENCE.md)** — [`#work-instruction-347-tier3-align6-doc-closure`](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-align6-doc-closure)에 **완료 요약**(스캔 범위, (1)(2)(3) 건수, 별도 후속 ID 목록, 실행한 검증 명령) 기록.
- **`PR`(권장)** — 제목 예: `[353-x] [347] 3순 1순위 — ALIGNMENT §6 문서 클로저` · 본문에 **`EVIDENCE-20260426-353`** 또는 **`353+`** 명시.

## 6. 검증

- **`src/**` 변경 없음(원칙):** `npm run verify:canonical-sources`
- **`src/**` 변경이 생긴 경우(비권장·분리 권장):** `npm run verify:349-12` 및 팀 CI 정책에 따름

## 7. 증빙 앵커

- 본 작업지시: 이 문서
- 상위 선정·1순위: [#work-instruction-347-tier3-followup-axes](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-followup-axes)
- 실행 기록: [#work-instruction-347-tier3-align6-doc-closure](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-align6-doc-closure)
