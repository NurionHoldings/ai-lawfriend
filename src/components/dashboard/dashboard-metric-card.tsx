type Props = {
  title: string;
  value: string | number;
  description?: string;
};

export function DashboardMetricCard({ title, value, description }: Props) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.05] p-4 sm:rounded-3xl sm:p-5 md:p-6">
      <p className="text-xs font-medium text-slate-300 sm:text-sm">{title}</p>
      <p className="mt-1.5 tabular-nums text-2xl font-black tracking-tight text-white sm:mt-2 sm:text-3xl">
        {value}
      </p>
      {description ? (
        <p className="mt-2 text-xs leading-relaxed text-slate-400 sm:text-sm sm:leading-6">
          {description}
        </p>
      ) : null}
    </div>
  );
}
