type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function DashboardSectionHeading({ eyebrow, title, description }: Props) {
  return (
    <div className="mb-6 md:mb-8">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/85 sm:text-sm sm:tracking-[0.24em]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 text-balance text-xl font-black tracking-tight text-white sm:text-2xl md:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-slate-200/90">
          {description}
        </p>
      ) : null}
    </div>
  );
}
