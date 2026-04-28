import { DashboardRestrictedLogoNote } from "./dashboard-restricted-logo-note";
import { DashboardStatePanel } from "./dashboard-state-panel";

type Props = {
  title?: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function DashboardRestrictedState({
  title = "접근 권한을 확인하고 있습니다.",
  description = "현재 계정으로 이용 가능한 작업 공간을 확인한 뒤, 접근 가능한 화면으로 이동해 주세요.",
  actionHref = "/dashboard",
  actionLabel = "내 작업 공간으로 이동",
  secondaryHref = "/guide",
  secondaryLabel = "이용 안내 보기",
}: Props) {
  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr] lg:items-stretch">
      <div className="min-w-0 lg:self-start">
        <DashboardRestrictedLogoNote />
      </div>
      <DashboardStatePanel
        variant="restricted"
        title={title}
        description={description}
        action={{
          href: actionHref,
          label: actionLabel,
        }}
        secondaryAction={{
          href: secondaryHref,
          label: secondaryLabel,
        }}
      />
    </div>
  );
}
