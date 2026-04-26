"use client";

import { motion } from "framer-motion";
import { DASHBOARD_AMBIENCE_COPY } from "@/lib/dashboard/dashboard-copy";
import { CLIENT_READINESS_ITEMS } from "@/lib/dashboard/dashboard-demo-metrics";

export function ClientCaseReadinessCard() {
  const doneCount = CLIENT_READINESS_ITEMS.filter((item) => item.done).length;
  const percent = Math.round((doneCount / CLIENT_READINESS_ITEMS.length) * 100);

  return (
    <div className="rounded-2xl border border-cyan-200/25 bg-cyan-400/[0.09] p-5 sm:rounded-3xl sm:p-6">
      <p className="text-xs font-semibold text-cyan-100 sm:text-sm">사건 정리도</p>

      <div className="mt-3 flex flex-col gap-1 sm:mt-4 sm:flex-row sm:items-end sm:gap-3">
        <span className="text-4xl font-black tabular-nums text-white sm:text-5xl">
          {percent}%
        </span>
        <span className="max-w-[20rem] text-xs leading-snug text-cyan-100/90 sm:pb-2 sm:text-sm">
          {DASHBOARD_AMBIENCE_COPY.clientProgressHint}
        </span>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
        <motion.div
          className="h-full rounded-full bg-cyan-300"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </div>

      <ul className="mt-5 grid gap-2 sm:mt-6 sm:gap-3">
        {CLIENT_READINESS_ITEMS.map((item) => (
          <li
            key={item.label}
            className="flex min-h-11 items-center justify-between gap-3 rounded-xl bg-white/[0.06] px-3 py-2.5 text-sm sm:min-h-0 sm:rounded-2xl sm:px-4 sm:py-3"
          >
            <span className="text-slate-200">{item.label}</span>
            <span
              className={item.done ? "text-cyan-200" : "text-slate-500"}
            >
              {item.done ? "완료" : "대기"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
