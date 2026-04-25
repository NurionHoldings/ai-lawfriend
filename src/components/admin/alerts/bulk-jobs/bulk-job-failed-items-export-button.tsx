"use client";

type Props = {
  jobId: string;
};

export function BulkJobFailedItemsExportButton({ jobId }: Props) {
  return (
    <a
      href={`/api/admin/alerts/bulk-jobs/${jobId}/failed-items/export`}
      className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
    >
      실패 항목 CSV
    </a>
  );
}
