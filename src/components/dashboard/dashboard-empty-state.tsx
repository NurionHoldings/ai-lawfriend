import { DashboardStatePanel } from "./dashboard-state-panel";

type Props = {
  title?: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
};

export function DashboardEmptyState({
  title = "아직 표시할 항목이 없습니다.",
  description = "새로운 작업이 생기면 이곳에 정리되어 표시됩니다.",
  actionHref,
  actionLabel,
}: Props) {
  return (
    <DashboardStatePanel
      variant="empty"
      title={title}
      description={description}
      action={
        actionHref && actionLabel
          ? {
              href: actionHref,
              label: actionLabel,
            }
          : undefined
      }
    />
  );
}
