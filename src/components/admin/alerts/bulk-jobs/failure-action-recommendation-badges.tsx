import { recommendActionsForBulkItem } from "@/lib/bulk-jobs/failure-action-recommendation";

function severityClass(severity: "low" | "medium" | "high") {
  if (severity === "high") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }
  if (severity === "medium") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

type Props = {
  failureCategory?: string | null;
  failureTaxonomyCode?: string | null;
};

export function FailureActionRecommendationBadges({
  failureCategory,
  failureTaxonomyCode,
}: Props) {
  const recommendations = recommendActionsForBulkItem(
    failureCategory,
    failureTaxonomyCode
  );

  return (
    <div className="flex flex-wrap gap-2">
      {recommendations.map((rec) => (
        <span
          key={`${failureTaxonomyCode ?? failureCategory ?? "x"}-${rec.action}`}
          className={`rounded-lg border px-2 py-1 text-xs font-medium ${severityClass(rec.severity)}`}
          title={rec.description}
        >
          {rec.label}
        </span>
      ))}
    </div>
  );
}
