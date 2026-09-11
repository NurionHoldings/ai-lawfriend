# ARKAON Participation Contract — AI법친

권한 확장이 아닌 **읽기/검색/기록** 계약입니다.  
SSOT는 구현(`src/app/api/admin/arkaon/participation/route.ts`)입니다.

## Endpoint

단일 라우트:

`/api/admin/arkaon/participation?action=<action>`

| 동작 | Method | `action` |
|------|--------|----------|
| Host profile 사전고지 | GET | `host-profile` |
| No-touch map | GET | `no-touch-map` |
| Wake | GET | `wake` |
| 방문 목록(미종료) | GET | `agent-visits` |
| Change DNA 목록 | GET | `change-intent-dna` |
| Peer review 대기 | GET | `cross-checks` |
| 방문 알림 | POST | `agent-visits-announce` |
| 방문 종료 | POST | `agent-visits-close` |
| Change DNA 기록 | POST | `change-intent-dna` |
| Peer review 요청 | POST | `cross-checks` |
| Peer review 판정 | POST | `cross-checks-verdict` |

인증 헤더: `X-ARKAON-AGENT-KEY: <ARKAON_AGENT_HANDOFF_SECRET>` (16자+).

### 인증 정책 (fail-closed)

| 환경 | 시크릿 미설정 | 키 불일치 |
|------|---------------|-----------|
| `NODE_ENV=production` 또는 `NEXT_PUBLIC_APP_ENV` = `production`/`staging` | **401** `handoff_secret_required` | **401** |
| 로컬/dev/test | 로컬 파일 폴백 허용 | 시크릿이 설정된 경우 **401** |

로컬 폴백 경로: `.arkaon/participation/` (`store.json`은 gitignore, `host_profile.json`은 커밋 가능).

## Host / secret 범위

- Netlify Functions 제품 → Netlify env의 `ARKAON_AGENT_HANDOFF_SECRET` 필수(배포 환경)
- Railway 등 API 본체 제품 → API 호스트 env 필수 (Netlify만으로는 부족)
- 배포 환경에서 시크릿 미설정은 **허용되지 않음**(과거 “폴백 OK” 고지는 폐기)

## 금지

- 결제·환불·제재·PII mutate 권한 확대
- 시크릿·토큰·실값을 DNA/방문/리뷰에 기록
- AML/지급 자동 승인·실행

## 관련

- `docs/arkaon/INICIS_OPENMALL_AML_PHASE_A.md`
- `GET /api/admin/arkaon/aml-guidance` (읽기 전용)
