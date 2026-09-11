# AI법친 — Inicis OpenMall AML Phase A

MJN PR79 정책 레이어의 TypeScript 샘플 이식.

## 포함

| 경로 | 역할 |
|------|------|
| `src/features/payments/inicis-openmall-aml.ts` | 순수 eligibility / parse (네트워크 없음) |
| `src/features/arkaon/arkaon-aml-guidance.ts` | 읽기전용 체크리스트 |
| `src/app/api/admin/arkaon/aml-guidance/route.ts` | ADMIN GET 브리핑 |
| `.env.example` | `INICIS_OPENMALL_*` 계약 |

## 명시적 비포함 (Phase B/C)

- 실 `amlstatus` HTTP 클라이언트 호출
- Prisma AML 프로필 테이블
- 지급/정산 execute 경로 훅
- `INICIS_OPENMALL_AML_APPROVED_STATUSES` 추정 값

`INICIS_OPENMALL_AML_LIVE_GATE_WIRED` 상수는 `false`로 고정한다.

다플랫폼 계획: [PHASE_A_MULTI_PLATFORM_PRESEED.md](./PHASE_A_MULTI_PLATFORM_PRESEED.md)
