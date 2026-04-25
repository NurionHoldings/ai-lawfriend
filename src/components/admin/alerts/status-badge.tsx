type Props = {
  status: "OPEN" | "ACKNOWLEDGED" | "IGNORED" | "RESOLVED";
};

const map = {
  OPEN: "bg-red-50 text-red-700 border-red-200",
  ACKNOWLEDGED: "bg-blue-50 text-blue-700 border-blue-200",
  IGNORED: "bg-zinc-100 text-zinc-700 border-zinc-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function StatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${map[status]}`}
    >
      {status}
    </span>
  );
}
