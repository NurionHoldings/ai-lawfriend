# AI법친 불법사금융 Meta Pixel 이벤트 매핑

## Custom Event
| AI법친 이벤트 | Meta Pixel 전송 |
|---|---|
| illegal_lending_landing_view | trackCustom |
| illegal_lending_short_link_view | trackCustom |
| illegal_lending_cta_click | trackCustom |
| illegal_lending_popup_view | trackCustom |
| illegal_lending_popup_cta_click | trackCustom |
| illegal_lending_report_form_view | trackCustom |
| illegal_lending_report_form_start | trackCustom |
| illegal_lending_report_submit_attempt | trackCustom |
| illegal_lending_report_submit_success | trackCustom |
| illegal_lending_attachment_upload_success | trackCustom |
| illegal_lending_lawyer_review_request_success | trackCustom |

## 권장 Custom Conversion
1. 신고서 제출 성공
   - Event: illegal_lending_report_submit_success
2. 증거자료 첨부 성공
   - Event: illegal_lending_attachment_upload_success
3. 변호사 검토 요청 성공
   - Event: illegal_lending_lawyer_review_request_success

## 광고 최적화 기준
초기에는 illegal_lending_report_submit_success를 핵심 전환으로 설정한다.
트래픽이 충분히 쌓이면 첨부 업로드 또는 변호사 검토 요청을 보조 전환으로 추가한다.

## 주의 문구
광고 문구에서는 법률상담, 법률대리, 승소 가능성, 이자 무효 판단을 직접 약속하지 않는다.
