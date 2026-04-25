/** 배포·빌드 메타(비밀 미포함). */
export function getReleaseMetaInline() {
  return {
    commitSha:
      process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GIT_COMMIT_SHA ?? null,
    commitRef: process.env.VERCEL_GIT_COMMIT_REF ?? null,
    buildTime: process.env.BUILD_TIME ?? null,
    deployedAt:
      process.env.VERCEL_DEPLOYMENT_CREATED_AT ?? new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV ?? "development",
    appEnv: process.env.APP_ENV ?? process.env.NODE_ENV ?? "development",
  };
}
