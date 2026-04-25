"use client";

import type { ReactNode } from "react";
import type { AppRole } from "@/lib/auth/roles";
import { hasMinRole } from "@/lib/auth/roles";

type LegacyProps = {
  /** Prisma `UserRole` 등 문자열 역할 (운영 최소 역할 비교에 사용) */
  currentRole: string | null | undefined;
  minRole: AppRole;
  children: ReactNode;
  fallback?: ReactNode;
};

type NewProps = {
  role: string | null | undefined;
  minimumRole: AppRole;
  children: ReactNode;
  fallback?: ReactNode;
};

type RoleGateProps = LegacyProps | NewProps;

export function RoleGate(props: RoleGateProps) {
  const currentRole = "currentRole" in props ? props.currentRole : props.role;
  const minimumRole = "minRole" in props ? props.minRole : props.minimumRole;
  const fallback = props.fallback ?? null;

  if (!hasMinRole(currentRole, minimumRole)) {
    return <>{fallback}</>;
  }

  return <>{props.children}</>;
}

export default RoleGate;
