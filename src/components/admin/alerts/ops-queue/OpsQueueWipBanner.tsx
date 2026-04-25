type WarningItem = {
  count: number;
  limit: number;
  percent: number;
  isNearLimit: boolean;
  isOverLimit: boolean;
};

type Props = {
  warnings: Record<string, WarningItem>;
};

const labelMap: Record<string, string> = {
  TRIAGE: "분류대기",
  QUEUED: "대기열",
  WORKING: "작업중",
  BLOCKED: "보류",
  DONE: "완료",
};

export function OpsQueueWipBanner({ warnings }: Props) {
  const important = Object.entries(warnings).filter(
    ([key, value]) => key !== "DONE" && (value.isNearLimit || value.isOverLimit),
  );

  if (!important.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
        현재 WIP 한도 경고는 없습니다.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
      <div className="mb-2 text-sm font-semibold text-amber-900">WIP limit 경고</div>

      <div className="flex flex-wrap gap-2">
        {important.map(([key, value]) => (
          <div
            key={key}
            className={`rounded-xl px-3 py-2 text-sm ${
              value.isOverLimit ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"
            }`}
          >
            {labelMap[key]} {value.count}/{value.limit}
            {value.isOverLimit ? " (초과)" : " (임계치 근접)"}
          </div>
        ))}
      </div>
    </div>
  );
}
