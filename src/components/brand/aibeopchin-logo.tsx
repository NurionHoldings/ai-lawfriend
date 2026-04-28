import Link from "next/link";

type AibeopchinLogoProps = {
  href?: string;
  compact?: boolean;
};

export function AibeopchinLogo({
  href = "/",
  compact = false,
}: Readonly<AibeopchinLogoProps>) {
  return (
    <Link href={href} className="flex items-center gap-3">
      <div
        className={[
          "flex shrink-0 items-center justify-center rounded-2xl bg-aibeop-green font-extrabold text-white shadow-soft",
          compact ? "h-10 w-10 text-sm" : "h-11 w-11 text-sm",
        ].join(" ")}
      >
        AI
      </div>

      <div className="leading-tight">
        <div
          className={[
            "font-extrabold tracking-[-0.04em] text-aibeop-text",
            compact ? "text-lg" : "text-xl",
          ].join(" ")}
        >
          AI법친
        </div>
        {!compact ? (
          <div className="mt-0.5 text-xs font-medium text-aibeop-muted">
            변호사와 의뢰인을 잇는 AI 법률업무 플랫폼
          </div>
        ) : null}
      </div>
    </Link>
  );
}