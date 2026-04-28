# AI법친 6.9-1 — 개인정보 / 보안 / 동의문구 노출 위치 매핑

## 0. 목적

이 문서는 AI법친 6.9-2 카피 확정 전에,
사건 패키지 공유 기능에서 실제로 사용자에게 노출되는 고지문·동의문구·차단 문구가 어디에 있는지 먼저 고정하기 위한 매핑 문서다.

이번 단계는 문구를 바꾸는 작업이 아니라,
owner 화면, lawyer 화면, 출력물, 정책 오류 메시지, 미래 예정 영역을 한 표면으로 정리해
6.9-2에서 어떤 카피를 어디에 반영할지 충돌 없이 결정할 수 있게 만드는 것이 목적이다.

## 1. 기준 문서

- `docs/project-governance/AIBEOPCHIN_6_9_PRIVACY_SECURITY_NOTICE_FINALIZATION_START.md`
- `docs/project-governance/NOTICE_AND_DISCLAIMER_DEFINITION.md`
- `docs/project-governance/AIBEOPCHIN_6_2_PUBLIC_CODE_AND_SHARE_CONSENT_RULES.md`
- `docs/project-governance/IMPLEMENTATION_EVIDENCE.md`
  - `#evidence-20260428-408`
  - `#evidence-20260428-409`
  - `#evidence-20260428-410`
  - `#evidence-20260428-411`
  - `#evidence-20260428-412`

## 2. 매핑 표

