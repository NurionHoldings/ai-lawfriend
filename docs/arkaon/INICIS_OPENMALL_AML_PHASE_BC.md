# Inicis OpenMall AML — Phase B / C (AI법친)

**Phase A**: 순수 policy stub + 읽기전용 guidance ([INICIS_OPENMALL_AML_PHASE_A.md](./INICIS_OPENMALL_AML_PHASE_A.md))  
**본 문서**: B(연동 준비) · C(지급 직전 게이트) — **HQ 승인 전 live wiring 금지**

---

## Phase 경계

| Phase | 내용 | `LIVE_GATE_WIRED` | 지급 execute |
|-------|------|-------------------|--------------|
| A ✅ | parse / decide / guidance / env 문서 | `false` | 없음 |
| B ⏳ | HTTP `amlstatus` 클라이언트 **스켈레톤** + 타임아웃·에러 타입 + 프로필 스키마 **초안** | `false` | 없음 |
| C 🔒 | 지급 직전 재조회 훅 + allowlist(서면) + 멱등·X-Request-ID | HQ PR에서만 `true` 검토 | HQ+코드 |

상수 `INICIS_OPENMALL_AML_LIVE_GATE_WIRED`는 Phase C 단일 PR·HQ 승인 전까지 **코드상 `false` 고정**.

---

## Phase B Exit (코드 준비, 실호출 OFF)

1. [x] `fetchAmlStatus` 인터페이스 + `NotWiredError` (네트워크 기본 차단)
2. [x] env: timeout / base URL / enabled 읽기 헬퍼 유지
3. [x] guidance에 `phaseRoadmap` · `blockers` 노출
4. [ ] HQ: 법인 계약·MID·API KEY 발급 (시크릿은 env만)
5. [ ] HQ: `amlExmnYn` 승인값 **서면** 확인 → `INICIS_OPENMALL_AML_APPROVED_STATUSES` 채움
6. [ ] Prisma `OpenMallAmlProfile` (idMall ↔ 수취인) 마이그레이션 — **별도 HQ 승인 PR**

## Phase C Exit (게이트 연결)

1. [ ] 지급 경로 직전에만 `fetchAmlStatus` + `decideAmlEligibility`
2. [ ] allowlist 공란 / 네트워크 실패 / 만료 → fail-closed
3. [ ] 멱등키 · `X-Request-ID` · 감사 로그(시크릿·PII 제외)
4. [ ] `LIVE_GATE_WIRED=true` 단일 플립 + CI assert 갱신
5. [ ] 잔액·송금 대사 알림 런북

---

## HQ 차단 항목 (추정 금지)

- `APPROVED_STATUSES` 값 추정 채움
- 시크릿·계좌·대표자 PII를 DNA/브라우저/로그에 기록
- Arkaon에 의한 AML 수동 승인·지급 실행

## 구현 포인터

| 파일 | 역할 |
|------|------|
| `src/features/payments/inicis-openmall-aml.ts` | Phase A decide |
| `src/features/payments/inicis-openmall-aml-client.ts` | Phase B client skeleton (default not wired) |
| `src/features/arkaon/arkaon-aml-guidance.ts` | roadmap + blockers |
| `.env.example` | `INICIS_OPENMALL_*` |

## 검증

```bash
npx vitest run src/features/payments/inicis-openmall-aml.test.ts src/features/payments/inicis-openmall-aml-client.test.ts src/features/arkaon/arkaon-aml-guidance.test.ts
```

`LIVE_GATE_WIRED === false` 유지.
