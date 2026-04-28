# 대시보드 3.7 — 관리자 대시보드 마감 점검표 / 회귀 체크리스트

> 본 문서는 **배포 전 QA 확정표**(`deployment-checklist.md` §6 등)와 **별도**이다. 관리자 대시보드 3.4~3.6 구현 축의 **회귀·마감 점검** 전용이다.

## 0. 기준 증빙

- [EVIDENCE-20260426-383](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-383) 대시보드 3.4 — 관리자 장기 미진행 후보
- [EVIDENCE-20260426-384](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-384) 대시보드 3.4b — 관리자 장기 미진행 보조 count metric 후보
- [EVIDENCE-20260426-385](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-385) 대시보드 3.5 — 관리자 상태별 운영 확인 문구 정리
- [EVIDENCE-20260426-386](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-386) 대시보드 3.6 — 관리자 PreviewCard 빈 상태/로딩 문구 정리

## 1. 점검 목적

이 문서는 관리자 대시보드 3.4~3.6 변경분이 배포 전에도 기존 기능을 깨지 않았는지 확인하기 위한 회귀 체크리스트다.

이번 점검은 기능 추가가 아니라 다음 항목의 유지 여부를 확인한다.

- 관리자 운영 확인 후보 preview 병합 기준 유지
- 장기 미진행 후보 badge 표시 기준 유지
- 장기 미진행 보조 count metric 표시 기준 유지
- 상태별 운영 확인 reason 문구 유지
- 빈 상태 문구 유지
- 기존 집계 기준 유지
- 금지 표현 미사용
- 신규 API / DB schema / 권한 / 상태값 변경 없음

## 2. 절대 변경 금지 기준

- 신규 API route 생성 없음
- DB schema 변경 없음
- 권한 정책 변경 없음
- middleware 변경 없음
- getSessionUser / requireSessionUser 의미 변경 없음
- CaseStatus canonical 변경 없음
- 사건 / 인터뷰 / 문서 생성 로직 변경 없음
- 문서 승인 / 생성 로직 변경 없음
- 질문셋 [343]~[350] 재오픈 없음
- FILE-1B 변경 없음
- 배포 전 QA 확정표 갱신 없음
- Living Logo V2 구조 변경 없음
- dashboard-demo-metrics.ts 삭제 없음
- 실제 알림·에스컬레이션 로직 추가 없음
- attentionNeeded count 기준 변경 없음
- staleCaseCount count 기준 변경 없음

## 3. 관리자 장기 미진행 후보 preview 점검

대상 파일:

- src/lib/dashboard/admin-stale-case.ts
- src/lib/dashboard/dashboard-metrics.ts
- src/components/dashboard/admin/admin-risk-board.tsx

점검 항목:

- [ ] 7일 이상 미변경 사건은 확인 후보로 분류된다.
- [ ] 14일 이상 미변경 사건은 우선 확인 후보로 분류된다.
- [ ] 30일 이상 미변경 사건은 장기 미진행 후보로 분류된다.
- [ ] 미래 날짜 또는 당일 업데이트 사건의 staleDays는 0일로 처리된다.
- [ ] stale preview 조회 대상 상태는 HOLD / INTAKE_PENDING / REVIEW_PENDING이다.
- [ ] stale preview 조회는 updatedAt <= 7일 cutoff 기준이다.
- [ ] stale preview는 updatedAt asc 기준으로 최대 5건 조회한다.
- [ ] 기존 최신 attention preview와 stale preview는 Map으로 병합된다.
- [ ] 중복 id는 제거된다.
- [ ] stale 후보가 동일 id를 덮어써 장기 미진행 정보가 보존된다.
- [ ] 최종 preview는 최대 5건이다.
- [ ] 정렬은 장기 미진행 우선 → 오래 멈춘 순 → 최신 업데이트 순 기준이다.
- [ ] attentionNeeded count에는 stale 후보 수를 합산하지 않는다.

## 4. 장기 미진행 보조 count metric 점검

대상 파일:

- src/lib/dashboard/dashboard-metrics.ts
- src/components/dashboard/admin/admin-risk-board.tsx

점검 항목:

- [ ] staleCaseCount가 관리자 dashboard metrics에 포함된다.
- [ ] staleCaseCount 기준 상태는 HOLD / INTAKE_PENDING / REVIEW_PENDING이다.
- [ ] staleCaseCount 기준은 updatedAt <= 7일 cutoff이다.
- [ ] staleCaseCount는 attentionNeeded에 합산되지 않는다.
- [ ] staleCaseCount는 보조 지표로만 표시된다.
- [ ] 화면에서 attentionNeeded와 staleCaseCount가 합산된 것처럼 보이지 않는다.
- [ ] 실제 알림 또는 에스컬레이션 로직으로 연결되지 않는다.

