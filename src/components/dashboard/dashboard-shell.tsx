import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function DashboardShell({ children }: Props) {
  return (
    <div className="relative -mx-6 min-h-[min(70vh,520px)] overflow-hidden bg-slate-950 text-white sm:min-h-[60vh]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(56,189,248,0.18),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(129,140,248,0.14),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0),rgba(15,23,42,0.92))]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-5 sm:py-6 md:px-8 md:py-8">
        {children}
      </div>
    </div>
  );
}
