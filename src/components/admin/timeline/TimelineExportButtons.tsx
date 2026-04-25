"use client";

type Props = {
  caseId?: string;
};

export function TimelineExportButtons({ caseId }: Props) {
  function openExport(format: "csv" | "json") {
    const qs = new URLSearchParams();
    if (caseId) qs.set("caseId", caseId);
    qs.set("format", format);
    window.open(`/api/admin/timeline/export?${qs.toString()}`, "_blank");
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => openExport("csv")}
        className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
      >
        타임라인 CSV 내보내기
      </button>
      <button
        type="button"
        onClick={() => openExport("json")}
        className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
      >
        타임라인 JSON 내보내기
      </button>
    </div>
  );
}
