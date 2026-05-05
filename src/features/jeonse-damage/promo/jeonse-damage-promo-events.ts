export const JEONSE_DAMAGE_PROMO_EVENTS = {
  LANDING_VIEW: "jeonse_damage_landing_view",
  SHORT_LINK_VIEW: "jeonse_damage_short_link_view",
  CTA_CLICK: "jeonse_damage_cta_click",
  POPUP_VIEW: "jeonse_damage_popup_view",
  POPUP_CTA_CLICK: "jeonse_damage_popup_cta_click",
  POPUP_DISMISS: "jeonse_damage_popup_dismiss",
  POPUP_DISMISS_TODAY: "jeonse_damage_popup_dismiss_today",
  VARIANT_ASSIGNED: "jeonse_damage_variant_assigned",

  REPORT_FORM_VIEW: "jeonse_damage_report_form_view",
  REPORT_FORM_START: "jeonse_damage_report_form_start",
  REPORT_SUBMIT_ATTEMPT: "jeonse_damage_report_submit_attempt",
  REPORT_SUBMIT_SUCCESS: "jeonse_damage_report_submit_success",
  REPORT_SUBMIT_FAIL: "jeonse_damage_report_submit_fail",
  ATTACHMENT_UPLOAD_ATTEMPT: "jeonse_damage_attachment_upload_attempt",
  ATTACHMENT_UPLOAD_SUCCESS: "jeonse_damage_attachment_upload_success",
  ATTACHMENT_UPLOAD_FAIL: "jeonse_damage_attachment_upload_fail",
  LAWYER_REVIEW_REQUEST_ATTEMPT: "jeonse_damage_lawyer_review_request_attempt",
  LAWYER_REVIEW_REQUEST_SUCCESS: "jeonse_damage_lawyer_review_request_success",
  LAWYER_REVIEW_REQUEST_FAIL: "jeonse_damage_lawyer_review_request_fail",
} as const;

export type JeonseDamagePromoEventName =
  (typeof JEONSE_DAMAGE_PROMO_EVENTS)[keyof typeof JEONSE_DAMAGE_PROMO_EVENTS];

export type JeonseDamagePromoVariant = "A" | "B";
