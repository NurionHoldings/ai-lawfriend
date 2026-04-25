import Link from "next/link";
import type { TimelineEventKind } from "@/lib/bulk-jobs/activity-timeline";

type TimelineEvent = {
  id: string;
  at: string;
  kind: TimelineEventKind;
  title: string;
  description?: string | null;
  link?: string | null;
};

function kindBadgeClass(kind: TimelineEventKind) {
  switch (kind) {
    case "audit":
      return "border-slate-200 bg-slate-50 text-slate-700";
    case "notification":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "schedule":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "ops_ticket":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "retry_job":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

export function BulkJobActivityTimeline({
  events,
}: {
  events: TimelineEvent[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">실행 이력 타임라인</h3>
        <p className="mt-1 text-sm text-slate-500">
          추천 액션 실행, 예약 재시도, 운영 큐, 재시도 Job 생성 흐름입니다.
        </p>
      </div>

      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
            아직 연결된 실행 이력이 없습니다.
          </div>
        ) : null}

        {events.map((event) => (
          <div key={event.id} className="flex gap-4">
            <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-slate-300" />
            <div className="min-w-0 flex-1 rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-lg border px-2 py-1 text-xs font-medium ${kindBadgeClass(event.kind)}`}
                >
                  {event.kind}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(event.at).toLocaleString("ko-KR")}
                </span>
              </div>

              <div className="mt-2 text-sm font-semibold text-slate-900">{event.title}</div>

              {event.description ? (
                <div className="mt-1 text-sm text-slate-600">{event.description}</div>
              ) : null}

              {event.link ? (
                <div className="mt-2">
                  <Link href={event.link} className="text-sm text-slate-700 underline">
                    자세히 보기
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
