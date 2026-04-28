import type { AdminAttentionPreviewItem } from "@/lib/dashboard/dashboard-metrics";
import { DashboardPreviewCard } from "@/components/dashboard/dashboard-preview-card";

type Props = {
  attentionNeeded?: number;
  staleCaseCount?: number;
  items?: AdminAttentionPreviewItem[];
  showPreviewEmpty?: boolean;
};

export function AdminRiskBoard({
  attentionNeeded = 0,
  staleCaseCount = 0,
  items = [],
  showPreviewEmpty = true,
}: Props) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.05] p-5 sm:rounded-3xl sm:p-6">
      <h3 className="text-lg font-bold text-white sm:text-xl">운영 확인 후보</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        보류, 접수 대기, 검토 대기 상태의 사건을 운영 확인 후보로 정리합니다.
      </p>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">
        장기 미진행 후보는 별도 배지와 보조 지표로만 표시됩니다.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
          <p className="text-xs font-medium text-slate-400">운영 확인 필요</p>
          <p className="mt-1 text-lg font-bold tabular-nums text-white">
            {attentionNeeded.toLocaleString()}건
          </p>
          <p className="mt-1 text-[11px] leading-snug text-slate-500">
            보류·접수 보완 대기 건수(기존 지표)
          </p>
        </div>
        <div className="rounded-xl border border-amber-200/15 bg-amber-300/5 p-3">
          <p className="text-xs font-medium text-amber-100/90">장기 미진행 후보</p>
          <p className="mt-1 text-lg font-bold tabular-nums text-amber-50">
            {staleCaseCount.toLocaleString()}건
          </p>
          <p className="mt-1 text-[11px] leading-snug text-amber-100/70">
            보조 확인 지표 · attentionNeeded에 합산되지 않음
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-400">
        {staleCaseCount > 0
          ? `장기 미진행 후보 ${staleCaseCount.toLocaleString()}건은 운영 확인 보조 지표로만 표시됩니다.`
          : "장기 미진행 후보도 현재 확인되지 않았습니다."}
      </p>

      {items.length > 0 ? (
        <ul className="mt-5 grid gap-4">
          {items.map((item) => (
            <DashboardPreviewCard
              key={item.id}
              title={item.title}
              href={item.href}
              ctaLabel={item.label}
              status={item.status}
              statusLabel={item.statusLabel}
              updatedAtLabel={item.updatedAtLabel}
              reason={item.staleReason ?? item.reason}
              tone="amber"
              badgeLabel={item.staleLabel}
              badgeTone={item.staleLabel ? "amber" : undefined}
            />
          ))}
        </ul>
      ) : showPreviewEmpty ? (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm font-medium text-slate-200">
            현재 운영 확인 후보는 없습니다.
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            보류, 접수 대기, 검토 대기 상태의 사건이 확인되면 이 영역에 표시됩니다.
          </p>
        </div>
      ) : null}
    </div>
  );
}