| 대상 | 현재 노출 위치 | 현재 문구/행동 | 6.9-2 정리 포인트 |
| --- | --- | --- | --- |
| 1. 의뢰인 공유 설정 화면 | `src/app/(protected)/cases/[caseId]/share/page.tsx` 상단 안내, `src/components/case-package/case-package-share-client.tsx`의 `CONSENT_TEXT` 및 동의 체크박스 | 상단 중요 안내는 "법률 자문이나 최종 문서가 아님"을 고지하고, `CONSENT_TEXT`는 공유 범위·다운로드 허용 여부·로그 기록 가능성을 포괄적으로 동의시키며, 체크박스는 "변호사 검토용으로 공유하는 데 동의" 문구를 사용함 | 상단 설명, 동의문, 체크박스 문장을 3층 구조로 분리: 서비스 성격 / 제3자 열람 동의 / 로그·취소·책임 경계 |
| 2. 공유 상세 화면 | `src/components/case-package/case-package-share-detail-client.tsx`의 공유 범위 카드 | 공유 상태, 범위, 취소 사유, revoke 후 상태가 보이나 개인정보·보관·책임 고지는 없음 | 상태/범위 설명 옆에 "누가 무엇을 볼 수 있었는지"와 "로그가 남는 이유"를 명시할 필요가 있음 |
| 3. 변호사 고유번호 조회 화면 | `src/app/(lawyer)/lawyer/case-packages/lookup/page.tsx`, `src/components/lawyer/case-package/lawyer-case-package-lookup-client.tsx` 입력 섹션 | 페이지 상단과 조회 박스가 "고유번호만으로는 열람되지 않음", "공유 상태 검증"을 안내하고, 조회 조건 리스트가 ACTIVE/만료/취소/지정 변호사 조건을 노출함 | 열람 고지문을 "권한 검증 전제"와 "책임 경계"로 분리해 더 명확히 할 필요가 있음 |
| 4. 변호사 사건 패키지 열람 화면 | `src/components/lawyer/case-package/lawyer-case-package-lookup-client.tsx`의 `CasePackageViewer` | 사건 요약, 공유 범위, 첨부/문서 목록, 하단 검토 안내에서 "AI 정리 결과는 법률 자문이나 최종 판단이 아님"과 "변호사 검토 필요"를 고지함 | 화면 전반의 고지를 "열람 권한", "AI 생성물 책임", "최종 검토 책임"으로 재배치할 필요가 있음 |
| 5. 첨부파일 다운로드 버튼/차단 메시지 | `src/components/lawyer/case-package/lawyer-case-package-lookup-client.tsx` 첨부 표, `src/lib/case-package/case-package-download-policy.ts` | UI는 다운로드 버튼 또는 `비허용`을 표시하고, 하단에 "다운로드 시 열람 기록이 시스템에 남을 수 있습니다."를 노출함. 서버 차단 메시지는 "의뢰인이 첨부파일 다운로드를 허용하지 않았습니다.", "다운로드할 수 없는 첨부파일입니다." 등을 반환함 | 버튼 주변의 사전 고지와 서버 차단 문구의 톤을 맞추고, 다운로드 허용=열람 동의와 별개라는 점을 더 선명히 해야 함 |
| 6. 사건 패키지 요약본 출력 화면 | `src/components/lawyer/case-package/lawyer-case-package-lookup-client.tsx`의 출력 버튼/비허용 배지, `src/lib/case-package/case-package-summary-renderer.ts` | 화면은 `사건 패키지 요약본 출력` 또는 `요약본 출력 비허용`을 표시하고, HTML 요약본은 헤더/notice/footer에서 "변호사 검토용", "법률 자문 아님", "최종 판단은 전문가 검토 필요"를 세 번 반복 고지함 | 버튼 라벨은 "출력"인데 renderer/footer는 "검토용 요약본"이므로 용어와 책임 문장을 한 기준으로 정리할 필요가 있음 |
| 7. 공유 취소 화면 | `src/components/case-package/case-package-share-client.tsx`의 prompt, `src/components/case-package/case-package-share-detail-client.tsx`의 confirm/설명/성공 메시지, `src/lib/case-package/case-package-share-policy.ts` | UI는 "공유를 취소하면 해당 고유번호로 더 이상 사건 패키지를 열람할 수 없습니다"와 "같은 고유번호는 재사용하지 않는 것이 원칙"을 안내함. 서버 차단은 `취소된 사건 패키지 공유입니다.`를 반환함 | owner 설명문, confirm, lawyer 차단 메시지의 어조를 통일하고 "기존 열람 이력은 남을 수 있음" 여부를 함께 정리할 필요가 있음 |
| 8. 접근 로그/다운로드 로그 표시 영역 | `src/components/case-package/case-package-share-client.tsx`의 `CONSENT_TEXT`, `src/components/case-package/case-package-share-detail-client.tsx` 로그 패널, `src/components/lawyer/case-package/lawyer-case-package-lookup-client.tsx` 첨부 하단 문구 | owner 동의문은 "열람 및 다운로드 기록이 시스템에 남을 수 있음"을 포함하고, owner 상세 화면은 이력 테이블과 집계를 보여주며, lawyer 화면은 다운로드 시 기록이 남을 수 있음을 알림 | 보관 기간·보관 목적·노출 대상은 아직 미정이라 6.9-2에서 문구 수준으로라도 명시해야 함 |
| 9. AI 생성 문서/요약본 고지 영역 | `src/app/(protected)/cases/[caseId]/share/page.tsx`, `src/app/(lawyer)/lawyer/case-packages/lookup/page.tsx`, `src/components/case-package/case-package-share-client.tsx`, `src/components/lawyer/case-package/lawyer-case-package-lookup-client.tsx`, `src/lib/case-package/case-package-summary-renderer.ts` | 여러 곳에서 "AI 정리 결과는 법률 자문, 소송 대리, 사건 수임, 최종 법률 판단이 아님"과 "변호사 또는 적법한 전문가의 검토 필요"를 반복 고지함 | 같은 의미가 여러 버전으로 흩어져 있으므로 6.9-2에서 공통 canonical 카피로 수렴해야 함 |
| 10. 전자소송 제출 보조 패키지 예정 고지 영역 | `src/**` 기준 현재 없음. 관련 방향은 `docs/project-governance/AIBEOPCHIN_6_9_PRIVACY_SECURITY_NOTICE_FINALIZATION_START.md` 와 향후 7.0 기획에서만 예정 상태 | 현재 런타임 UI/API에는 전자소송 제출 보조 문구가 노출되지 않음 | 6.9-2에서 "현재는 제출 자동화가 아니라 준비 보조" 수준의 placeholder 문구 필요 여부를 결정하고, 실제 노출은 7.0 표면이 생긴 뒤 배치해야 함 |

## 3. 공통 관찰

- owner 화면은 "공유 동의"와 "법률 자문 아님"은 이미 갖고 있지만, 개인정보 제3자 제공/열람 동의가 구조적으로 분리되어 있지 않다.
- lawyer 화면은 "검토용 자료"와 "최종 판단 아님"은 반복 고지하지만, 변호사 최종 승인 책임 문구는 아직 짧고 분산돼 있다.
- 다운로드·요약본 출력은 허용/비허용 정책과 책임 문구가 각각 존재하지만, 용어가 `다운로드`, `출력`, `요약본`, `PDF`로 섞여 있다.
- revoke/denied/log retention은 실제 서버 메시지와 화면 안내가 존재하므로 6.9-2에서 문구만 정리하면 된다.
- 전자소송 제출 보조 패키지 관련 고지는 아직 실제 노출면이 없으므로, 6.9-2에서는 문구 원칙을 잠그고 7.0에서 배치하는 방식이 적절하다.

## 4. 6.9-2 우선순위

1. 공통 canonical 문구 세트 정의
2. owner 공유 동의 구조와 제3자 열람 동의 분리
3. lawyer 열람/다운로드/출력 고지 통합
4. revoke/log retention 문구 통일
5. 7.0 전자소송 제출 보조 패키지용 placeholder 책임 제한 문구 정의 여부 결정