"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AibeopchinCharacterModel } from "@/components/brand/aibeopchin-character-model";

const menuItems = [
  {
    label: "회원가입",
    href: "/signup",
    description: "의뢰인 계정으로 사건 정리를 시작합니다.",
  },
  {
    label: "변호사 로그인",
    href: "/login?redirect=/lawyer",
    description: "사건 검토와 문서 확인 공간으로 이동합니다.",
  },
  {
    label: "관리자 로그인",
    href: "/login?redirect=/admin",
    description: "운영 관리와 승인 화면으로 이동합니다.",
  },
  {
    label: "홈화면 바로가기",
    href: "/home",
    description: "AI법친 전체 소개 화면을 확인합니다.",
  },
] as const;

const speechMessage =
  "안녕하세요. AI법친입니다. 아래 메뉴를 선택하면 회원가입, 변호사 로그인, 관리자 로그인, 전체 홈화면으로 바로 안내해 드릴게요.";

type Star = {
  x: number;
  y: number;
  z: number;
  size: number;
  speed: number;
  tint: string;
};

function createStar(): Star {
  return {
    x: Math.random() * 2 - 1,
    y: Math.random() * 2 - 1,
    z: Math.random() * 0.96 + 0.04,
    size: Math.random() * 1.6 + 0.4,
    speed: Math.random() * 0.22 + 0.08,
    tint: Math.random() > 0.78 ? "rgba(125,211,252," : "rgba(255,255,255,",
  };
}

