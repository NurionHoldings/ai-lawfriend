export type AuditLogSearchParams = {
  q?: string;
  search?: string;
  actorUserId?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  highlight?: string;
  page?: number;
  pageSize?: number;
  dateFrom?: string;
  dateTo?: string;
};

function getString(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function getNumber(value: string | string[] | undefined, fallback: number) {
  const parsed = Number(getString(value));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function parseAuditLogSearchParams(
  searchParams:
    | Record<string, string | string[] | undefined>
    | URLSearchParams
) {
  const get = (key: string) => {
    if (searchParams instanceof URLSearchParams) {
      return searchParams.get(key) ?? undefined;
    }
    return searchParams[key];
  };

  return {
    q: getString(get("q")),
    search: getString(get("search")),
    actorUserId: getString(get("actorUserId")),
    entityType: getString(get("entityType")),
    entityId: getString(get("entityId")),
    action: getString(get("action")),
    highlight: getString(get("highlight")),
    page: getNumber(get("page"), 1),
    pageSize: getNumber(get("pageSize"), 20),
    dateFrom: getString(get("dateFrom")),
    dateTo: getString(get("dateTo")),
  } satisfies AuditLogSearchParams;
}
