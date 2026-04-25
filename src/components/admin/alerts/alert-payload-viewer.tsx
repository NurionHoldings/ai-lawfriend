"use client";

import { useMemo, useState } from "react";

type Props = {
  value: unknown;
};

function tryStringify(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function AlertPayloadViewer({ value }: Props) {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const pretty = useMemo(() => tryStringify(value), [value]);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(pretty);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="rounded-2xl border bg-zinc-950 text-zinc-100 shadow-sm">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="text-sm font-semibold">payload JSON</div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5"
          >
            {collapsed ? "펼치기" : "접기"}
          </button>
          <button
            type="button"
            onClick={onCopy}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5"
          >
            {copied ? "복사됨" : "복사"}
          </button>
        </div>
      </div>

      {!collapsed ? (
        <pre className="max-h-[420px] overflow-auto p-4 text-xs leading-6">{pretty}</pre>
      ) : null}
    </div>
  );
}
