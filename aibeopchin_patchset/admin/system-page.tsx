import { requireRolePage } from "@/lib/auth/guards";
import { getHealthStatus } from "@/lib/health";
import { getReleaseMetaInline } from "@/lib/release-meta";
import { parseProductionEnv } from "@/lib/env-zod";
import { ROLE_PERMISSION_DEFINITIONS } from "@/lib/definitions/permission-definition";
import { CASE_STATUS_META } from "@/lib/definitions/case-status-definition";
import { CASE_LIFECYCLE_DEFINITIONS } from "@/lib/definitions/case-lifecycle-definition";

export default async function AdminSystemPage() {
  await requireRolePage("ADMIN");

  const health = await getHealthStatus();
  const releaseMeta = getReleaseMetaInline();

  let envOk = true;
  let envError: string | null = null;
  try {
    parseProductionEnv();
  } catch (error) {
    envOk = false;
    envError = error instanceof Error ? error.message : "Invalid env";
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">시스템 점검</h1>
        <p className="mt-1 text-sm text-slate-500">
          헬스 상태와 배포 메타 정보를 확인합니다. (release-meta API는 별도 인증이 필요합니다.)
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-2 text-lg font-medium text-slate-900">Health</h2>
        <div className="grid gap-2 text-sm text-slate-700">
          <div>
            <span className="font-medium">상태:</span>{" "}
            {health.ok ? "healthy" : "unhealthy"}
          </div>
          <div>
            <span className="font-medium">시각:</span> {health.ts}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-2 text-lg font-medium text-slate-900">Release Meta</h2>
        <p className="mb-3 text-xs text-slate-500">
          서버 인라인 메타입니다. JSON은 `getReleaseMetaInline()` 결과와 동일합니다.
        </p>
        <pre className="overflow-auto rounded-xl bg-slate-50 p-4 text-sm">
          {JSON.stringify(releaseMeta, null, 2)}
        </pre>
      </section>


      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-medium text-slate-900">권한/상태/라이프사이클 정의</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-800">권한정의서 1차본</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              {ROLE_PERMISSION_DEFINITIONS.map((item) => (
                <li key={item.code} className="rounded-xl bg-slate-50 p-3">
                  <div className="font-medium">{item.code} · {item.role}</div>
                  <div className="mt-1 text-slate-600">{item.title}</div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-800">상태값 정의서 1차본</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              {Object.entries(CASE_STATUS_META).map(([key, meta]) => (
                <li key={key} className="rounded-xl bg-slate-50 p-3">
                  <div className="font-medium">{key} · {meta.label}</div>
                  <div className="mt-1 text-slate-600">{meta.description}</div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-800">사건 라이프사이클 정의서 1차본</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              {CASE_LIFECYCLE_DEFINITIONS.map((item) => (
                <li key={item.code} className="rounded-xl bg-slate-50 p-3">
                  <div className="font-medium">{item.code} · {item.title}</div>
                  <div className="mt-1 text-slate-600">{item.description}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-2 text-lg font-medium text-slate-900">Environment</h2>
        <div className="text-sm text-slate-700">
          {process.env.NODE_ENV !== "production" && (
            <span className="block pb-2 text-slate-500">
              개발 모드: production env 스키마 검증은 건너뜁니다.{" "}
            </span>
          )}
          {envOk ? "환경변수 검증 정상" : `환경변수 오류: ${envError}`}
        </div>
      </section>
    </div>
  );
}
