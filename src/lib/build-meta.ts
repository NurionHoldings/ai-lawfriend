export function getBuildMeta() {
  return {
    version: process.env.NEXT_PUBLIC_APP_VERSION || "dev",
    env: process.env.NEXT_PUBLIC_APP_ENV || "development",
    builtAt: new Date().toISOString(),
  };
}
