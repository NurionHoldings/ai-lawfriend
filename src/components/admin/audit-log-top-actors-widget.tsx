import Link from "next/link";
import { getAuditLogTopActorsService } from "@/features/audit-logs/audit-log.service";
import type { SessionUser } from "@/lib/auth/require-session-user";

type Props = {
  currentUser: SessionUser;
  dateFrom?: string;
  dateTo?: string;
};

function badgeClass(role: string) {
  switch (role) {
    case "ADMIN":
    case "SUPER_ADMIN":
      return "border-red-200 bg-red-50 text-red-700";
    case "LAWYER":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "USER":
      return "border-slate-200 bg-slate-50 text-slate-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function buildQueryString(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && String(value).length > 0) {
      searchParams.set(key, String(value));
    }
  }

  return searchParams.toString();
}

export default async function AuditLogTopActorsWidget({
  currentUser,
  dateFrom = "",
  dateTo = "",
}: Props) {
  const items = await getAuditLogTopActorsService(currentUser, {
    dateFrom,
    dateTo,
  });

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">행위자별 상위 활동 랭킹</h2>
        <p className="mt-1 text-sm text-slate-500">
          가장 많이 활동한 사용자 상위 10명입니다.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-slate-500">
          집계할 활동 데이터가 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.actorUserId}
              className="flex items-center justify-between gap-4 rounded-xl border p-4"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                  {item.rank}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/audit-logs?${buildQueryString({
                        page: 1,
                        pageSize: 20,
                        actorUserId: item.actor.id,
                        dateFrom,
                        dateTo,
                      })}`}
                      className="truncate font-medium text-slate-900 underline"
                    >
                      {item.actor.name ?? item.actor.email}
                    </Link>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${badgeClass(
                        item.actor.role
                      )}`}
                    >
                      {item.actor.role}
                    </span>
                  </div>
                  <div className="mt-1 truncate text-xs text-slate-500">
                    {item.actor.email}
                  </div>
                  <div className="mt-1 truncate text-xs text-slate-400">
                    {item.actor.id}
                  </div>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div className="text-2xl font-bold text-slate-900">
                  {item.count.toLocaleString("ko-KR")}
                </div>
                <div className="text-xs text-slate-500">건</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
