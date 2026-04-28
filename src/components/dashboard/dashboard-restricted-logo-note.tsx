"use client";

import { useReducedMotion } from "framer-motion";
import { AibeopchinLogoV2 } from "@/components/branding/aibeopchin-logo-v2";

/** 제한·승인 대기 안내(`DashboardRestrictedState` 등)용 restricted 로고 신호. */
export function DashboardRestrictedLogoNote() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="flex max-w-full items-center justify-center rounded-2xl border border-amber-200/20 bg-amber-300/10 p-4 sm:rounded-3xl sm:p-5">
      <AibeopchinLogoV2
        mode="restricted"
        size="sm"
        reducedMotion={Boolean(reducedMotion)}
      />
    </div>
  );
}
