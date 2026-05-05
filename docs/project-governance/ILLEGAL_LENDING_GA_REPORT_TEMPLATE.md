# AI법친 불법사금융 홍보 성과 GA4 리포트 템플릿

## 목적
SNS 광고, 랜딩페이지, 팝업, 신고서 작성 전환까지 연결해 불법사금융 피해 신고서 무료 작성센터의 홍보 성과를 측정한다.

## 핵심 이벤트
| 단계 | 이벤트 |
|---|---|
| 랜딩 조회 | illegal_lending_landing_view |
| 짧은 링크 조회 | illegal_lending_short_link_view |
| CTA 클릭 | illegal_lending_cta_click |
| 팝업 노출 | illegal_lending_popup_view |
| 팝업 CTA 클릭 | illegal_lending_popup_cta_click |
| 작성 페이지 조회 | illegal_lending_report_form_view |
| 작성 시작 | illegal_lending_report_form_start |
| 제출 시도 | illegal_lending_report_submit_attempt |
| 제출 성공 | illegal_lending_report_submit_success |
| 제출 실패 | illegal_lending_report_submit_fail |
| 첨부 업로드 성공 | illegal_lending_attachment_upload_success |
| 변호사 검토 요청 성공 | illegal_lending_lawyer_review_request_success |

## 권장 Funnel
1. illegal_lending_landing_view 또는 illegal_lending_short_link_view
2. illegal_lending_cta_click 또는 illegal_lending_popup_cta_click
3. illegal_lending_report_form_view
4. illegal_lending_report_form_start
5. illegal_lending_report_submit_attempt
6. illegal_lending_report_submit_success
7. illegal_lending_attachment_upload_success
8. illegal_lending_lawyer_review_request_success

## Variant별 비교
Dimension:
- variant
- source
- path
- label

Metrics:
- Event count
- Users
- Conversion rate
- Funnel completion rate

## 1차 운영 판단 기준
| 항목 | 기준 |
|---|---|
| 랜딩 → CTA 클릭률 | 3% 이상이면 양호 |
| 팝업 → CTA 클릭률 | 1% 이상이면 유지 검토 |
| 작성 페이지 조회 → 작성 시작률 | 25% 이상이면 양호 |
| 작성 시작 → 제출 성공률 | 40% 이상이면 양호 |
| Variant A/B 승자 | 제출 성공률 기준 우선, CTA 클릭률은 보조 지표 |

## 주의
- 불법사금융 피해자는 긴급 상황일 수 있으므로 자극적 광고 문구보다 안전 안내와 신고서 정리 보조 메시지를 우선한다.
- "무료 법률상담", "AI가 해결", "무조건 구제" 표현은 사용하지 않는다.
