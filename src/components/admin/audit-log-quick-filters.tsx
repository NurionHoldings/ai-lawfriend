import Link from "next/link";

type Props = {
  currentQuery: {
    pageSize: number;
    actorUserId: string;
    action: string;
    entityType: string;
    entityId: string;
    search: string;
    dateFrom: string;
    dateTo: string;
  };
};

function buildQueryString(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && String(value).length > 0) {
      searchParams.set(key, String(value));
    }
  }

  return searchParams.toString();
}

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getTodayRange() {
  const today = new Date();
  const value = formatDateInput(today);
  return {
    dateFrom: value,
    dateTo: value,
  };
}

function getLast7DaysRange() {
  const today = new Date();
  const from = new Date();
  from.setDate(today.getDate() - 6);

  return {
    dateFrom: formatDateInput(from),
    dateTo: formatDateInput(today),
  };
}

function chipClass(active: boolean) {
  return active
    ? "border-slate-900 bg-slate-900 text-white"
    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50";
}

export default function AuditLogQuickFilters({ currentQuery }: Props) {
  const today = getTodayRange();
  const last7Days = getLast7DaysRange();

  const isTodayActive =
    currentQuery.dateFrom === today.dateFrom &&
    currentQuery.dateTo === today.dateTo &&
    !currentQuery.entityType;

  const isLast7DaysActive =
    currentQuery.dateFrom === last7Days.dateFrom &&
    currentQuery.dateTo === last7Days.dateTo &&
    !currentQuery.entityType;

  const isAttachmentOnlyActive = currentQuery.entityType === "CASE_ATTACHMENT";
  const isAssignmentOnlyActive = currentQuery.entityType === "CASE_ASSIGNMENT";

  const base = {
    page: 1,
    pageSize: currentQuery.pageSize,
    actorUserId: currentQuery.actorUserId,
    action: currentQuery.action,
    entityId: currentQuery.entityId,
    search: currentQuery.search,
  };

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">빠른 필터</h2>
        <p className="mt-1 text-sm text-slate-500">
          자주 사용하는 기간/엔티티 조건을 한 번에 적용합니다.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/admin/audit-logs?${buildQueryString({
            ...base,
            dateFrom: today.dateFrom,
            dateTo: today.dateTo,
            entityType: "",
          })}`}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${chipClass(
            isTodayActive
          )}`}
        >
          오늘
        </Link>

        <Link
          href={`/admin/audit-logs?${buildQueryString({
            ...base,
            dateFrom: last7Days.dateFrom,
            dateTo: last7Days.dateTo,
            entityType: "",
          })}`}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${chipClass(
            isLast7DaysActive
          )}`}
        >
          최근 7일
        </Link>

        <Link
          href={`/admin/audit-logs?${buildQueryString({
            ...base,
            dateFrom: currentQuery.dateFrom,
            dateTo: currentQuery.dateTo,
            entityType: "CASE_ATTACHMENT",
          })}`}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${chipClass(
            isAttachmentOnlyActive
          )}`}
        >
          첨부파일만
        </Link>

        <Link
          href={`/admin/audit-logs?${buildQueryString({
            ...base,
            dateFrom: currentQuery.dateFrom,
            dateTo: currentQuery.dateTo,
            entityType: "CASE_ASSIGNMENT",
          })}`}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${chipClass(
            isAssignmentOnlyActive
          )}`}
        >
          배정만
        </Link>

        <Link
          href="/admin/audit-logs"
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          전체 해제
        </Link>
      </div>
    </section>
  );
}
