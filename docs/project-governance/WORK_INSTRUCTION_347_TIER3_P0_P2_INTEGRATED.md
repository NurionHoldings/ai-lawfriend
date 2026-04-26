# [347] 3순 P0 잔여·P2 통합 실착 작업지시서

## 0. 작업명

[347] 3순 P0 잔여·P2 통합 실착 작업

## 개발팀 전달 기준

**우선 전달 문서**

- [WORK_INSTRUCTION_347_TIER3_P0_P2_INTEGRATED.md](WORK_INSTRUCTION_347_TIER3_P0_P2_INTEGRATED.md) (본 파일)

**보조 참조 문서**

- [WORK_INSTRUCTION_347_TIER3_P0_REMAINING_P2_SEPARATE_PR.md](WORK_INSTRUCTION_347_TIER3_P0_REMAINING_P2_SEPARATE_PR.md)

**실착 후 증빙 위치**

- [IMPLEMENTATION_EVIDENCE.md](IMPLEMENTATION_EVIDENCE.md) — [#work-instruction-347-tier3-p0-p2-integrated-audit](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-p0-p2-integrated-audit)

**증빙 작성 방식**

- 통합 실사는 **한 번에** 진행한다.
- 기록은 **ST-01** / **[310] 예외 (1)** / **[310] 예외 (3)** / **ST-02** / **ST-05** / **운영** 축별로 **구분**한다.
- **닫힌 축 재오픈 없음**
- **`CaseStatus` canonical 변경 없음**

**통합 실착 완료 후 [347] 3순 다음 단계:** [WORK_INSTRUCTION_347_TIER3_FOLLOWUP_AXES.md](WORK_INSTRUCTION_347_TIER3_FOLLOWUP_AXES.md) · [#work-instruction-347-tier3-followup-axes](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-followup-axes)

## 1. 기준 문서

이번 작업은 아래 문서를 기준으로 진행한다.

- [WORK_INSTRUCTION_347_TIER3_P0_REMAINING_P2_SEPARATE_PR.md](WORK_INSTRUCTION_347_TIER3_P0_REMAINING_P2_SEPARATE_PR.md) — PR 분리 원칙·닫힘 유지
- [IMPLEMENTATION_EVIDENCE.md](IMPLEMENTATION_EVIDENCE.md)
  - [#work-instruction-347-tier3-p0-p2-separate-pr](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-p0-p2-separate-pr)
  - [#work-instruction-347-tier3-p0-p2-integrated-audit](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-p0-p2-integrated-audit) (본 실착 증빙 앵커)
  - [#evidence-20260426-353](IMPLEMENTATION_EVIDENCE.md#evidence-20260426-353)
  - [#p0-353-p0-완료-후속](IMPLEMENTATION_EVIDENCE.md#p0-353-p0-완료-후속)
  - [#p0-353-p1p2-next](IMPLEMENTATION_EVIDENCE.md#p0-353-p1p2-next)
  - [#p0-353-plus-dual-axis-real](IMPLEMENTATION_EVIDENCE.md#p0-353-plus-dual-axis-real)
- `tools/aibeopchin_navigator.py` — `PROJECT_PLAN["post_352_next_347_tier3_alignment"]`
- [DEV_BRIEF_POST_STEP3_352.md](DEV_BRIEF_POST_STEP3_352.md)

## 2. 이번 작업의 목적

[347] 3순에서 남은 **P0 잔여**와 **P2** 항목을 **한 번에 실사**하고, 필요한 **최소 수정**까지 진행한다.

대상은 다음 **5개 축**이다.

### P0 잔여

1. **ST-01**
   - 레거시 `CaseStatus` 문자열
   - canonical 2파일 유지
   - [310] 예외 **(1)**, **(3)** 관련 잔여 확인

2. **[310] 예외 (1)**
   - §6-1 ST-01~05 세부 부분일치·보류 항목
   - 실제로 남은 코드 수정 대상인지, 문서상 보류만 남은 것인지 **판정**

3. **[310] 예외 (3)**
   - `check-status` 휴리스틱/오탐 예외
   - 실제 상태 오류인지, 운영상 허용되는 휴리스틱 경고인지 **판정**

### P2

4. **ST-02**
   - 상태 표시 레이블 vs canonical 정렬
   - label map 일원화

5. **ST-05 / 운영**
   - `check-status`·운영 메시지 정렬
   - 내비게이터·증빙 루틴 정리
   - 반복 운영 기준 문구 정렬

## 3. 절대 재오픈 금지

아래는 이미 **닫힌 축**이다. 이번 작업에서 **다시 열지 않는다**.

- **353+** UI 가용 액션 이중 축 — [#p0-353-plus-dual-axis-real](IMPLEMENTATION_EVIDENCE.md#p0-353-plus-dual-axis-real) · [#353-plus-separate-pr](IMPLEMENTATION_EVIDENCE.md#353-plus-separate-pr)
- **P1** RB-01~RB-05
- **IO-05**
- **P0 첫 코드 묶음:** IV-04, IV-05, LC-03, ST-03, `interview/complete` 경로
- **[353-ST01]** **완료 판정 자체**를 번복·재검토하는 방식의 재오픈(문서 절을 “없던 일”로 만들지 않음)
- **[353-P1P2]** 분류 문서 **완료 판정** 번복
- **`CaseStatus` canonical 변경**
- `prisma/schema.prisma`의 `CaseStatus` **수정**
- `src/lib/definitions/case-status.ts`의 `CaseStatus` **수정**

**중요:**

- 이번 작업은 **새로운 상태 추가 작업이 아니다.**
- 이번 작업은 **canonical 상태 정의를 바꾸는 작업이 아니다.**
- 이번 작업은 **닫힌 RB·IO·353+ 축을 재검토하는 작업이 아니다.**

## 4. 작업 방식

개발팀은 시간을 절약하기 위해 위 **5개 축을 한 번에 실사**한다.

다만 **증빙 기록은 축별로 분리**한다.

| 항목 | 방식 |
|------|------|
| 작업 | 한 번에 |
| 실사 | 한 번에 |
| `grep` 등 탐색 | 한 번에 |
| 검증 | 한 번에(또는 §12 기준) |
| `IMPLEMENTATION_EVIDENCE.md` | **ST-01 / 310(1) / 310(3) / ST-02 / ST-05·운영** 축별로 구분 기록 |

**한 줄:** 작업은 한 번에, 증빙은 축별로.

## 5. 먼저 열어둘 파일·탐색 명령

### 5-1. 파일

```txt
docs/project-governance/WORK_INSTRUCTION_347_TIER3_P0_REMAINING_P2_SEPARATE_PR.md
docs/project-governance/IMPLEMENTATION_EVIDENCE.md
tools/aibeopchin_navigator.py
docs/project-governance/DEV_BRIEF_POST_STEP3_352.md
docs/project-governance/ALIGNMENT_AUDIT_V1.md
prisma/schema.prisma
src/lib/definitions/case-status.ts
```

상태·라벨·운영 메시지 관련 후보 파일은 아래 `grep` / `Select-String`으로 확인한다.

### 5-2. Unix 스타일 (참고)

```bash
grep -R "CaseStatus" -n src prisma docs tools
grep -R "CREATED\|INTAKE_PENDING\|IN_INTERVIEW\|INTERVIEW_DONE\|DRAFTING\|REVIEW_PENDING\|APPROVED\|CLOSED\|HOLD\|REJECTED\|DELETED" -n src docs tools
grep -R "caseStatusLabel\|statusLabel\|CASE_STATUS_LABEL\|CASE_STATUS_LABELS\|label map\|labelMap" -n src docs tools
grep -R "check-status\|check status\|verify:canonical-sources\|canonical" -n docs tools package.json src
grep -R "ST-01\|ST-02\|ST-05\|\[310\]\|310 예외" -n docs tools src
```

### 5-3. Windows PowerShell (예시)

```powershell
Get-ChildItem -Recurse -Include *.ts,*.tsx,*.md,*.py,*.json,*.prisma -Path src,docs,tools,prisma -ErrorAction SilentlyContinue |
  Select-String -Pattern "CaseStatus"
Get-ChildItem -Recurse -Include *.ts,*.tsx,*.md,*.py -Path src,docs,tools -ErrorAction SilentlyContinue |
  Select-String -Pattern "ST-01|ST-02|ST-05|\[310\]|310 예외"
```

(경로·포함 확장자는 팀 환경에 맞게 조정한다.)

---

## 6. P0 잔여 — ST-01 실사 지시

### 6-1. 목적

ST-01 잔여가 **실제 코드 수정 대상**인지 확인한다.

**확인 대상:** canonical `CaseStatus` 2파일 · 레거시 문자열 · 문서상 보류 · `check-status` 경고 중 실제 오류 vs 휴리스틱 오탐

**canonical 2파일:**

- `prisma/schema.prisma`
- `src/lib/definitions/case-status.ts`

**주의:** 위 두 파일의 `CaseStatus` **열거형/값은 이번 작업에서 변경하지 않는다** (§3).

### 6-2. 확인할 것

- 두 canonical 파일의 `CaseStatus` 멤버·순서·값이 **일치**하는가?
- `src/**`에 canonical에 **없는** 상태 문자열이 **실제 분기**로 남아 있는가?
- `docs`/`tools`의 레거시 문자열이 **현행 코드 기준**인지 **과거 증빙 문구**인지 구분되는가?
- `check-status` 경고가 **실제 상태 오류**인지 **§4-1·[310](IMPLEMENTATION_EVIDENCE.md#evidence-20260423-310) 허용 휴리스틱**인가?
- [310] **(1)**, **(3)**과 연결되는 **남은 실착 대상**이 있는가?

### 6-3. 판정

**A. 코드 수정 필요 없음** — canonical 2파일 일치 · `src/**` 기준 실질 레거시 없음 · docs/tools는 과거 증빙 또는 의도 예외 · `check-status`는 §4-1·[310] 기준 허용 가능 → **문서 증빙만** 추가.

**B. 문서 정리만 필요** — 코드 오류 없으나 문서에 “잔여”처럼 보이는 문구·닫힌 축 재오픈처럼 읽히는 표현 → **`IMPLEMENTATION_EVIDENCE.md`·내비·관련 문서 문구만** 정리.

**C. 최소 코드 수정 필요** — `src/**`에 canonical 외 문자열이 **실제 분기·타입**으로 사용됨 · label map / status guard에서 **실오류** → **해당 파일만 최소 수정**.

**금지:** `CaseStatus` 새 값 추가 · canonical 상태명 변경 · P0 첫 코드 묶음 재수정.

---

## 7. [310] 예외 (1) 실사 지시

### 7-1. 목적

[310] **(1)**이 **실제 구현 잔여**인지 **문서상 보류**인지 판정한다.

**확인:** [ALIGNMENT_AUDIT_V1.md §6-1](ALIGNMENT_AUDIT_V1.md#6-1-상태값-정합성) · `IMPLEMENTATION_EVIDENCE.md` [310] 설명 · ST-01~ST-05 부분일치·보류 표현 · [#p0-353-p0-완료-후속](IMPLEMENTATION_EVIDENCE.md#p0-353-p0-완료-후속)

### 7-2. 판정 기준

**실제 구현 잔여:** `src/**`에 상태 불일치 · UI/API가 canonical과 다른 문자열 · 타입/분기에서 실오류 가능.

**문서상 보류:** `src/**` 정렬됨 · docs/tools에 과거 증빙·점검 문구만 · `check-status`가 휴리스틱 오탐으로 설명 가능.

### 7-3. 조치

- **문서상 보류** → `IMPLEMENTATION_EVIDENCE.md`에 “실제 코드 잔여 없음 / 문서상 보류” 명시 · 내비 “P0 잔여” 과장 표현 정리.
- **실제 구현 잔여** → 해당 파일만 최소 수정 · 증빙에 근거 · §12 `verify` 실행.

---

## 8. [310] 예외 (3) 실사 지시

### 8-1. 목적

`check-status` 경고가 **실제 오류**인지 **휴리스틱 오탐**인지 분리한다.

**확인:** `tools` 쪽 `check-status` 관련 스크립트 · [§4-1](IMPLEMENTATION_EVIDENCE.md#4-1-check-status-결과-해석-오해-방지) · [310](IMPLEMENTATION_EVIDENCE.md#evidence-20260423-310) · `verify:canonical-sources` vs `verify:349-12` 관계

### 8-2. 판정 기준

**허용 경고:** `verify:canonical-sources` 통과 · canonical 2파일 일치 · 경고가 문서·주석·과거 증빙 문자열 반응 · `src` 상태 분기 오류 없음.

**실제 오류:** `src/**`에서 canonical 외 상태 사용 · 전이·권한·UI label에 영향 · `verify:canonical-sources` 또는 타입 검사 오류.

### 8-3. 조치

- **휴리스틱** → 문서에 허용 경고 명시 · 운영 메시지를 “실패”가 아닌 “검토 필요”로 다듬을 수 있는지 검토.
- **실제 오류** → 원인 파일 최소 수정 · canonical 변경 없음 · 증빙에 전후 기록.

---

## 9. P2 — ST-02 상태 표시 레이블 vs canonical

### 9-1. 목적·원칙

- 내부 상태값은 **canonical `CaseStatus`**.
- UI 표시 문구는 **label map**에서 관리.
- 상태값과 표시 문구를 **섞지 않음**.
- 흩어진 label map은 **가능하면 한 기준**으로 모음.

### 9-2. 확인할 것 (grep 예시)

```bash
grep -R "CASE_STATUS_LABEL" -n src
grep -R "statusLabel" -n src
grep -R "caseStatusLabel" -n src
grep -R "labelMap" -n src
```

- label map **중복** 여부 · canonical에 **없는** label key · canonical 값인데 **label 없음** · UI에 **raw 상태값 노출** · 한글 표시명 **파일마다 상이** 여부

### 9-3. 권장 정리

- 이미 중앙 map이 있으면 그것을 기준으로 import 통일; 위험 크면 이번 라운드에서는 **중복 후보만** 증빙 기록.
- 없으면 신규 파일 후보: `src/lib/definitions/case-status-labels.ts` (아래는 **구조 예시** — 실제 키는 **현재 canonical** 확인 후만 작성, 추정 추가 금지).

```typescript
import type { CaseStatus } from "@/lib/definitions/case-status";

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  // prisma/schema.prisma · case-status.ts 와 1:1로 맞출 것
};

export function getCaseStatusLabel(status: CaseStatus): string {
  return CASE_STATUS_LABELS[status] ?? status;
}
```

### 9-4. 테스트 (권장)

후보: `src/lib/definitions/__tests__/case-status-labels.test.ts`

- 모든 canonical `CaseStatus`에 label 존재
- label map 키는 canonical만 허용

---

## 10. P2 — ST-05 `check-status`·운영 메시지

### 10-1. 목적·원칙

- `verify:canonical-sources` = canonical 정합 기준
- `check-status` = 휴리스틱 점검
- `check-status` 경고만으로 상태 오류 **단정 금지**
- 운영 문구는 “오류 확정”보다 “검토 필요”가 맞을 수 있음

### 10-2. 확인할 것

- `check-status` 실패가 **배포 차단**처럼 과도하게 적혀 있는지
- [310]·§4-1이 문서·내비에 반영되는지
- `verify:canonical-sources`와 `check-status` **위상 분리**가 문서에 있는지

### 10-3. 조치 (예시 문구)

> `check-status`는 상태 문자열 탐지용 휴리스틱 점검이다. 경고가 있어도 `verify:canonical-sources` 통과와 `src/**` 실제 사용 맥락을 함께 확인한다.

코드/문서 메시지 완화 예: “상태 오류” → “상태 문자열 검토 필요” — 단 **`verify:canonical-sources` 실패는 실패로 유지**.

---

## 11. P2 — 운영 루틴 정리

### 11-1. 목적

다음 작업자가 닫힌 축을 열지 않고 P0/P2를 올바른 순서로 이어가게 한다.

**확인:** `IMPLEMENTATION_EVIDENCE.md` 상단 · `aibeopchin_navigator.py` 다음 진행 문구 · `DEV_BRIEF_POST_STEP3_352.md` · [WORK_INSTRUCTION…SEPARATE_PR.md §6·§7](WORK_INSTRUCTION_347_TIER3_P0_REMAINING_P2_SEPARATE_PR.md)

### 11-2. 조치

- 353+, P1, IO-05, P0 첫 코드 묶음 **닫힘 유지**가 문서에 분명한지
- 다음 활성 = [347] 3순 **P0 잔여·P2** · 실제 수정은 **항목별 근거** 남기기

---

## 12. 통합 검증 명령

- **코드 수정 있음:** `npm run verify:349-12`
- **문서만:** `npm run verify:canonical-sources`
- **권장(코드 touched):** `npm run verify:349-12`

필요 시: `npx tsc --noEmit` · `npm run lint` · `npm run test` — **`package.json`에 정의된 명령만** 사용한다.

---

## 13. `IMPLEMENTATION_EVIDENCE.md` 증빙 기록 형식

작업 완료 후 아래 **형식**으로 기록한다 (앵커: [#work-instruction-347-tier3-p0-p2-integrated-audit](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-p0-p2-integrated-audit)).

```markdown
### [347] 3순 P0 잔여·P2 통합 실착

기준:
- #work-instruction-347-tier3-p0-p2-integrated-audit
- #work-instruction-347-tier3-p0-p2-separate-pr
- #p0-353-p0-완료-후속
- #p0-353-p1p2-next
- WORK_INSTRUCTION_347_TIER3_P0_REMAINING_P2_SEPARATE_PR.md
- WORK_INSTRUCTION_347_TIER3_P0_P2_INTEGRATED.md

범위:
- P0 잔여: ST-01, [310] 예외 (1), [310] 예외 (3)
- P2: ST-02, ST-05, 운영

닫힘 유지:
- 353+ 재오픈 없음
- RB-01~RB-05 재오픈 없음
- IO-05 재오픈 없음
- P0 첫 코드 묶음 재오픈 없음
- CaseStatus canonical 변경 없음

판정:
- ST-01: (코드 수정 필요 / 문서만 / 후속)
- [310] (1): (구현 잔여 / 문서 보류 / 조치)
- [310] (3): (경고 성격 / 휴리스틱 여부 / 조치)
- ST-02: (label 정렬 / 수정 파일 / 테스트)
- ST-05: (메시지 정렬 / 수정 파일)
- 운영: (내비·증빙 / 수정 파일)

수정 파일: …

검증: npm run verify:349-12 exit 0  (또는 문서만 시 verify:canonical-sources exit 0)
```

---

## 14. 완료 판정

아래를 **모두** 만족하면 통합 실착 **완료**.

- ST-01 잔여 판정(A/B/C 중 하나로 명확히)
- [310] (1)(3) 실오류 vs 허용 예외 판정
- ST-02 label map이 canonical과 **충돌 없음** (또는 중복 후보·계획이 증빙됨)
- ST-05·운영: `check-status` vs `verify` 위상·문구 정리
- 내비·증빙이 **다음 축**을 올바르게 가리킴
- §3 닫힘·canonical 불변·검증 통과

---

## 15. PR 본문 템플릿

```markdown
## 작업 범위

[347] 3순 P0 잔여·P2 통합 실착입니다.

기준:
- WORK_INSTRUCTION_347_TIER3_P0_P2_INTEGRATED.md
- WORK_INSTRUCTION_347_TIER3_P0_REMAINING_P2_SEPARATE_PR.md
- #work-instruction-347-tier3-p0-p2-integrated-audit
- #p0-353-p0-완료-후속
- #p0-353-p1p2-next

## 처리 항목

### P0 잔여
- ST-01:
- [310] 예외 (1):
- [310] 예외 (3):

### P2
- ST-02:
- ST-05:
- 운영:

## 닫힘 유지

(§3 동일)

## 수정 파일

(실제만)

## 검증

- npm run verify:349-12 exit 0
```

---

## 16. 최종 한 줄

이번 작업은 [347] 3순의 **P0 잔여**와 **P2**를 **한 번에 실사·정리**하는 통합 작업이다. **닫힌 축은 재오픈하지 않고**, **`CaseStatus` canonical은 변경하지 않으며**, **증빙은 ST-01·310 예외·ST-02·ST-05·운영 축별로 분리**해 남긴다.

**개발팀 전달:** 이 문서([WORK_INSTRUCTION_347_TIER3_P0_P2_INTEGRATED.md](WORK_INSTRUCTION_347_TIER3_P0_P2_INTEGRATED.md)) **하나**를 기준으로 진행해도 된다. 핵심은 **「작업은 한 번에, 증빙은 축별로」**이다.
