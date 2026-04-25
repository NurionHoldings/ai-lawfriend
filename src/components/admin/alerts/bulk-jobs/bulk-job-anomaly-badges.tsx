const labelMap: Record<string, string> = {
  LONG_RUNNING: "장기 실행",
  HEARTBEAT_STALE: "하트비트 지연",
  HIGH_FAILURE_RATE: "실패율 높음",
  NO_PROGRESS: "진행 없음",
  RETRY_STORM: "재시도 과다",
};

export function BulkJobAnomalyBadges({ anomalies }: { anomalies: string[] }) {
  if (!anomalies?.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {anomalies.map((code) => (
        <span
          key={code}
          className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-800"
        >
          {labelMap[code] ?? code}
        </span>
      ))}
    </div>
  );
}
