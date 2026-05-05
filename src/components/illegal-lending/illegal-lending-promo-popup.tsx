"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ILLEGAL_LENDING_PROMO_EVENTS,
  type IllegalLendingPromoVariant,
} from "@/features/illegal-lending/promo/illegal-lending-promo-events";
import { trackIllegalLendingPromoEvent } from "@/features/illegal-lending/promo/illegal-lending-promo-analytics";
import {
  getClientIllegalLendingPromoVariant,
  getIllegalLendingPromoCopy,
} from "@/features/illegal-lending/promo/illegal-lending-promo-variants";
import {
  dismissIllegalLendingPromoPopupForCooldown,
  dismissIllegalLendingPromoPopupForSession,
  shouldShowIllegalLendingPromoPopup,
} from "@/features/illegal-lending/promo/illegal-lending-popup-policy";

export function IllegalLendingPromoPopup() {
  const [open, setOpen] = useState(false);
  const variant: IllegalLendingPromoVariant = useMemo(
    () => getClientIllegalLendingPromoVariant(),
    [],
  );
  const copy = getIllegalLendingPromoCopy(variant);

  useEffect(() => {
    if (!shouldShowIllegalLendingPromoPopup()) return;

    const timer = globalThis.setTimeout(() => {
      setOpen(true);
      trackIllegalLendingPromoEvent(ILLEGAL_LENDING_PROMO_EVENTS.POPUP_VIEW, {
        source: "site_popup",
        variant,
      });
    }, 700);

    return () => globalThis.clearTimeout(timer);
  }, [variant]);

  function close() {
    dismissIllegalLendingPromoPopupForSession();
    setOpen(false);

    trackIllegalLendingPromoEvent(ILLEGAL_LENDING_PROMO_EVENTS.POPUP_DISMISS, {
      source: "site_popup",
      variant,
    });
  }

  function closeForCooldown() {
    dismissIllegalLendingPromoPopupForCooldown();
    setOpen(false);

    trackIllegalLendingPromoEvent(
      ILLEGAL_LENDING_PROMO_EVENTS.POPUP_DISMISS_TODAY,
      {
        source: "site_popup",
        variant,
      },
    );
  }

  function trackPopupCta(label: string, href: string) {
    trackIllegalLendingPromoEvent(ILLEGAL_LENDING_PROMO_EVENTS.POPUP_CTA_CLICK, {
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
        <div className="bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.2),transparent_38%)] p-6">
          <p className="mb-3 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-200">
            {copy.badge || "AI법친 무료 공익 서비스"}
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
            긴급한 협박·폭행·감금·성적 이미지 유포 협박은 즉시 112 등 긴급기관
            신고가 우선입니다.
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-xs leading-6 text-slate-400">
            본 서비스는 법률대리·수임·최종 법률판단이 아닌 신고서 작성 보조
            서비스입니다.
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/illegal-lending/report"
              onClick={() => {
                trackPopupCta("무료 신고서 작성하기", "/illegal-lending/report");
                close();
              }}
              className="rounded-2xl bg-cyan-300 px-4 py-3 text-center text-sm font-black text-slate-950 hover:bg-cyan-200"
            >
              무료 신고서 작성하기
            </Link>

            <Link
              href="/illegal-lending"
              onClick={() => {
                trackPopupCta("자세히 보기", "/illegal-lending");
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