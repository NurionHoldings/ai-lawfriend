export const ILLEGAL_LENDING_PROMO_EVENTS = {
  LANDING_VIEW: "illegal_lending_landing_view",
  SHORT_LINK_VIEW: "illegal_lending_short_link_view",
  CTA_CLICK: "illegal_lending_cta_click",
  POPUP_VIEW: "illegal_lending_popup_view",
  POPUP_CTA_CLICK: "illegal_lending_popup_cta_click",
  POPUP_DISMISS: "illegal_lending_popup_dismiss",
  POPUP_DISMISS_TODAY: "illegal_lending_popup_dismiss_today",
  VARIANT_ASSIGNED: "illegal_lending_variant_assigned",
  REPORT_FORM_VIEW: "illegal_lending_report_form_view",
  REPORT_FORM_START: "illegal_lending_report_form_start",
  REPORT_SUBMIT_ATTEMPT: "illegal_lending_report_submit_attempt",
  REPORT_SUBMIT_SUCCESS: "illegal_lending_report_submit_success",
  REPORT_SUBMIT_FAIL: "illegal_lending_report_submit_fail",
  ATTACHMENT_UPLOAD_ATTEMPT: "illegal_lending_attachment_upload_attempt",
  ATTACHMENT_UPLOAD_SUCCESS: "illegal_lending_attachment_upload_success",
  ATTACHMENT_UPLOAD_FAIL: "illegal_lending_attachment_upload_fail",
  LAWYER_REVIEW_REQUEST_ATTEMPT:
    "illegal_lending_lawyer_review_request_attempt",
  LAWYER_REVIEW_REQUEST_SUCCESS:
    "illegal_lending_lawyer_review_request_success",
  LAWYER_REVIEW_REQUEST_FAIL: "illegal_lending_lawyer_review_request_fail",
} as const;

export type IllegalLendingPromoEventName =
  (typeof ILLEGAL_LENDING_PROMO_EVENTS)[keyof typeof ILLEGAL_LENDING_PROMO_EVENTS];

export type IllegalLendingPromoVariant = "A" | "B";