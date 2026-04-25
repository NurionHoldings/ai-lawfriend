export function AppBuildBadge() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION || "dev";
  const envLabel = process.env.NEXT_PUBLIC_APP_ENV || "development";

  return (
    <div className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
      {envLabel} · {version}
    </div>
  );
}
