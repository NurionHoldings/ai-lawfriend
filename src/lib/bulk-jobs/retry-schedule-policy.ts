export function getDeferredRetryDelayMinutes(taxonomy: string) {
  switch (taxonomy) {
    case "RATE_LIMIT":
      return 30;
    case "TRANSIENT_NETWORK":
      return 10;
    case "TIMEOUT":
      return 15;
    case "DEPENDENCY_FAILURE":
      return 20;
    default:
      return 60;
  }
}

export function buildScheduledRetryTime(params: {
  taxonomy: string;
  now?: Date;
}) {
  const now = params.now ?? new Date();
  const minutes = getDeferredRetryDelayMinutes(params.taxonomy);
  return new Date(now.getTime() + minutes * 60 * 1000);
}
