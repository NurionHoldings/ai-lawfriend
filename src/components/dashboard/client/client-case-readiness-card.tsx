"use client";

import { motion } from "framer-motion";
import {
  EMPTY_CLIENT_CASE_READINESS,
  type ClientCaseReadiness,
} from "@/lib/dashboard/dashboard-metrics";

const READINESS_HINT =
  "입력된 정보를 기준으로 사건 정리 준비 상태를 보여줍니다.";

type Props = {
  readiness?: ClientCaseReadiness;
};

export function ClientCaseReadinessCard({
  readiness = EMPTY_CLIENT_CASE_READINESS,
}: Props) {
  const percent = readiness.percent;
  const items = readiness.items;

  return (
    <div className="rounded-2xl border border-cyan-200/25 bg-cyan-400/[0.09] p-5 sm:rounded-3xl sm:p-6">
      <p className="text-xs font-semibold text-cyan-100 sm:text-sm">사건 정리도</p>

      <div className="mt-3 flex flex-col gap-1 sm:mt-4 sm:flex-row sm:items-end sm:gap-3">
        <span className="text-4xl font-black tabular-nums text-white sm:text-5xl">
          {percent}%
        </span>
        <span className="max-w-[20rem] text-xs leading-snug text-cyan-100/90 sm:pb-2 sm:text-sm">
          {READINESS_HINT}
        </span>
      </div>

      {readiness.sourceCaseTitle ? (
        <p className="mt-3 text-xs text-cyan-100/70">
          기준 사건: {readiness.sourceCaseTitle}
        </p>
      ) : null}

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
        <motion.div
          className="h-full rounded-full bg-cyan-300"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </div>

      <ul className="mt-5 grid gap-2 sm:mt-6 sm:gap-3">
        {items.map((item) => (
          <li
            key={item.key}
            className="flex min-h-11 flex-col gap-1 rounded-xl bg-white/[0.06] px-3 py-2.5 text-sm sm:min-h-0 sm:flex-row sm:items-center sm:justify-between sm:rounded-2xl sm:px-4 sm:py-3"
          >
            <div className="min-w-0">
              <span className="font-medium text-slate-200">{item.label}</span>
              {item.description ? (
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  {item.description}
                </p>
              ) : null}
            </div>
            <span
              className={
                item.done ? "shrink-0 text-cyan-200" : "shrink-0 text-slate-500"
              }
            >
              {item.done ? "완료" : "대기"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