export function SpaceBackgroundCanvas({
  className = "",
  id = "space-background",
}: Readonly<{ className?: string; id?: string }>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = reducedMotionQuery.matches;
    let frameId = 0;
    let running = document.visibilityState === "visible";
    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let lastTime = performance.now();
    const startedAt = performance.now();

    const resetStar = (star: Star) => {
      const next = createStar();
      star.x = next.x;
      star.y = next.y;
      star.z = 1;
      star.size = next.size;
      star.speed = next.speed;
      star.tint = next.tint;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const isMobile = width < 768;
      const targetCount = reducedMotion ? 420 : isMobile ? 900 : 2800;
      stars = Array.from({ length: targetCount }, createStar);
    };

    const drawNebula = (elapsed: number) => {
      const nebulaAlpha = Math.min(elapsed / 5200, 1);
      const blueNebula = context.createRadialGradient(width * 0.66, height * 0.28, 0, width * 0.66, height * 0.28, width * 0.48);
      blueNebula.addColorStop(0, `rgba(56,189,248,${0.26 * nebulaAlpha})`);
      blueNebula.addColorStop(0.34, `rgba(37,99,235,${0.18 * nebulaAlpha})`);
      blueNebula.addColorStop(1, "rgba(0,0,0,0)");
      context.fillStyle = blueNebula;
      context.fillRect(0, 0, width, height);

      const violetNebula = context.createRadialGradient(width * 0.42, height * 0.58, 0, width * 0.42, height * 0.58, width * 0.55);
      violetNebula.addColorStop(0, `rgba(99,102,241,${0.15 * nebulaAlpha})`);
      violetNebula.addColorStop(0.48, `rgba(14,165,233,${0.1 * nebulaAlpha})`);
      violetNebula.addColorStop(1, "rgba(0,0,0,0)");
      context.fillStyle = violetNebula;
      context.fillRect(0, 0, width, height);
    };

    const drawPlanet = (elapsed: number) => {
      const alpha = Math.min(Math.max((elapsed - 1400) / 5200, 0), 1);
      const radius = Math.min(width, height) * 0.16;
      const x = width * 0.82;
      const y = height * 0.24;
      const planet = context.createRadialGradient(x - radius * 0.36, y - radius * 0.34, radius * 0.08, x, y, radius);
      planet.addColorStop(0, `rgba(191,219,254,${0.86 * alpha})`);
      planet.addColorStop(0.46, `rgba(59,130,246,${0.5 * alpha})`);
      planet.addColorStop(1, `rgba(15,23,42,${0.08 * alpha})`);
      context.beginPath();
      context.fillStyle = planet;
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = `rgba(125,211,252,${0.26 * alpha})`;
      context.lineWidth = 1.2;
      context.beginPath();
      context.ellipse(x, y + radius * 0.06, radius * 1.62, radius * 0.34, -0.22, 0, Math.PI * 2);
      context.stroke();
    };

    const render = (time: number) => {
      if (!running) return;

      const elapsed = time - startedAt;
      const delta = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const space = context.createLinearGradient(0, 0, 0, height);
      space.addColorStop(0, "#01020d");
      space.addColorStop(0.46, "#06142b");
      space.addColorStop(1, "#000000");
      context.fillStyle = space;
      context.fillRect(0, 0, width, height);

      drawNebula(elapsed);
      drawPlanet(elapsed);

      const centerX = width * 0.48;
      const centerY = height * 0.48;
      const fastIntro = Math.max(0, 1 - elapsed / 6800);
      const speedScale = reducedMotion ? 0.18 : 0.42 + fastIntro * 4.4;

      for (const star of stars) {
        const previousZ = star.z;
        star.z -= star.speed * speedScale * delta;
        if (star.z <= 0.025) resetStar(star);

        const depth = 1 / star.z;
        const previousDepth = 1 / previousZ;
        const x = centerX + star.x * width * 0.5 * depth;
        const y = centerY + star.y * height * 0.5 * depth;
        const previousX = centerX + star.x * width * 0.5 * previousDepth;
        const previousY = centerY + star.y * height * 0.5 * previousDepth;

        if (x < -80 || x > width + 80 || y < -80 || y > height + 80) {
          resetStar(star);
          continue;
        }

        const alpha = Math.min(1, 0.18 + depth * 0.12);
        const radius = Math.min(3.4, star.size * depth * 0.24);
        context.strokeStyle = `${star.tint}${alpha})`;
        context.fillStyle = `${star.tint}${alpha})`;
        context.lineWidth = Math.max(0.6, radius * 0.48);

        if (!reducedMotion && fastIntro > 0.08 && depth > 1.4) {
          context.beginPath();
          context.moveTo(previousX, previousY);
          context.lineTo(x, y);
          context.stroke();
        } else {
          context.beginPath();
          context.arc(x, y, radius, 0, Math.PI * 2);
          context.fill();
        }
      }

      if (!reducedMotion) {
        const meteorAlpha = Math.max(0, Math.sin(elapsed / 780) * 0.5 + 0.5);
        context.strokeStyle = `rgba(147,197,253,${meteorAlpha * 0.34})`;
        context.lineWidth = 1.4;
        context.beginPath();
        context.moveTo(width * 0.18 + (elapsed * 0.06) % (width * 0.6), height * 0.18);
        context.lineTo(width * 0.08 + (elapsed * 0.06) % (width * 0.6), height * 0.31);
        context.stroke();
      }

      frameId = window.requestAnimationFrame(render);
    };

    const handleVisibility = () => {
      running = document.visibilityState === "visible";
      lastTime = performance.now();
      if (running) frameId = window.requestAnimationFrame(render);
    };

    const handleMotionChange = () => {
      reducedMotion = reducedMotionQuery.matches;
      resize();
    };

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", handleVisibility);
    reducedMotionQuery.addEventListener("change", handleMotionChange);
    frameId = window.requestAnimationFrame(render);

    return () => {
      running = false;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
      reducedMotionQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  return <canvas id={id} ref={canvasRef} className={`absolute inset-0 h-full w-full ${className}`} aria-hidden />;
}

function TypewriterBubbleText({ text }: Readonly<{ text: string }>) {
  const letters = useMemo(() => Array.from(text), [text]);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    setVisibleCount(0);
    let timer = 0;
    const startTimer = window.setTimeout(() => {
      timer = window.setInterval(() => {
        setVisibleCount((count) => {
          if (count >= letters.length) {
            window.clearInterval(timer);
            return count;
          }
          return count + 1;
        });
      }, 92);
    }, 900);

    return () => {
      window.clearTimeout(startTimer);
      window.clearInterval(timer);
    };
  }, [letters.length, text]);

  return (
    <span className="whitespace-pre-wrap break-keep" aria-label={text}>
      <span aria-hidden>{letters.slice(0, visibleCount).join("")}</span>
      <span
        className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse rounded-full bg-aibeop-green align-middle sm:h-5"
        aria-hidden
      />
    </span>
  );
}

