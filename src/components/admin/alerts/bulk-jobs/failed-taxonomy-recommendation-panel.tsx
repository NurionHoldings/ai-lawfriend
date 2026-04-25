import { FailureActionRecommendationBadges } from "@/components/admin/alerts/bulk-jobs/failure-action-recommendation-badges";
import { RecommendedActionButtons } from "@/components/admin/alerts/bulk-jobs/recommended-action-buttons";
import type { FailureActionBulkVariant } from "@/lib/bulk-jobs/failure-action-recommendation";

type Recommendation = {
  action: string;
  label: string;
  description: string;
  severity: "low" | "medium" | "high";
  executable: boolean;
  bulkVariant: FailureActionBulkVariant;
};

type Row = {
  taxonomy: string;
  count: number;
  recommendations: Recommendation[];
};

export function FailedTaxonomyRecommendationPanel({
  jobId,
  rows,
  totalFailed,
}: {
  jobId: string;
  rows: Row[];
  totalFailed: number;
}) {
  if (totalFailed === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">실패 taxonomy별 자동 액션 추천</h3>
        <p className="mt-1 text-sm text-slate-500">
          총 실패 항목 {totalFailed}건 기준 운영자 권장 조치 및 실행 버튼입니다.
        </p>
      </div>

      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.taxonomy} className="rounded-xl border border-slate-200 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">{row.taxonomy}</div>
                <div className="mt-1 text-xs text-slate-500">실패 {row.count}건</div>
              </div>

              <FailureActionRecommendationBadges
                failureCategory={null}
                failureTaxonomyCode={row.taxonomy}
              />
            </div>

            <ul className="mt-3 space-y-1 text-sm text-slate-600">
              {row.recommendations.map((rec) => (
                <li key={`${row.taxonomy}-${rec.bulkVariant}`}>
                  - {rec.label}: {rec.description}
                </li>
              ))}
            </ul>

            <div className="mt-4">
              <RecommendedActionButtons
                jobId={jobId}
                taxonomy={row.taxonomy}
                recommendations={row.recommendations}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
