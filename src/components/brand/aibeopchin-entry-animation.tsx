"use client";

/**
 * AibeopchinEntryAnimation
 * ─ BaebyEntryAnimation 방식을 AI법친 플랫폼에 맞게 구현.
 * ─ 세션당 1회 표시 (sessionStorage).
 * ─ 클릭하면 즉시 스킵.
 *
 * 애니메이션 흐름:
 *   1. 글자별 순차 등장 — translateX(80) + scale(0) + rotate(220°) → spring bounce
 *   2. 착지 시 ring pulse 효과
 *   3. 전체 착지 후 tagline(소문구) 페이드인
 *   4. color wave cycle (레인보우 파도)
 *   5. 원래 색으로 복구 → 오버레이 페이드아웃
 */
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const SESSION_KEY = "aibeopchin_entry_v1";

/** 글자 간 딜레이(ms) */
const GAP_MS = 255;
/** 글자 등장 애니메이션 지속 시간(ms) */
const ANIM_MS = 680;
/** 컬러 사이클 1스텝 시간(ms) */
const CYCLE_PER = 210;
/** 컬러 사이클 wave 딜레이(ms) */
const WAVE_MS = 28;

type LetterDef = {
  ch: string;
  color: string;
  bg: string;
  dot?: boolean;
};

/** "AI법친.com" 각 글자 정의 — 플랫폼 컬러 팔레트 기반 */
const LETTERS: LetterDef[] = [
  { ch: "A",  color: "#22d3ee", bg: "rgba(34,211,238,.13)"   },
  { ch: "I",  color: "#38bdf8", bg: "rgba(56,189,248,.13)"   },
  { ch: "법", color: "#c9a227", bg: "rgba(201,162,39,.13)"   },
  { ch: "친", color: "#34d399", bg: "rgba(52,211,153,.13)"   },
  { ch: "·",  color: "#64748b", bg: "transparent", dot: true  },
  { ch: "c",  color: "#60a5fa", bg: "rgba(96,165,250,.13)"   },
  { ch: "o",  color: "#6ee7b7", bg: "rgba(110,231,183,.13)"  },
  { ch: "m",  color: "#c084fc", bg: "rgba(192,132,252,.13)"  },
];

const CYCLE_COLORS = [
  "#ffffff",
  "#22d3ee",
  "#c9a227",
  "#34d399",
  "#60a5fa",
  "#c084fc",
  "#38bdf8",
];

