type Props = {
  label?: string | null;
  description?: string | null;
  retryable?: boolean | null;
};

export function BulkJobFailureGuideBadge({ label, description, retryable }: Props) {
  if (!label) return null;

  const retry = retryable === true;
  const manual = retryable === false;

  return (
    <div
      className={[
        "inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border px-2.5 py-1 text-xs",
        manual
          ? "border-amber-200 bg-amber-50 text-amber-900"
          : "border-emerald-200 bg-emerald-50 text-emerald-900",
      ].join(" ")}
      title={description ?? ""}
    >
      <span>{retry ? "재시도 가능" : manual ? "수동 확인 필요" : "가이드"}</span>
      <span className="opacity-60">·</span>
      <span>{label}</span>
    </div>
  );
}