## 5. 상태별 운영 확인 reason 문구 점검

대상 파일:

- src/lib/dashboard/dashboard-metrics.ts

점검 항목:

- [ ] HOLD reason은 “보류 상태로 남아 있어 진행 상태 확인이 필요합니다.”이다.
- [ ] INTAKE_PENDING reason은 “접수 대기 상태로 남아 있어 초기 확인이 필요합니다.”이다.
- [ ] REVIEW_PENDING reason은 “검토 대기 상태로 남아 있어 담당자 확인이 필요합니다.”이다.
- [ ] 그 외 상태 fallback은 “운영 확인이 필요한 사건입니다.”이다.
- [ ] staleReason이 있으면 상태별 일반 reason보다 우선 표시된다.
- [ ] reason 문구에 위험도, 장애, 치명, P0, P1 표현이 들어가지 않는다.

## 6. 관리자 PreviewCard 빈 상태 문구 점검

대상 파일:

- src/components/dashboard/admin/admin-risk-board.tsx

점검 항목:

- [ ] 운영 확인 후보가 없을 때 제목은 “현재 운영 확인 후보는 없습니다.”이다.
- [ ] 운영 확인 후보가 없을 때 보조 문구는 “보류, 접수 대기, 검토 대기 상태의 사건이 확인되면 이 영역에 표시됩니다.”이다.
- [ ] 장기 미진행 후보가 0건이면 “장기 미진행 후보도 현재 확인되지 않았습니다.” 기준으로 표시된다.
- [ ] 장기 미진행 후보가 1건 이상이면 “운영 확인 보조 지표” 기준 문구로 표시된다.
- [ ] dashboard-empty-state.tsx / dashboard-preview-card.tsx 공용 구조는 불필요하게 변경하지 않는다.
- [ ] 별도 로딩 UI가 없는 경우 로딩 문구를 새로 만들지 않는다.

## 7. 금지 표현 검색

아래 표현은 관리자 대시보드 3.4~3.6 경로의 사용자 노출 문구에 신규 삽입하지 않는다.

- 위험
- 장애
- 치명
- P0
- P1
- 위험 폭증
- 운영 사고
- 법률 위험도
- 에스컬레이션

확인 명령:

```bash
grep -R "위험" -n src/components/dashboard/admin src/lib/dashboard
grep -R "장애" -n src/components/dashboard/admin src/lib/dashboard
grep -R "치명" -n src/components/dashboard/admin src/lib/dashboard
grep -R "P0" -n src/components/dashboard/admin src/lib/dashboard
grep -R "P1" -n src/components/dashboard/admin src/lib/dashboard
grep -R "에스컬레이션" -n src/components/dashboard/admin src/lib/dashboard
```

기존 주석이나 다른 역할 대시보드의 과거 문자열은 이번 점검 대상에서 제외한다. 이번 점검 대상은 관리자 운영 카드와 관리자 dashboard metrics 경로다.

## 8. 검증 명령

```bash
npx tsc --noEmit
npx eslint src/lib/dashboard/admin-stale-case.ts src/lib/dashboard/dashboard-metrics.ts src/components/dashboard/admin/admin-risk-board.tsx --max-warnings 0
npm run lint
npm run verify:canonical-sources
```

## 9. 완료 판정

아래가 모두 충족되면 대시보드 3.7을 완료로 본다.

- 3.4~3.6 변경분 회귀 체크리스트 작성 완료
- 장기 미진행 preview 기준 확인 완료
- staleCaseCount 보조 지표 기준 확인 완료
- 상태별 reason 문구 확인 완료
- 빈 상태 문구 확인 완료
- 금지 표현 신규 삽입 없음 확인
- 신규 API / DB schema / 권한 / 상태값 변경 없음 확인
- attentionNeeded 기준 변경 없음 확인
- staleCaseCount 기준 변경 없음 확인
- `npx tsc --noEmit` 통과
- 지정 경로 eslint 통과
- `npm run lint` 통과
- `npm run verify:canonical-sources` 통과

## 10. 다음 후보

3.7 이후 다음 후보는 기능 확장이 아니라 배포 전 안정화 축으로 둔다.

- 대시보드 3.8 — 역할별 대시보드 최종 문구 스냅샷
- 또는 배포 전 QA 회신 수신 후 [#evidence-20260428-predeploy-qa-closure](./IMPLEMENTATION_EVIDENCE.md#evidence-20260428-predeploy-qa-closure) 확정 기록
