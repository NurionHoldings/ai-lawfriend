"use client";

import { useEffect, useState } from "react";
import {
  chooseFreeServicePromoTarget,
  type FreeServicePromoTarget,
} from "@/components/layout/free-service-promo-policy";
import { IllegalLendingPromoPopup } from "@/components/illegal-lending/illegal-lending-promo-popup";
import { JeonseDamagePromoPopup } from "@/components/jeonse-damage/jeonse-damage-promo-popup";
import { usePathname } from "next/navigation";

const HIDDEN_PATH_PREFIXES = [
  "/admin",
  "/api",
  "/login",
  "/signup",
  "/dashboard",
  "/cases",
  "/illegal-lending/report",
  "/jeonse-damage/report",
];

export function SitePromoPopupProvider() {
  const pathname = usePathname();
  const [target, setTarget] = useState<FreeServicePromoTarget>("none");

  const hidden = HIDDEN_PATH_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  useEffect(() => {
    if (hidden) {
      setTarget("none");
      return;
    }

    setTarget(chooseFreeServicePromoTarget());
  }, [hidden, pathname]);

  if (hidden) return null;

  if (target === "illegal") {
    return <IllegalLendingPromoPopup />;
  }

  if (target === "jeonse") {
    return <JeonseDamagePromoPopup />;
  }

  return null;
}