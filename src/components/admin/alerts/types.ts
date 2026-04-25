export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  readAt: string | null;
  targetHref: string | null;
  createdAt: string;
  alertEvent: {
    id: string;
    severity: "INFO" | "WARNING" | "CRITICAL";
    status: "OPEN" | "ACKNOWLEDGED" | "IGNORED" | "RESOLVED";
  } | null;
};

export type AlertDetailSummary = {
  id: string;
  title: string;
  message: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  status: "OPEN" | "ACKNOWLEDGED" | "IGNORED" | "RESOLVED";
  fingerprint: string;
  entityType: string | null;
  entityId: string | null;
  detectedAt: string;
  acknowledgedAt: string | null;
  ignoredAt: string | null;
  resolvedAt: string | null;
  payloadJson: unknown;
};
