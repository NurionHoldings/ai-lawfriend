export function buildCaseTimelineHref(
  caseId: string,
  alertEventId?: string | null,
  draftText?: string | null
) {
  const qs = new URLSearchParams();
  qs.set("tab", "timeline");

  if (alertEventId) {
    qs.set("focusAlertId", alertEventId);
  }

  if (draftText) {
    qs.set("draft", draftText);
  }

  return `/cases/${caseId}?${qs.toString()}`;
}
