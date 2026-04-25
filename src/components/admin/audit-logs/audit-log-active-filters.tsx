import Link from "next/link";

type Props = {
  q?: string;
  search?: string;
  actorUserId?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  highlight?: string;
  dateFrom?: string;
  dateTo?: string;
};

function Chip({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
      {label}
    </span>
  );
}

export function AuditLogActiveFilters(props: Props) {
  const hasAny = Object.values(props).some(Boolean);

  if (!hasAny) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 text-sm font-semibold text-slate-900">적용된 필터</div>
      <div className="flex flex-wrap gap-2">
        {props.q ? <Chip label={`q: ${props.q}`} /> : null}
        {props.search && !props.q ? <Chip label={`search: ${props.search}`} /> : null}
        {props.actorUserId ? (
          <Chip label={`actorUserId: ${props.actorUserId}`} />
        ) : null}
        {props.entityType ? <Chip label={`entityType: ${props.entityType}`} /> : null}
        {props.entityId ? <Chip label={`entityId: ${props.entityId}`} /> : null}
        {props.action ? <Chip label={`action: ${props.action}`} /> : null}
        {props.highlight ? <Chip label={`highlight: ${props.highlight}`} /> : null}
        {props.dateFrom ? <Chip label={`dateFrom: ${props.dateFrom}`} /> : null}
        {props.dateTo ? <Chip label={`dateTo: ${props.dateTo}`} /> : null}
      </div>

      <div className="mt-3">
        <Link
          href="/admin/audit-logs"
          className="text-sm font-medium text-blue-700 underline"
        >
          필터 모두 해제
        </Link>
      </div>
    </div>
  );
}