export function AibeopchinEntryAnimation() {
  const [visible, setVisible]         = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [cycleColor, setCycleColor]   = useState<string | null>(null);
  const [fading, setFading]           = useState(false);
  const [gone, setGone]               = useState(false);

  /** 글자별 ring 트리거 — 값이 바뀌면 ring 재생 */
  const [rings, setRings] = useState<Record<number, number>>({});
  /** 진입 완료 글자 추적 (ring을 한 번만 발사하기 위해) */
  const enteredRef = useRef<Set<number>>(new Set());

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const addTimer = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  };

  /** 즉시 스킵 */
  const dismiss = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setFading(true);
    setTimeout(() => setGone(true), 480);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      return;
    }

    setVisible(true);

    /* 마지막 글자 착지 시점 */
    const lastLandMs = (LETTERS.length - 1) * GAP_MS + ANIM_MS + 90;

    /* tagline 표시 */
    addTimer(() => setShowTagline(true), lastLandMs);

    /* color cycle */
    addTimer(() => {
      let ci = 0;
      const iv = setInterval(() => {
        if (ci < CYCLE_COLORS.length) {
          const col = CYCLE_COLORS[ci++];
          if (col) setCycleColor(col);
        } else {
          clearInterval(iv);
          setCycleColor(null);
          /* 복구 후 페이드아웃 */
          addTimer(() => {
            setFading(true);
            addTimer(() => setGone(true), 480);
          }, 520);
        }
      }, CYCLE_PER);
      timersRef.current.push(iv as unknown as ReturnType<typeof setTimeout>);
    }, lastLandMs + 280);

    /* 안전망: 최대 12초 */
    addTimer(dismiss, 12000);

    return () => { timersRef.current.forEach(clearTimeout); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (gone || !visible) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: fading ? 0 : 1 }}
      transition={{ duration: 0.46, ease: "easeOut" }}
      onAnimationComplete={() => { if (fading) setGone(true); }}
      onClick={dismiss}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "#060d1f",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        cursor: "pointer",
        fontFamily: "'Apple SD Gothic Neo','Noto Sans KR',system-ui,sans-serif",
        userSelect: "none",
      }}
    >
      {/* ── 글자 행 ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {LETTERS.map((letter, i) => {
          const size   = letter.dot ? 30 : 58;
          const delay  = (i * GAP_MS) / 1000;
          const active = cycleColor ?? letter.color;

          return (
            <div
              key={i}
              style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
            >
              {/* Ring pulse — AnimatePresence가 re-mount마다 재생 */}
              <AnimatePresence>
                {rings[i] !== undefined && (
                  <motion.div
                    key={rings[i]}
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 2.55, opacity: 0 }}
                    exit={{}}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                    style={{
                      position: "absolute",
                      inset: -4,
                      borderRadius: "50%",
                      border: `2px solid ${letter.color}`,
                      pointerEvents: "none",
                    }}
                  />
                )}
              </AnimatePresence>

              {/* 글자 */}
              <motion.span
                initial={{
                  x: 80,
                  scale: 0,
                  rotate: 220,
                  opacity: 0,
                }}
                animate={{
                  x: 0,
                  scale: cycleColor ? 1.09 : 1,
                  rotate: 0,
                  opacity: 1,
                  color: active,
                  boxShadow: `0 0 ${cycleColor ? 28 : 14}px ${active}cc`,
                  filter: cycleColor
                    ? `brightness(1.9) drop-shadow(0 0 12px ${active}99)`
                    : "none",
                }}
                transition={{
                  /* 진입 애니메이션 */
                  x:       { type: "spring", stiffness: 210, damping: 13, delay },
                  rotate:  { duration: ANIM_MS / 1000, ease: [0.34, 1.56, 0.64, 1], delay },
                  opacity: { duration: (ANIM_MS * 0.38) / 1000, delay },
                  /* 진입 scale도 spring */
                  scale:   cycleColor
                    ? { duration: 0.1, ease: "easeOut" }
                    : { type: "spring", stiffness: 210, damping: 13, delay },
                  /* 색상·glow 전환 빠르게 */
                  color:     { duration: 0.05 },
                  boxShadow: { duration: 0.05 },
                  filter:    { duration: 0.05 },
                }}
                onAnimationComplete={() => {
                  /* 진입 착지 시 ring 1회 발사 */
                  if (!enteredRef.current.has(i)) {
                    enteredRef.current.add(i);
                    setRings((prev) => ({ ...prev, [i]: (prev[i] ?? 0) + 1 }));
                  }
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: size,
                  height: size,
                  fontSize: letter.dot ? "1.55rem" : "1.88rem",
                  fontWeight: 900,
                  lineHeight: 1,
                  borderRadius: "50%",
                  background: letter.bg,
                  border: `2px solid ${letter.color}44`,
                  color: letter.color,
                  position: "relative",
                }}
              >
                {letter.ch}
              </motion.span>
            </div>
          );
        })}
      </div>

      {/* ── 소문구 (절반 크기) ── */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{
          opacity: showTagline ? 1 : 0,
          y:       showTagline ? 0 : 12,
        }}
        transition={{ duration: 0.52, ease: "easeOut" }}
        style={{
          fontSize: "0.78rem",
          fontWeight: 600,
          letterSpacing: "0.22em",
          color: "rgba(34,211,238,0.80)",
          textAlign: "center",
          maxWidth: 340,
          lineHeight: 1.7,
          padding: "0 16px",
        }}
      >
        이제는 혼자서도 내 사건을 AI와 함께
        <br />
        분석하고 해결점을 찾는다
      </motion.p>

      {/* ── Skip 힌트 ── */}
      <p
        style={{
          position: "absolute",
          bottom: 22,
          right: 26,
          fontSize: "0.67rem",
          color: "rgba(255,255,255,0.18)",
          letterSpacing: "0.12em",
          margin: 0,
        }}
      >
        tap to skip
      </p>
    </motion.div>
  );
}
