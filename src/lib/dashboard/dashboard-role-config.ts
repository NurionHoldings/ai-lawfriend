export type DashboardRole = "client" | "lawyer" | "admin";

export type DashboardTone = "calm" | "focus" | "control";

export type DashboardRouteCard = {
  title: string;
  description: string;
  href: string;
  label?: string;
};

export const DASHBOARD_ROLE_CONFIG: Record<
  DashboardRole,
  {
    eyebrow: string;
    title: string;
    description: string;
    tone: DashboardTone;
  }
> = {
  client: {
    eyebrow: "Client Workspace",
    title: "내 사건을 차근차근 정리하는 공간",
    description:
      "AI법친이 사건의 흐름, 필요한 자료, 다음 할 일을 함께 정리합니다.",
    tone: "calm",
  },
  lawyer: {
    eyebrow: "Lawyer Review Room",
    title: "검토해야 할 사건을 한눈에 보는 공간",
    description:
      "의뢰인의 진술과 첨부자료를 구조화된 사건 단위로 확인합니다.",
    tone: "focus",
  },
  admin: {
    eyebrow: "Operations Control",
    title: "플랫폼 흐름과 위험을 조망하는 운영 관제실",
    description:
      "사건, 권한, 승인, 감사 흐름을 운영 기준에 맞춰 확인합니다.",
    tone: "control",
  },
};
