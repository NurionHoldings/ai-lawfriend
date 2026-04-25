# WORKING_CHECKLIST

작업 전·중·후에 빠르게 훑는 체크리스트이다. 상세는 `STATUS_SINGLE_SOURCE_OF_TRUTH.md`, `EXECUTION_SEQUENCE.md` 를 본다.

## 시작 전

- [ ] `npm run verify:canonical-sources` (또는 `npx tsx scripts/verify-canonical-sources.ts`)
- [ ] `python tools/aibeopchin_navigator.py check-status` (또는 `show-plan` 으로 Phase 확인)
- [ ] 현재 Phase·다음 산출물이 `EXECUTION_SEQUENCE.md` 와 맞는지 확인

## 작업 중

- [ ] 상태·전이·권한 변경 시 `prisma/schema.prisma` + `case-status.ts` 와 불일치 없음
- [ ] 옛 메모·패치 노트 인용 시 매핑표 또는 인용 구간 명시
- [ ] 구 패치셋(`aibeopchin_patchset` 등)을 본선 단일 기준으로 취급하지 않음

## 끝낼 때

- [ ] `python tools/aibeopchin_navigator.py check-status` (경고만 확인, 휴리스틱; 사건만 보려면 `--scope case`)
- [ ] `NEXT_SESSION_BRIEF.md` 또는 `make-brief` 로 다음 시작점 기록
- [ ] 필요 시 `.aibeopchin/project_plan.json` 진행 필드 갱신
