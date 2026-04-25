"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/** URL에 tab=timeline이 있으면 #case-timeline으로 스크롤 */
export function ScrollToCaseTimelineOnTab() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("tab") !== "timeline") return;

    const timer = window.setTimeout(() => {
      document.getElementById("case-timeline")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);

    return () => window.clearTimeout(timer);
  }, [searchParams]);

  return null;
}
