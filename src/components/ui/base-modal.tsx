"use client";

import { useEffect } from "react";

type Props = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  widthClassName?: string;
};

export function BaseModal({
  open,
  title,
  onClose,
  children,
  widthClassName = "max-w-4xl",
}: Props) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <div className="absolute inset-0 overflow-y-auto p-4 md:p-8">
        <div
          className={`mx-auto mt-8 w-full ${widthClassName} rounded-[28px] border border-white/20 bg-white shadow-2xl`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal
        >
          <div className="flex items-center justify-between border-b px-5 py-4 md:px-6">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold">{title ?? "상세보기"}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border px-3 py-2 text-sm font-medium hover:bg-zinc-50"
            >
              닫기
            </button>
          </div>

          <div className="p-5 md:p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
