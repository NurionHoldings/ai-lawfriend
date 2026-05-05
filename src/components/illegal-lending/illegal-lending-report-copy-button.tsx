"use client";

import { useState } from "react";

export function IllegalLendingReportCopyButton({
  text,
}: {
  text: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => {
      setCopied(false);
    }, 1600);
  }

  return (
    <button
      type="button"
      onClick={() => {
        void copy();
      }}
      className="rounded-xl border border-cyan-300/50 px-3 py-2 text-xs font-semibold text-cyan-100 hover:bg-cyan-300/10"
    >
      {copied ? "복사 완료" : "복사"}
    </button>
  );
}