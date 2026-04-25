# tools

## `aibeopchin_navigator.py`

프로젝트 **Phase·원칙·계획** 출력, **본선 기준 파일** 존재 확인, **`check-status`**(구 토큰 휴리스틱) 등을 담당한다.

- 사용 예: `python tools/aibeopchin_navigator.py show-plan`  
- Windows 등에서 `python` 이 없으면: `py -3 tools/aibeopchin_navigator.py ...`

### `check-status` (중요)

`OPEN` / `IN_PROGRESS` / `DONE` 을 찾는 **단순 휴리스틱**이다.

- 기본(`--scope all`)은 **저장소 전체**를 스캔하므로, 사건과 무관한 도메인(알림·OPS 등) 문자열이 **대량으로 걸릴 수 있다.**
- **exit 1·경고 다수 = 사건 `CaseStatus` 오류**로 자동 연결하지 않는다.
- 좁혀 보려면 `--scope case` (스캔 경로는 스크립트 내 `CASE_SCOPE_EXACT_FILES`·`CASE_SCOPE_PREFIXES` 하드코딩 — **디렉터리 구조가 바뀌면 누락 가능**; **Phase 5 역점검** 항목으로 최신화).

상세: [CASE_STATUS_DEFINITION.md](../docs/project-governance/CASE_STATUS_DEFINITION.md) **「5.1 `check-status` 결과 해석 (필수)」**, [IMPLEMENTATION_EVIDENCE.md](../docs/project-governance/IMPLEMENTATION_EVIDENCE.md) **「4-1. `check-status` 결과 해석 (오해 방지)」**. (절 제목 변경 시 본 줄도 맞춘다.)
