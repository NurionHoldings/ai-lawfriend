import type { KpiGranularity, KpiPresetKey } from "@/lib/alerts/kpi-date-range";
import { getAlertKpi } from "@/lib/alerts/get-alert-kpi";

/** @deprecated Prefer `getAlertKpi` — 동일 집계 */
export async function getKpiAggregated(input: {
  preset: KpiPresetKey;
  granularity?: KpiGranularity;
}) {
  return getAlertKpi(input);
}
