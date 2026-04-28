"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { AibeopchinLogoMode } from "@/components/branding/aibeopchin-brand-types";
import { AibeopchinLogo } from "@/components/branding/aibeopchin-logo";
import { AibeopchinLogoV2 } from "@/components/branding/aibeopchin-logo-v2";
import { AIBEOPCHIN_LOGO_V2_ROLE_MODE } from "@/lib/branding/aibeopchin-logo-v2-role-mode";
import type { DashboardRole } from "@/lib/dashboard/dashboard-role-config";
import { DASHBOARD_ROLE_CONFIG } from "@/lib/dashboard/dashboard-role-config";

type Props = {
  role: DashboardRole;
  statusText?: string;
  /** true일 때 SVG 획 생성형 Living Logo 2.0 사용(기본 false, 롤백·A/B 용) */
  useV2Logo?: boolean;
};

function getLogoMode(role: DashboardRole): AibeopchinLogoMode {
  return AIBEOPCHIN_LOGO_V2_ROLE_MODE[role];
}

export function DashboardLivingHeader({
  role,
  statusText,
  useV2Logo = false,
}: Readonly<Props>) {
  const reducedMotion = useReducedMotion();
  const config = DASHBOARD_ROLE_CONFIG[role];

  return (
    <section className="grid gap-8 rounded-2xl border border-white/15 bg-white/[0.05] p-5 shadow-2xl shadow-slate-950/50 backdrop-blur-md sm:rounded-[2rem] sm:p-6 md:grid-cols-[1.05fr_0.95fr] md:gap-10 md:p-8">
      <div className="flex min-w-0 flex-col justify-center">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-200/90 sm:text-sm sm:tracking-[0.28em]">
          {config.eyebrow}
        </p>

        <motion.h1
          className="mt-3 max-w-3xl text-balance text-2xl font-black tracking-tight text-white sm:mt-4 sm:text-3xl md:text-4xl lg:text-5xl"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          {config.title}
        </motion.h1>

        <motion.p
          className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-slate-200/95 sm:mt-5 sm:text-base sm:leading-7 md:text-lg"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.55 }}
        >
          {config.description}
        </motion.p>

        {statusText ? (
          <div className="mt-5 max-w-full rounded-full border border-cyan-200/25 bg-cyan-400/10 px-3 py-2 text-xs font-medium leading-snug text-cyan-50 sm:mt-6 sm:inline-flex sm:w-fit sm:px-4 sm:py-2 sm:text-sm">
            {statusText}
          </div>
        ) : null}
      </div>

      <div className="flex min-h-[140px] items-center justify-center sm:min-h-[160px] md:min-h-0">
        <div className="w-full max-w-[min(100%,380px)] md:max-w-none">
          {useV2Logo ? (
            <AibeopchinLogoV2
              mode={getLogoMode(role)}
              size="lg"
              showTagline={false}
              reducedMotion={Boolean(reducedMotion)}
            />
          ) : (
            <AibeopchinLogo mode={getLogoMode(role)} size="lg" showSubtitle={false} />
          )}
        </div>
      </div>
    </section>
  );
}
