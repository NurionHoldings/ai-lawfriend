import Link from "next/link";

type DashboardPreviewCardTone = "cyan" | "indigo" | "amber" | "slate";

export type DashboardPreviewCardBadgeTone = "cyan" | "amber" | "slate";

export type DashboardPreviewCardProps = {
  title: string;
  href: string;
  ctaLabel?: string;
  status?: string;
  statusLabel?: string;
  updatedAtLabel?: string;
  reason?: string;
  tone?: DashboardPreviewCardTone;
  badgeLabel?: string;
  badgeTone?: DashboardPreviewCardBadgeTone;
};

const badgeToneClass: Record<
  DashboardPreviewCardBadgeTone,
  string
> = {
  cyan: "border-cyan-200/20 bg-cyan-300/10 text-cyan-100",
  amber: "border-amber-200/20 bg-amber-300/10 text-amber-100",
  slate: "border-white/10 bg-white/10 text-slate-200",
};

const toneClass: Record<
  DashboardPreviewCardTone,
  {
    badge: string;
    link: string;
    hover: string;
  }
> = {
  cyan: {
    badge: "bg-cyan-300/10 text-cyan-100",
    link: "text-cyan-100 hover:bg-cyan-300/10",
    hover: "hover:border-cyan-200/30",
  },
  indigo: {
    badge: "bg-indigo-300/10 text-indigo-100",
    link: "text-indigo-100 hover:bg-indigo-300/10",
    hover: "hover:border-indigo-200/30",
  },
  amber: {
    badge: "bg-amber-300/10 text-amber-100",
    link: "text-amber-100 hover:bg-amber-300/10",
    hover: "hover:border-amber-200/30",
  },
  slate: {
    badge: "bg-white/10 text-slate-100",
    link: "text-slate-100 hover:bg-white/10",
    hover: "hover:border-white/20",
  },
};

export function DashboardPreviewCard({
  title,
  href,
  ctaLabel = "자세히 보기",
  status,
  statusLabel,
  updatedAtLabel,
  reason,
  tone = "cyan",
  badgeLabel,
  badgeTone = "slate",
}: DashboardPreviewCardProps) {
  const toneStyle = toneClass[tone];
  const displayStatus = statusLabel ?? status;

  return (
    <li>
      <Link
        href={href}
        className={[
          "block rounded-2xl border border-white/10 bg-slate-950/50 p-4 transition",
          "hover:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-cyan-200/40",
          toneStyle.hover,
        ].join(" ")}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h4 className="truncate font-bold text-white">{title}</h4>

            {badgeLabel ? (
              <span
                className={[
                  "mt-2 inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold",
                  badgeToneClass[badgeTone],
                ].join(" ")}
              >
                {badgeLabel}
              </span>
            ) : null}

            {(displayStatus || updatedAtLabel) && (
              <p className="mt-1 text-xs leading-5 text-slate-400">
                {displayStatus ? `상태: ${displayStatus}` : ""}
                {displayStatus && updatedAtLabel ? " · " : ""}
                {updatedAtLabel ? `업데이트: ${updatedAtLabel}` : ""}
              </p>
            )}

            {reason && (
              <p className="mt-2 text-sm leading-6 text-slate-400">{reason}</p>
            )}
          </div>

          <span
            className={[
              "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
              toneStyle.badge,
            ].join(" ")}
          >
            {ctaLabel}
          </span>
        </div>
      </Link>
    </li>
  );
}
