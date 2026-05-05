"use client";

import {
  ILLEGAL_LENDING_PROMO_EVENTS,
  type IllegalLendingPromoVariant,
} from "@/features/illegal-lending/promo/illegal-lending-promo-events";
import { trackIllegalLendingPromoEvent } from "@/features/illegal-lending/promo/illegal-lending-promo-analytics";
import Link from "next/link";
import type { ReactNode } from "react";

export function IllegalLendingTrackedLink({
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
  variant?: IllegalLendingPromoVariant;
  label?: string;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        trackIllegalLendingPromoEvent(ILLEGAL_LENDING_PROMO_EVENTS.CTA_CLICK, {
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
