"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  JEONSE_DAMAGE_PROMO_EVENTS,
  type JeonseDamagePromoVariant,
} from "@/features/jeonse-damage/promo/jeonse-damage-promo-events";
import { trackJeonseDamagePromoEvent } from "@/features/jeonse-damage/promo/jeonse-damage-promo-analytics";

export function JeonseDamageTrackedLink({
  href,
  children,
  className,
  source,
  variant,
  label,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  source: string;
  variant?: JeonseDamagePromoVariant;
  label?: string;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        trackJeonseDamagePromoEvent(JEONSE_DAMAGE_PROMO_EVENTS.CTA_CLICK, {
          source,
          variant,
          label,
          href,
        });
      }}
    >
      {children}
    </Link>
  );
}
