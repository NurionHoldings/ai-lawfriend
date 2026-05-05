"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  JEONSE_DAMAGE_PROMO_EVENTS,
  type JeonseDamagePromoVariant,
} from "@/features/jeonse-damage/promo/jeonse-damage-promo-events";
import { trackJeonseDamagePromoEvent } from "@/features/jeonse-damage/promo/jeonse-damage-promo-analytics";
import {
  getClientJeonseDamagePromoVariant,
  getJeonseDamagePromoCopy,
} from "@/features/jeonse-damage/promo/jeonse-damage-promo-variants";
import {
  dismissJeonseDamagePromoPopupForCooldown,
  dismissJeonseDamagePromoPopupForSession,
  shouldShowJeonseDamagePromoPopup,
} from "@/features/jeonse-damage/promo/jeonse-damage-popup-policy";

export function JeonseDamagePromoPopup() {
  const [open, setOpen] = useState(false);
  const variant: JeonseDamagePromoVariant = useMemo(
    () => getClientJeonseDamagePromoVariant(),
    [],
  );
  const copy = getJeonseDamagePromoCopy(variant);

  useEffect(() => {
    if (!shouldShowJeonseDamagePromoPopup()) return;

    const timer = window.setTimeout(() => {
      setOpen(true);
      trackJeonseDamagePromoEvent(JEONSE_DAMAGE_PROMO_EVENTS.POPUP_VIEW, {
        source: "site_popup",
        variant,
      });
    }, 900);

    return () => window.clearTimeout(timer);
  }, [variant]);

  function close() {
    dismissJeonseDamagePromoPopupForSession();
    setOpen(false);

    trackJeonseDamagePromoEvent(JEONSE_DAMAGE_PROMO_EVENTS.POPUP_DISMISS, {
      source: "site_popup",
      variant,
    });
  }

  function closeForCooldown() {
    dismissJeonseDamagePromoPopupForCooldown();
    setOpen(false);

    trackJeonseDamagePromoEvent(
      JEONSE_DAMAGE_PROMO_EVENTS.POPUP_DISMISS_TODAY,
      {
        source: "site_popup",
        variant,
      },
    );
  }

  function trackPopupCta(label: string, href: string) {
    trackJeonseDamagePromoEvent(JEONSE_DAMAGE_PROMO_EVENTS.POPUP_CTA_CLICK, {
      source: "site_popup",
      variant,
      label,
      href,
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-[2rem] border border-cyan-300/30 bg-slate-950 text-slate-100 shadow-2xl">
        <div className="bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.2),transparent_38%)] p-6">
          <p className="mb-3 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-200">
            {copy.badge}
          </p>

          <h2 className="whitespace-pre-line text-2xl font-black leading-tight">
            {copy.popupHeadline}
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-300">
            {copy.popupBody}
          </p>
        </div>

        <div className="space-y-4 p-6">
          <div className="rounded-2xl border border-amber-300/30 bg-amber-950/30 p-4 text-xs leading-6 text-amber-100">
            본 서비스는 피해자 인정 여부, 승소 가능성, 보증금 회수 가능성을
            판단하지 않는 서류 정리 보조 서비스입니다.
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-xs leading-6 text-slate-400">
            최종 제출 전 공식기관 또는 변호사 검토를 권장합니다.
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/jeonse-damage/report"
              onClick={() => {
                trackPopupCta("무료 서류 정리하기", "/jeonse-damage/report");
                close();
              }}
              className="rounded-2xl bg-cyan-300 px-4 py-3 text-center text-sm font-black text-slate-950 hover:bg-cyan-200"
            >
              무료 서류 정리하기
            </Link>

            <Link
              href="/jeonse-damage"
              onClick={() => {
                trackPopupCta("자세히 보기", "/jeonse-damage");
                close();
              }}
              className="rounded-2xl border border-slate-700 px-4 py-3 text-center text-sm font-bold text-slate-100 hover:bg-slate-900"
            >
              자세히 보기
            </Link>
          </div>

          <div className="flex justify-between gap-3 text-xs text-slate-500">
            <button
              type="button"
              onClick={closeForCooldown}
              className="hover:text-slate-300"
            >
              오늘은 그만 보기
            </button>

            <button type="button" onClick={close} className="hover:text-slate-300">
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
