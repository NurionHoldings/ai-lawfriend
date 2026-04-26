import { DashboardStatePanel } from "./dashboard-state-panel";

type Props = {
  title?: string;
  description?: string;
};

export function DashboardErrorState({
  title = "정보를 불러오지 못했습니다.",
  description = "잠시 후 다시 시도하거나, 문제가 계속되면 관리자에게 문의해 주세요.",
}: Props) {
  return (
    <DashboardStatePanel
      variant="error"
      title={title}
      description={description}
      secondaryAction={{
        href: "/dashboard",
        label: "다시 확인하기",
      }}
    />
  );
}
