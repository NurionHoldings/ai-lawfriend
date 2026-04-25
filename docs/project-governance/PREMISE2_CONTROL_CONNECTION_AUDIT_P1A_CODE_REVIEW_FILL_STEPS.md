# P1-A 실제 코드 역점검 실기입용 점검 순서

| 항목 | 내용 |
|------|------|
| 기준 | [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **[EVIDENCE-20260421-195]** · [PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_CHECKLIST.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_CHECKLIST.md) §3 · [PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_RESULT_TEMPLATE.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_RESULT_TEMPLATE.md) |
| 본 문서 증빙 | [EVIDENCE-20260421-196] |

---

## 점검 순서 (실행)

1. **[IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md)** 의 **[EVIDENCE-20260421-195]** 를 확인한다. (P1-A 기입 예시·형식·주의사항)
2. **[PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_CHECKLIST.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_CHECKLIST.md)** 의 **§3 P1-A** 절을 연다.
3. **`src/lib/definitions/case-lifecycle.ts`** 에서 **`CREATED` → `INTAKE_PENDING`** 직접 전이(동일 `(from,to)` 규칙)가 **`CASE_TRANSITIONS`** 에 존재하는지 확인한다.
4. **`src/app/api/cases/route.ts`** 에서 사건 **생성(POST)** 직후 별도 **상태 전환** 호출이 있는지 확인한다. (생성 시 `status` 직접 입력 거부·`createCaseService` 경로 등)
5. **`src/components/cases/case-form.tsx`** 에서 intake·접수 보완 성격으로 **오해될 수 있는** 문구·액션·리다이렉트가 있는지 확인한다. (필요 시 사건 상세·보완 허브 등 연결 화면까지 확장)
6. 결과를 **[PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_RESULT_TEMPLATE.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_RESULT_TEMPLATE.md)** 의 **P1-A** 칸에 **실기입**한다. (복사본 파일을 만들어 적어도 된다.)
7. **☐ / ☑ / —** 표기, **임시 판정**, **결과 한 줄** 을 확정한다.
8. 실제 확인한 **파일·지점·메모**를 적고, **새 `[EVIDENCE-YYYYMMDD-00n]`** 블록을 [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) 에 추가한다.
9. 아래 검증 명령을 **재실행**하고 결과를 증빙 블록에 기록한다.

```bash
npx tsc --noEmit
npm run lint
npm run verify:canonical-sources
```

---

## 한 줄 결론

P1-A 실기입은 **증빙 [195] → 체크리스트 §3 → 서버·API·UI 순 확인 → 템플릿 기입 → 새 증빙 → 검증 3종 재기록** 순서로 끝낸다.

**완료 실기입본:** [PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_RESULT_FILLED.md) — [EVIDENCE-20260421-197].

---

## 참고 저장소 스냅샷 (자동 점검, 실기입 시 재확인)

아래는 문서 작성 시점의 코드 스냅샷이며, **실제 역점검 증빙을 대체하지 않는다.**

- **`CASE_TRANSITIONS`** 에는 `from: CREATED`, `to: INTAKE_PENDING` 형태의 **단독 규칙 행이 없음** (`SUBMIT_INTAKE` 는 `LifecycleActionEnum` 에만 있고 동일 테이블에 매칭 행 없음).
- **`POST /api/cases`** 는 요청 본문에 `status` 직접 입력을 **거부**하고, 초기 상태는 서버가 설정한다는 메시지를 둠.
- **`prisma` Case `status`** 기본값은 **`CREATED`** (스키마 `@default(CREATED)`).

실기입 시 **grep·리뷰 결과**를 템플릿 메모에 그대로 붙인다.
