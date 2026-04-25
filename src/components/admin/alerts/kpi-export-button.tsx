"use client";

export function KpiExportButton({ days }: { days: number }) {
  function onDownload() {
    window.location.href = `/api/admin/alerts/kpi/export?days=${days}`;
  }

  return (
    <button
      type="button"
      onClick={onDownload}
      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white"
    >
      CSV 다운로드
    </button>
  );
}
