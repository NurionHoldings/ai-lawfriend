# AI법친 (aibeopchin)

Next.js · Prisma 기반 애플리케이션입니다.

## 문서

| 문서 | 설명 |
|------|------|
| [docs/handover-and-operations.md](docs/handover-and-operations.md) | 운영 영역 인수인계·운영 매뉴얼 |
| [OPERATIONS_RECOVERY.md](OPERATIONS_RECOVERY.md) | **패치 후 장애 시** 운영 복구 체크리스트 (증상·1차 복구·최소 롤백) |
| [docs/operations-recovery-checklist.md](docs/operations-recovery-checklist.md) | 운영 복구 체크리스트 (요약) |
| [docs/post-patch-verification.md](docs/post-patch-verification.md) | 패치 직후 점검 명령 |
| [docs/minimum-rollback-playbook.md](docs/minimum-rollback-playbook.md) | 최소 롤백·4파일·10분 순서 |
| [docs/incident-recovery-playbook.md](docs/incident-recovery-playbook.md) | 장애 등급·판단 |
| [docs/grep-rg-troubleshooting.md](docs/grep-rg-troubleshooting.md) | `rg` 검색 치트시트 |
| [docs/ops-platform-finishing.md](docs/ops-platform-finishing.md) | 운영 플랫폼 마감(충돌 점검·경로 맵·스모크·검수) |
| [docs/README.md](docs/README.md) | docs·루트 운영 문서 상위 인덱스(4종 세트 역할·상황별 진입) |
| [docs/OPERATIONS_INDEX.md](docs/OPERATIONS_INDEX.md) | 운영 문서 인덱스(복구·마감·배포 전 어떤 문서를 볼지) |
| [PATCH_FINAL_CHECKLIST.md](PATCH_FINAL_CHECKLIST.md) | 운영 패치 최종 검수 체크리스트 |
| [DEPLOY_PRECHECK.md](DEPLOY_PRECHECK.md) | 배포 직전 최종 확인만 모은 체크리스트 |

## 스크립트

```bash
npm install
npm run dev
npm run lint
npm run test
npm run build
```

자세한 점검 순서는 [docs/post-patch-verification.md](docs/post-patch-verification.md)를 참고합니다.
