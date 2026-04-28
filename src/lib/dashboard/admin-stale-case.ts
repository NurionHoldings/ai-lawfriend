export const ADMIN_STALE_CASE_DAYS = {
  attention: 7,
  priority: 14,
  longRunning: 30,
} as const;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function getStaleDays(
  updatedAt: Date | string,
  now: Date = new Date(),
): number {
  const updatedAtDate =
    updatedAt instanceof Date ? updatedAt : new Date(updatedAt);

  if (Number.isNaN(updatedAtDate.getTime())) {
    return 0;
  }

  const diff = now.getTime() - updatedAtDate.getTime();

  if (diff <= 0) {
    return 0;
  }

  return Math.floor(diff / MS_PER_DAY);
}

export function isAdminStaleCase(
  updatedAt: Date | string,
  now: Date = new Date(),
): boolean {
  return getStaleDays(updatedAt, now) >= ADMIN_STALE_CASE_DAYS.attention;
}

export function getAdminStaleCaseLabel(staleDays: number): string | undefined {
  if (staleDays >= ADMIN_STALE_CASE_DAYS.longRunning) {
    return "장기 미진행 후보";
  }

  if (staleDays >= ADMIN_STALE_CASE_DAYS.priority) {
    return "우선 확인 후보";
  }

  if (staleDays >= ADMIN_STALE_CASE_DAYS.attention) {
    return "확인 후보";
  }

  return undefined;
}

export function getAdminStaleCaseReason(staleDays: number): string | undefined {
  if (staleDays >= ADMIN_STALE_CASE_DAYS.longRunning) {
    return `${staleDays}일 동안 업데이트가 없어 장기 미진행 여부 확인이 필요합니다.`;
  }

  if (staleDays >= ADMIN_STALE_CASE_DAYS.priority) {
    return `${staleDays}일 동안 업데이트가 없어 우선 확인이 필요합니다.`;
  }

  if (staleDays >= ADMIN_STALE_CASE_DAYS.attention) {
    return `${staleDays}일 동안 업데이트가 없어 진행 상태 확인이 필요합니다.`;
  }

  return undefined;
}
