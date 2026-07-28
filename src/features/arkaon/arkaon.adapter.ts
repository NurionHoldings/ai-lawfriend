import { getOperationsMonitoringSnapshot } from "@/features/operations-monitoring/operations-monitoring-snapshot.service";

export const ARKAON_AILAWFRIEND_ADAPTER_MARKER = "arkaon-ailawfriend-adapter-rc1" as const;

export async function observeAilawfriendOperations(windowHours = 24) {
  const operations = await getOperationsMonitoringSnapshot(windowHours);
  return {
    marker: ARKAON_AILAWFRIEND_ADAPTER_MARKER,
    observedAt: new Date().toISOString(),
    operations,
  };
}
