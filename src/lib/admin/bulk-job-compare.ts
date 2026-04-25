export type JobCompareRow = {
  targetType: string;
  targetId: string;
  action: string;
  sourceStatus: string | null;
  retryStatus: string | null;
  sourceErrorCode: string | null;
  retryErrorCode: string | null;
  sourceFailureCategory: string | null;
  retryFailureCategory: string | null;
  changed: boolean;
  improved: boolean;
  regressed: boolean;
};

type RawItem = {
  targetType: string;
  targetId: string;
  action: string;
  status: string;
  errorCode: string | null;
  failureCategory: string | null;
};

function statusScore(status: string | null) {
  switch (status) {
    case "SUCCESS":
    case "COMPLETED":
      return 4;
    case "SKIPPED":
      return 3;
    case "RUNNING":
      return 2;
    case "FAILED":
      return 1;
    case "CANCELED":
    case "CANCELLED":
      return 0;
    default:
      return -1;
  }
}

export function buildBulkJobCompareRows(
  sourceItems: RawItem[],
  retryItems: RawItem[]
): JobCompareRow[] {
  const map = new Map<string, { source?: RawItem; retry?: RawItem }>();

  for (const item of sourceItems) {
    const key = `${item.targetType}::${item.targetId}::${item.action}`;
    map.set(key, { ...(map.get(key) ?? {}), source: item });
  }

  for (const item of retryItems) {
    const key = `${item.targetType}::${item.targetId}::${item.action}`;
    map.set(key, { ...(map.get(key) ?? {}), retry: item });
  }

  return [...map.entries()]
    .map(([key, pair]) => {
      const [targetType, targetId, action] = key.split("::");
      const sourceStatus = pair.source?.status ?? null;
      const retryStatus = pair.retry?.status ?? null;
      const sourceScore = statusScore(sourceStatus);
      const retryScore = statusScore(retryStatus);

      return {
        targetType,
        targetId,
        action,
        sourceStatus,
        retryStatus,
        sourceErrorCode: pair.source?.errorCode ?? null,
        retryErrorCode: pair.retry?.errorCode ?? null,
        sourceFailureCategory: pair.source?.failureCategory ?? null,
        retryFailureCategory: pair.retry?.failureCategory ?? null,
        changed:
          sourceStatus !== retryStatus ||
          (pair.source?.errorCode ?? null) !== (pair.retry?.errorCode ?? null) ||
          (pair.source?.failureCategory ?? null) !== (pair.retry?.failureCategory ?? null),
        improved: retryScore > sourceScore,
        regressed: retryScore < sourceScore,
      };
    })
    .sort((a, b) => {
      if (a.improved !== b.improved) return a.improved ? -1 : 1;
      if (a.regressed !== b.regressed) return a.regressed ? 1 : -1;
      return a.targetId.localeCompare(b.targetId);
    });
}
