import type { UserRole } from "@prisma/client";

export type PermissionSubject =
  | "ADMIN_CONSOLE"
  | "LAWYER_CONSOLE"
  | "CASE"
  | "CASE_ATTACHMENT"
  | "CASE_TIMELINE"
  | "CASE_ASSIGNMENT";

export type PermissionAction =
  | "READ"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "REVIEW"
  | "ASSIGN"
  | "UPLOAD"
  | "COMMENT"
  | "MANAGE_STATUS";

export type RolePermissionDefinition = {
  code: string;
  role: UserRole;
  title: string;
  description: string;
  subjects: Partial<Record<PermissionSubject, PermissionAction[]>>;
};

export const ROLE_PERMISSION_DEFINITIONS: RolePermissionDefinition[] = [
  {
    code: "USR-2100",
    role: "ADMIN",
    title: "플랫폼 관리자 권한",
    description:
      "관리자 콘솔, 운영 정책, 승인/감사, 전체 사건 모니터링에 접근할 수 있습니다.",
    subjects: {
      ADMIN_CONSOLE: ["READ", "UPDATE", "REVIEW", "MANAGE_STATUS"],
      CASE: ["READ", "UPDATE", "DELETE", "REVIEW", "MANAGE_STATUS", "ASSIGN"],
      CASE_ATTACHMENT: ["READ", "UPLOAD", "DELETE"],
      CASE_TIMELINE: ["READ", "COMMENT", "DELETE"],
      CASE_ASSIGNMENT: ["READ", "CREATE", "UPDATE", "DELETE", "ASSIGN"],
    },
  },
  {
    code: "USR-2110",
    role: "SUPER_ADMIN",
    title: "최고 관리자 권한",
    description:
      "관리자 권한 전체를 포함하며 모든 운영 리소스에 대한 최종 권한을 가집니다.",
    subjects: {
      ADMIN_CONSOLE: ["READ", "UPDATE", "REVIEW", "MANAGE_STATUS", "DELETE"],
      CASE: ["READ", "CREATE", "UPDATE", "DELETE", "REVIEW", "MANAGE_STATUS", "ASSIGN"],
      CASE_ATTACHMENT: ["READ", "UPLOAD", "DELETE"],
      CASE_TIMELINE: ["READ", "COMMENT", "DELETE"],
      CASE_ASSIGNMENT: ["READ", "CREATE", "UPDATE", "DELETE", "ASSIGN"],
    },
  },
  {
    code: "USR-2200",
    role: "LAWYER",
    title: "변호사 권한",
    description:
      "배정되었거나 본인이 생성한 사건을 검토·수정하고 상담 준비 자료를 다룰 수 있습니다.",
    subjects: {
      LAWYER_CONSOLE: ["READ", "UPDATE", "REVIEW"],
      CASE: ["READ", "CREATE", "UPDATE", "REVIEW", "MANAGE_STATUS"],
      CASE_ATTACHMENT: ["READ", "UPLOAD"],
      CASE_TIMELINE: ["READ", "COMMENT"],
      CASE_ASSIGNMENT: ["READ"],
    },
  },
  {
    code: "USR-2210",
    role: "STAFF",
    title: "운영 지원 권한",
    description:
      "운영 큐와 감사로그 등 제한된 관리 화면을 조회하고 운영 티켓을 처리할 수 있습니다.",
    subjects: {
      ADMIN_CONSOLE: ["READ", "REVIEW", "MANAGE_STATUS"],
      CASE: ["READ", "REVIEW"],
      CASE_TIMELINE: ["READ", "COMMENT"],
    },
  },
  {
    code: "USR-2300",
    role: "USER",
    title: "의뢰인 권한",
    description:
      "본인 사건을 생성·수정하고 인터뷰 답변, 첨부자료, 문서 초안을 확인할 수 있습니다.",
    subjects: {
      CASE: ["READ", "CREATE", "UPDATE"],
      CASE_ATTACHMENT: ["READ", "UPLOAD"],
      CASE_TIMELINE: ["READ", "COMMENT"],
    },
  },
];

export function getRolePermissionDefinition(role: UserRole) {
  return ROLE_PERMISSION_DEFINITIONS.find((item) => item.role === role) ?? null;
}

export function hasDefinedPermission(
  role: UserRole,
  subject: PermissionSubject,
  action: PermissionAction,
) {
  const definition = getRolePermissionDefinition(role);
  if (!definition) return false;
  return definition.subjects[subject]?.includes(action) ?? false;
}

export function listRoleActions(role: UserRole, subject: PermissionSubject) {
  return getRolePermissionDefinition(role)?.subjects[subject] ?? [];
}
