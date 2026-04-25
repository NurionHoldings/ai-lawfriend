type Props = {
  severity: "INFO" | "WARNING" | "CRITICAL";
};

const map = {
  INFO: "bg-sky-100 text-sky-700 border-sky-200",
  WARNING: "bg-amber-100 text-amber-700 border-amber-200",
  CRITICAL: "bg-rose-100 text-rose-700 border-rose-200",
};

export function SeverityBadge({ severity }: Props) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${map[severity]}`}
    >
      {severity}
    </span>
  );
}
