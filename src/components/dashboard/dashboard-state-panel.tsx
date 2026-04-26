import Link from "next/link";
import type { ReactNode } from "react";

type DashboardStateVariant = "empty" | "loading" | "error" | "restricted" | "info";

type Props = {
  variant?: DashboardStateVariant;
  title: string;
  description: string;
  icon?: ReactNode;
  action?: {
    href: string;
    label: string;
  };
  secondaryAction?: {
    href: string;
    label: string;
  };
};

const variantTone: Record<DashboardStateVariant, string> = {
  empty: "border-cyan-200/20 bg-cyan-300/10",
  loading: "border-indigo-200/20 bg-indigo-300/10",
  error: "border-rose-200/20 bg-rose-300/10",
  restricted: "border-amber-200/20 bg-amber-300/10",
  info: "border-white/10 bg-white/[0.04]",
};

export function DashboardStatePanel({
  variant = "info",
  title,
  description,
  icon,
  action,
  secondaryAction,
}: Props) {
  return (
    <div
      className={`rounded-2xl border p-5 sm:rounded-3xl sm:p-6 ${variantTone[variant]}`}
      role="region"
      aria-label={title}
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-8">
        <div className="max-w-2xl min-w-0">
          {icon ? <div className="mb-3 text-2xl sm:mb-4">{icon}</div> : null}
          <h3 className="text-lg font-bold text-white sm:text-xl">{title}</h3>
          <p className="mt-2 text-pretty text-sm leading-relaxed text-slate-200/95 sm:mt-3 sm:leading-6">
            {description}
          </p>
        </div>

        {action || secondaryAction ? (
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row md:flex-col">
            {action ? (
              <Link
                href={action.href}
                className="inline-flex justify-center rounded-2xl bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-100 focus-visible:outline focus-visible:ring-2 focus-visible:ring-cyan-200"
              >
                {action.label}
              </Link>
            ) : null}
            {secondaryAction ? (
              <Link
                href={secondaryAction.href}
                className="inline-flex justify-center rounded-2xl border border-white/20 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:ring-2 focus-visible:ring-white/40"
              >
                {secondaryAction.label}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