export function AibeopchinSpaceMenuHome() {
  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#01020d] pb-8 text-white"
      aria-label="AI법친 3D 안내 메뉴"
    >
      <SpaceBackgroundCanvas />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_50%_64%,rgba(14,165,233,0.18),transparent_22%),linear-gradient(180deg,transparent_0%,rgba(1,2,13,0.18)_62%,rgba(1,8,22,0.88)_100%)]" />
      <style jsx global>{`
        @keyframes bubble-pop {
          0% {
            opacity: 0;
            transform: translateY(14px) scale(0.72);
          }
          72% {
            opacity: 1;
            transform: translateY(-3px) scale(1.04);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      <section
        id="character-stage"
        className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl items-center px-4 py-6 sm:px-8 sm:py-8 lg:px-10"
      >
        <div className="relative h-[calc(100svh-3rem)] min-h-[680px] w-full sm:h-[calc(100vh-4rem)] sm:min-h-[680px]">
          <div className="absolute -left-[14%] top-[2%] flex w-[88%] flex-col items-start sm:left-[4%] sm:top-0 sm:w-[68%] lg:left-[3%] lg:w-[62%]">
            <div
              id="character-glow"
              className="pointer-events-none absolute bottom-[18%] left-1/2 h-28 w-[72%] -translate-x-1/2 rounded-[50%] border border-cyan-200/30 bg-cyan-300/10 blur-sm shadow-[0_0_56px_rgba(34,211,238,0.38),inset_0_0_44px_rgba(125,211,252,0.22)] lg:left-[43%]"
            />
            <div className="pointer-events-none absolute bottom-[20%] left-1/2 h-16 w-[58%] -translate-x-1/2 rounded-[50%] border border-white/20 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.42),rgba(34,211,238,0.18)_45%,transparent_70%)] shadow-[0_0_70px_rgba(125,211,252,0.34)] lg:left-[43%]" />
            <div className="pointer-events-none absolute bottom-[30%] left-[14%] h-2 w-2 rounded-full bg-cyan-100 shadow-[32px_-38px_0_0_rgba(255,255,255,0.85),92px_18px_0_1px_rgba(125,211,252,0.72),180px_-68px_0_0_rgba(191,219,254,0.74),244px_36px_0_1px_rgba(255,255,255,0.68)]" />

            <div id="character-3d" className="relative z-20 w-full">
              <AibeopchinCharacterModel
                variant="handbow"
                label="AI법친 메뉴를 안내하는 3D 캐릭터"
                frameless
                showStatus={false}
                motionMode="greetingThenIdle"
                idleVariant="standard"
                idleDurationMs={15 * 60 * 1000}
                className="h-[54svh] min-h-[350px] w-full max-w-[560px] sm:h-[75vh] sm:min-h-[412px] sm:max-w-[700px] lg:h-[82vh]"
              />
            </div>

          </div>

          <div className="absolute right-0 top-[8%] z-40 flex w-[185px] flex-col items-end gap-3 sm:right-[3%] sm:top-[14%] sm:w-[460px] md:right-[5%] lg:right-[4%] lg:top-[16%]">
            <section
              id="intro-message"
              className="relative flex min-h-[160px] w-full max-w-[185px] animate-[bubble-pop_720ms_ease-out_520ms_both] items-center justify-center rounded-[50%] border border-white/40 bg-white/[0.94] px-5 py-6 text-center text-slate-950 shadow-[0_20px_56px_rgba(14,165,233,0.24),inset_0_0_30px_rgba(255,255,255,0.82)] backdrop-blur sm:min-h-[250px] sm:max-w-[285px] sm:px-8 sm:py-9"
              aria-label="AI법친 안내 문구"
            >
              <div className="absolute -left-6 top-1/2 hidden h-12 w-12 -translate-y-1/2 rounded-full border border-white/35 bg-white/[0.94] shadow-[0_12px_34px_rgba(14,165,233,0.2)] lg:block" />
              <div className="absolute -left-10 top-[62%] hidden h-5 w-5 rounded-full border border-white/30 bg-white/[0.9] lg:block" />
              <div className="relative z-10">
                <h1 className="text-base font-black tracking-[-0.05em] text-slate-950 sm:text-xl">
                  AI법친
                  <br />
                  어디로 안내할까요?
                </h1>
                <p className="mx-auto mt-2 max-w-[140px] text-[10px] font-bold leading-4 text-slate-600 sm:mt-3 sm:max-w-[205px] sm:text-xs sm:leading-6">
                  <TypewriterBubbleText text={speechMessage} />
                </p>
              </div>
            </section>
          </div>

          <nav
            className="absolute bottom-0 left-1/2 z-30 grid w-full max-w-[460px] -translate-x-1/2 grid-cols-2 gap-2 sm:gap-3"
            aria-label="AI법친 시작 메뉴"
          >
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-2xl border border-cyan-100/20 bg-slate-950/[0.42] px-2 py-2 text-center font-extrabold text-white shadow-[0_16px_44px_rgba(0,0,0,0.35),inset_0_0_24px_rgba(14,165,233,0.12)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-cyan-100/50 hover:bg-cyan-300/[0.16] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 sm:px-4 sm:py-3"
                title={item.description}
              >
                <span className="block text-sm sm:text-lg">{item.label}</span>
                <span className="mt-1 hidden text-xs font-semibold leading-relaxed text-cyan-50/60 group-hover:text-cyan-50 sm:block">
                  {item.description}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </section>
    </main>
  );
}
