# ARKAON Participation Contract — AI법친

권한 확장이 아닌 **읽기/검색/기록** 계약입니다.

## Endpoints (또는 동등 로컬 파일)

| 동작 | 경로 |
|------|------|
| 방문 알림 | `POST /api/admin/arkaon/participation/agent-visits/announce` |
| 방문 목록 | `GET /api/admin/arkaon/participation/agent-visits` |
| Change DNA | `POST/GET /api/admin/arkaon/participation/change-intent-dna` |
| Peer review | `POST/GET /api/admin/arkaon/participation/cross-checks` + `.../verdict` |
| Wake | `GET /api/admin/arkaon/participation/wake` |
| Host profile 사전고지 | `GET /api/admin/arkaon/participation/host-profile` |
| No-touch | `GET /api/admin/arkaon/participation/no-touch-map` |

인증: `X-ARKAON-AGENT-KEY: <ARKAON_AGENT_HANDOFF_SECRET>` (16자+) 또는 제품 admin 세션.

## Host / secret 범위
- Netlify Functions 제품 → Netlify env만
- Railway 등 API 본체 제품 → API 호스트 env 필수 (Netlify만으로는 부족)
- 미설정 시 `.arkaon/participation` 폴백, 추후 개별 적용 가능
