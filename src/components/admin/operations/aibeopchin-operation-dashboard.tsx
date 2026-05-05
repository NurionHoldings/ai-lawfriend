import type { ReactNode } from "react";
import type { AibeopchinOperationDashboardData } from "@/lib/operations/aibeopchin-operation-dashboard";

type Props = {
  data: AibeopchinOperationDashboardData;
};

function StatusBadge({ value }: { value: string }) {
  const isHealthy =
    value === "PASS" ||
    value === "HEALTHY" ||
    value === "PRODUCTION_DEPLOYED_AND_LOCKED" ||
    value === "14/14 PASS" ||
    value === "true";

  return (
    <span
      className={[
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        isHealthy
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
      ].join(" ")}
    >
      {value}
    </span>
  );
}

function buildKpiCards(data: AibeopchinOperationDashboardData) {
  const securityPassed =
    !data.securityChecks.databaseUrlRawValueExposed &&
    !data.securityChecks.accessTokenRawValueExposed &&
    !data.securityChecks.optionalPinOrHashExposed &&
    !data.securityChecks.storagePathExposed &&
    !data.securityChecks.attachmentDirectUrlExposed &&
    !data.securityChecks.internalPromptOrRawResponseExposed &&
    data.securityChecks.publicSafeOutputMaintained;

  return [
    {
      label: "운영 잠금 상태",
      value:
        data.deploymentStatus === "PRODUCTION_DEPLOYED_AND_LOCKED"
          ? "LOCKED"
          : "CHECK",
      description: "6.x 최종 운영 잠금",
      tone:
        data.deploymentStatus === "PRODUCTION_DEPLOYED_AND_LOCKED"
          ? "good"
          : "warn",
    },
    {
      label: "Smoke Test",
      value: data.smokeTestResultsSummary,
      description: "배포 후 실측 결과",
      tone: data.smokeTestResultsSummary === "14/14 PASS" ? "good" : "warn",
    },
    {
      label: "기능 동결",
      value: data.featureFreeze ? "ON" : "OFF",
      description: "6.x 기능 추가 금지",
      tone: data.featureFreeze ? "good" : "warn",
    },
    {
      label: "보안 체크",
      value: securityPassed ? "SAFE" : "REVIEW",
      description: "민감정보 노출 방지",
      tone: securityPassed ? "good" : "danger",
    },
    {
      label: "배포 상태",
      value: data.latestDeployment.deploymentProvider,
      description: data.latestDeployment.branch,
      tone: "neutral",
    },
    {
      label: "7.x 분리 상태",
      value: data.next.sevenX === "roadmap_separation_only" ? "SEPARATED" : "CHECK",
      description: "6.x 혼입 방지",
      tone: data.next.sevenX === "roadmap_separation_only" ? "good" : "warn",
    },
  ] as const;
}

function KpiCard({
  label,
  value,
  description,
  tone,
}: {
  label: string;
  value: string;
  description: string;
  tone: "good" | "warn" | "danger" | "neutral";
}) {
  const toneClass = {
    good: "border-emerald-200 bg-emerald-50 text-emerald-900",
    warn: "border-amber-200 bg-amber-50 text-amber-900",
    danger: "border-rose-200 bg-rose-50 text-rose-900",
    neutral: "border-slate-200 bg-white text-slate-900",
  }[tone];

  const valueClass = {
    good: "text-emerald-700",
    warn: "text-amber-700",
    danger: "text-rose-700",
    neutral: "text-slate-800",
  }[tone];

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${toneClass}`}>
      <p className="text-xs font-bold uppercase tracking-wide opacity-70">{label}</p>
      <p className={`mt-3 break-words text-2xl font-black ${valueClass}`}>{value}</p>
      <p className="mt-2 text-sm opacity-75">{description}</p>
    </div>
  );
}

function OperationWarningDetailPanel({
  warnings,
}: {
  warnings: string[];
}) {
  const hasWarnings = warnings.length > 0;

  const rows = hasWarnings
    ? warnings.map((warning, index) => ({
        id: `WARN-${String(index + 1).padStart(2, "0")}`,
        level: "주의",
        message: warning,
        action: "운영 Runbook 기준으로 원인 확인",
      }))
    : [
        {
          id: "WARN-00",
          level: "정상",
          message: "현재 운영 경고가 없습니다.",
          action: "운영 모니터링 유지",
        },
      ];

  return (
    <SectionCard
      title="운영 경고 상세 패널"
      description="6.x 운영 잠금, Smoke Test, 기능 동결, 보안 기준에서 감지된 경고를 상세히 표시합니다."
    >
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold text-slate-900">경고 상태 요약</p>
          <p className="mt-1 text-sm text-slate-600">
            {hasWarnings
              ? "확인이 필요한 운영 경고가 있습니다."
              : "현재 운영 상태는 정상이며 추가 조치가 필요하지 않습니다."}
          </p>
        </div>

        <StatusBadge value={hasWarnings ? `${warnings.length} WARNINGS` : "NO WARNINGS"} />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-3 text-left font-bold text-slate-700">ID</th>
              <th className="px-4 py-3 text-left font-bold text-slate-700">등급</th>
              <th className="px-4 py-3 text-left font-bold text-slate-700">경고 내용</th>
              <th className="px-4 py-3 text-left font-bold text-slate-700">권장 조치</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3 font-mono text-xs text-slate-700">{row.id}</td>
                <td className="px-4 py-3">
                  <StatusBadge value={row.level === "정상" ? "NORMAL" : "WARNING"} />
                </td>
                <td className="px-4 py-3 text-slate-800">{row.message}</td>
                <td className="px-4 py-3 text-slate-600">{row.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-bold text-slate-900">운영 원칙</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          경고가 발생해도 6.x 기능을 임의로 확장하지 않습니다. 장애 대응은 운영 Runbook
          기준으로 진행하고, 7.x 개선 항목은 별도 로드맵으로 분리합니다.
        </p>
      </div>
    </SectionCard>
  );
}

function OperationRunbookChecklistPanel({
  rollbackTargetCommit,
}: {
  rollbackTargetCommit: string;
}) {
  const checklist = [
    {
      id: "IR-01",
      label: "민감정보 노출 여부 확인",
      description:
        "DATABASE_URL, accessToken, optionalPin/hash, 첨부파일 직접 URL 노출 여부를 먼저 확인합니다.",
    },
    {
      id: "IR-02",
      label: "로그인/전체 접속 장애 확인",
      description: "관리자, 의뢰인, 변호사 로그인과 주요 화면 접속 가능 여부를 확인합니다.",
    },
    {
      id: "IR-03",
      label: "사건 패키지 공유/열람 장애 확인",
      description: "고유번호 조회, 사건 패키지 상세 열람, 첨부 목록 표시를 확인합니다.",
    },
    {
      id: "IR-04",
      label: "다운로드/PDF 장애 확인",
      description: "첨부파일 다운로드 정책과 사건 패키지 PDF 출력 상태를 확인합니다.",
    },
    {
      id: "IR-05",
      label: "관리자 로그/공유 현황 확인",
      description: "관리자 공유 현황, 접근 로그, 차단 로그 표시 여부를 확인합니다.",
    },
    {
      id: "IR-06",
      label: "롤백 필요성 판단",
      description:
        "P0/P1 장애 또는 민감정보 노출 의심 시 rollbackTargetCommit 기준 롤백을 검토합니다.",
    },
  ];

  const severityRows = [
    {
      level: "P0",
      title: "전체 접속/로그인 불가 또는 민감정보 노출 의심",
      action: "즉시 장애 대응 Runbook 적용 및 롤백 검토",
    },
    {
      level: "P1",
      title: "사건 패키지 공유/열람 핵심 기능 장애",
      action: "권한, 공유 상태, 운영 로그 우선 점검",
    },
    {
      level: "P2",
      title: "PDF 출력 또는 관리자 로그 일부 장애",
      action: "fallback, 로그 API, 화면 표시 상태 점검",
    },
  ];

  return (
    <SectionCard
      title="운영 Runbook 바로가기 / 장애 대응 체크리스트"
      description="장애 발생 시 6.x 기능을 확장하지 않고 운영 Runbook 기준으로 확인해야 할 항목입니다."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:col-span-2">
          <p className="text-sm font-bold text-slate-900">Runbook 문서</p>
          <p className="mt-2 break-all font-mono text-xs text-slate-700">
            docs/project-governance/AIBEOPCHIN_6X_INCIDENT_RESPONSE_RUNBOOK.md
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            운영 장애 발생 시 이 문서를 기준으로 원인 확인, 영향 범위 확인, 롤백 검토, 증빙
            기록을 진행합니다.
          </p>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-sm font-bold text-rose-900">rollbackTargetCommit</p>
          <p className="mt-2 break-all font-mono text-xs font-semibold text-rose-800">
            {rollbackTargetCommit}
          </p>
          <p className="mt-3 text-sm leading-6 text-rose-700">
            P0/P1 장애 또는 민감정보 노출 의심 시 롤백 기준으로만 사용합니다.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-900">장애 대응 체크리스트</p>
          <div className="mt-4 space-y-3">
            {checklist.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-900 px-2 py-0.5 font-mono text-xs font-bold text-white">
                    {item.id}
                  </span>
                  <p className="text-sm font-bold text-slate-900">{item.label}</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-900">장애 등급별 우선 조치</p>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-slate-700">등급</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700">상황</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700">조치</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {severityRows.map((row) => (
                  <tr key={row.level}>
                    <td className="px-4 py-3">
                      <StatusBadge value={row.level} />
                    </td>
                    <td className="px-4 py-3 text-slate-800">{row.title}</td>
                    <td className="px-4 py-3 text-slate-600">{row.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-bold text-amber-900">운영 원칙</p>
            <p className="mt-1 text-sm leading-6 text-amber-800">
              장애 대응 중에도 6.x 신규 기능 추가는 금지합니다. 수정은 장애 원인 해소에 필요한
              최소 범위로 제한하고, 7.x 개선 항목은 별도 로드맵으로 분리합니다.
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function OperationTimelineEvidencePanel({
  deployedAt,
  commitSha,
}: {
  deployedAt: string;
  commitSha: string;
}) {
  const timelineItems = [
    {
      id: "TL-01",
      title: "6.x 운영 배포 완료",
      status: "완료",
      description: "AI법친 6.x 사건 패키지 기능군 운영 배포 기준값이 확정되었습니다.",
      evidence: "EVIDENCE-20260503-AIBEOPCHIN-6-PRODUCTION-DEPLOYMENT-CLOSURE",
      meta: deployedAt,
    },
    {
      id: "TL-02",
      title: "Smoke Test 14/14 PASS",
      status: "완료",
      description: "운영 URL 기준 Smoke Test 14개 항목이 모두 PASS 처리되었습니다.",
      evidence: "predeploy-lock-results.json",
      meta: "14/14 PASS",
    },
    {
      id: "TL-03",
      title: "6.x 운영 안정화 기록 추가",
      status: "완료",
      description: "운영 안정화 JSON, 검증 스크립트, 안정화 문서가 추가되었습니다.",
      evidence: "EVIDENCE-20260503-AIBEOPCHIN-6X-OPERATION-STABILIZATION-RECORD",
      meta: "featureFreeze=true",
    },
    {
      id: "TL-04",
      title: "7.x 로드맵 분리",
      status: "완료",
      description: "6.x와 7.x를 분리하고, 7.x는 별도 로드맵으로만 진행하도록 정리했습니다.",
      evidence: "AIBEOPCHIN_7X_ROADMAP_MASTER_PLAN.md",
      meta: "6.x 혼입 금지",
    },
    {
      id: "TL-05",
      title: "7.0 운영 모니터링 대시보드 골격 추가",
      status: "완료",
      description: "읽기 전용 운영 대시보드 API, 페이지, 컴포넌트, 검증 스크립트를 추가했습니다.",
      evidence: "EVIDENCE-20260503-AIBEOPCHIN-7-0-OPERATION-DASHBOARD-DEFINITION",
      meta: commitSha,
    },
    {
      id: "TL-06",
      title: "관리자 운영 모니터링 링크 추가",
      status: "완료",
      description: "관리자 메뉴에서 7.0 운영 모니터링 대시보드로 접근할 수 있도록 링크를 추가했습니다.",
      evidence: "EVIDENCE-20260503-AIBEOPCHIN-7-0-ADMIN-MENU-LINK",
      meta: "/admin/operations/aibeopchin-7-dashboard",
    },
    {
      id: "TL-07",
      title: "운영 KPI 카드 고도화",
      status: "완료",
      description: "운영 잠금, Smoke Test, 기능 동결, 보안 체크, 배포 상태, 7.x 분리 상태 KPI를 추가했습니다.",
      evidence: "EVIDENCE-20260503-AIBEOPCHIN-7-0-OPERATION-DASHBOARD-KPI-CARDS",
      meta: "6 KPI",
    },
    {
      id: "TL-08",
      title: "운영 경고 상세 패널 추가",
      status: "완료",
      description: "운영 경고의 ID, 등급, 내용, 권장 조치를 표시하는 상세 패널을 추가했습니다.",
      evidence: "EVIDENCE-20260503-AIBEOPCHIN-7-0-OPERATION-WARNING-DETAIL-PANEL",
      meta: "NO WARNINGS / WARNINGS",
    },
    {
      id: "TL-09",
      title: "Runbook / 장애 대응 체크리스트 패널 추가",
      status: "완료",
      description: "Runbook 문서 경로, rollbackTargetCommit, IR-01~IR-06, P0/P1/P2 조치 기준을 표시했습니다.",
      evidence: "EVIDENCE-20260503-AIBEOPCHIN-7-0-RUNBOOK-CHECKLIST-PANEL",
      meta: "IR-01~IR-06",
    },
    {
      id: "TL-10",
      title: "운영 상태 타임라인 / 최근 증빙 이력 패널 추가",
      status: "진행 중",
      description: "7.0 운영 모니터링 대시보드에서 최근 운영 이력과 증빙 흐름을 한눈에 확인하도록 패널을 추가합니다.",
      evidence: "EVIDENCE-20260503-AIBEOPCHIN-7-0-OPERATION-TIMELINE-EVIDENCE-PANEL",
      meta: "current",
    },
  ];

  return (
    <SectionCard
      title="운영 상태 타임라인 / 최근 증빙 이력"
      description="6.x 최종 잠금 이후 7.0 운영 모니터링 대시보드가 어떤 순서로 안정화되었는지 확인합니다."
    >
      <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-bold text-slate-900">최근 운영 이력 요약</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          이 패널은 운영 상태를 변경하지 않고, 이미 기록된 배포·검증·증빙 흐름을 읽기
          전용으로 정리합니다.
        </p>
      </div>

      <div className="space-y-4">
        {timelineItems.map((item, index) => (
          <div
            key={item.id}
            className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-black text-white">
                  {index + 1}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-xs font-bold text-slate-500">{item.id}</p>
                    <StatusBadge value={item.status === "완료" ? "DONE" : "CURRENT"} />
                  </div>
                  <h3 className="mt-1 text-sm font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              </div>

              <div className="md:max-w-sm md:text-right">
                <p className="break-all font-mono text-xs text-slate-500">{item.evidence}</p>
                <p className="mt-1 break-all font-mono text-xs font-semibold text-slate-800">
                  {item.meta}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-sm font-bold text-emerald-900">운영 판단</p>
        <p className="mt-1 text-sm leading-6 text-emerald-800">
          현재 7.0 작업은 6.x 기능 확장이 아니라 운영 모니터링 표시 품질 개선입니다. 이후
          단계도 6.x 잠금 상태를 유지한 채 7.x 별도 로드맵으로만 진행합니다.
        </p>
      </div>
    </SectionCard>
  );
}

function OperationFeedbackClassificationPanel() {
  const feedbackSources = [
    {
      id: "FB-01",
      label: "의뢰인 사용성 피드백",
      description:
        "사건 공유 설정, 고유번호 전달, PDF 확인, 첨부자료 열람 과정에서의 불편사항을 수집합니다.",
      example: "공유 범위 선택이 어렵다 / PDF 안내 문구가 더 필요하다",
    },
    {
      id: "FB-02",
      label: "변호사 검토 피드백",
      description:
        "고유번호 조회, 사건 패키지 상세, 첨부 목록, 문서 초안 기초 확인 과정의 개선 의견을 수집합니다.",
      example: "사건 요약 구조가 더 압축되면 좋겠다 / 보완 요청 흐름이 필요하다",
    },
    {
      id: "FB-03",
      label: "관리자 운영 피드백",
      description:
        "공유 현황, 접근 로그, 차단 로그, 운영 모니터링 화면에서 확인된 운영상 개선 의견을 수집합니다.",
      example: "위험 공유만 따로 보고 싶다 / 최근 실패 접근을 빨리 보고 싶다",
    },
    {
      id: "FB-04",
      label: "보안/개인정보 피드백",
      description:
        "민감정보 노출 방지, 다운로드 권한, 만료/취소 공유 차단, 고지문 노출 관련 개선 의견을 수집합니다.",
      example: "만료 예정 공유 알림이 필요하다 / 다운로드 권한 변경 이력이 필요하다",
    },
  ];

  const candidateGroups = [
    {
      id: "7.1-A",
      title: "변호사 검토 메모 고도화",
      priority: "상",
      description:
        "변호사가 사건 패키지 검토 중 남기는 메모, 보완 포인트, 의뢰인 재질문 흐름을 고도화하는 후보입니다.",
    },
    {
      id: "7.1-B",
      title: "보완 요청 워크플로우",
      priority: "상",
      description:
        "변호사가 의뢰인에게 추가 자료나 답변을 요청하고, 의뢰인이 다시 입력하는 흐름을 정리하는 후보입니다.",
    },
    {
      id: "7.1-C",
      title: "운영 로그/보안 감사 리포트",
      priority: "중",
      description:
        "열람, 다운로드, 차단, 만료, 취소 로그를 운영자가 쉽게 검토하는 리포트 후보입니다.",
    },
    {
      id: "7.1-D",
      title: "PDF/요약본 표현 고도화",
      priority: "중",
      description:
        "사건 패키지 PDF와 요약본의 가독성, 안내문구, 출력 품질을 개선하는 후보입니다.",
    },
    {
      id: "7.1-E",
      title: "알림/메일 연동",
      priority: "후순위",
      description:
        "공유 만료, 보완 요청, 열람 완료 등 운영 이벤트를 알림으로 연결하는 후보입니다.",
    },
  ];

  const priorityRules = [
    "보안/개인정보 노출 위험이 있으면 최우선 검토",
    "변호사 검토 효율을 직접 높이는 항목은 7.1 우선 후보",
    "의뢰인 재입력·보완 요청 흐름은 별도 워크플로우로 분리",
    "단순 UI 문구 개선은 운영 안정화 항목으로 분류",
    "6.x 잠금 기능을 변경해야 하는 요구는 즉시 반영하지 않고 7.x 후보로 보류",
  ];

  return (
    <SectionCard
      title="운영 피드백 수집 패널 / 7.1 후보 분류"
      description="6.x 운영 중 수집되는 의견을 즉시 기능 수정으로 반영하지 않고, 7.1 후보로 분류하기 위한 읽기 전용 기준입니다."
    >
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-bold text-amber-900">운영 원칙</p>
        <p className="mt-1 text-sm leading-6 text-amber-800">
          이 패널은 피드백을 저장하지 않습니다. 6.x 최종 잠금 상태를 유지하기 위해 운영
          중 접수되는 의견은 즉시 기능 수정으로 반영하지 않고, 7.x 로드맵 후보로
          분류합니다.
        </p>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-900">피드백 수집 항목</p>
          <div className="mt-4 space-y-3">
            {feedbackSources.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-900 px-2 py-0.5 font-mono text-xs font-bold text-white">
                    {item.id}
                  </span>
                  <p className="text-sm font-bold text-slate-900">{item.label}</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                <p className="mt-2 rounded-lg bg-white px-3 py-2 text-xs leading-5 text-slate-500">
                  예시: {item.example}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-900">7.1 후보 분류</p>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-slate-700">후보</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700">주제</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700">우선순위</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {candidateGroups.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{item.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge value={item.priority} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-900">우선순위 판단 기준</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
              {priorityRules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-sm font-bold text-emerald-900">최종 운영 판단</p>
        <p className="mt-1 text-sm leading-6 text-emerald-800">
          피드백은 6.x 즉시 수정 대상이 아니라 7.1 후보 분류 대상으로 관리합니다. 실제
          저장, 통계화, 담당자 배정 기능은 별도 정의서와 DB/API 설계 이후 진행합니다.
        </p>
      </div>
    </SectionCard>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function AibeopchinOperationDashboard({ data }: Props) {
  const securityRows = [
    ["DATABASE_URL 원문 미노출", !data.securityChecks.databaseUrlRawValueExposed],
    ["accessToken 원문 미노출", !data.securityChecks.accessTokenRawValueExposed],
    ["optionalPin/hash 미노출", !data.securityChecks.optionalPinOrHashExposed],
    ["storagePath 미노출", !data.securityChecks.storagePathExposed],
    ["첨부파일 직접 URL 미노출", !data.securityChecks.attachmentDirectUrlExposed],
    ["내부 prompt/raw response 미노출", !data.securityChecks.internalPromptOrRawResponseExposed],
    ["public-safe 출력 기준 유지", data.securityChecks.publicSafeOutputMaintained],
  ] as const;

  const kpiCards = buildKpiCards(data);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">AI법친 7.0</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                운영 모니터링 대시보드
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                6.x 사건 패키지 기능군의 운영 배포 잠금 상태, Smoke Test,
                보안 기준, 기능 동결 상태를 읽기 전용으로 확인합니다.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusBadge value={data.dashboardStatus} />
              <StatusBadge value={data.smokeTestResultsSummary} />
              <StatusBadge value={`featureFreeze=${String(data.featureFreeze)}`} />
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {kpiCards.map((card) => (
            <KpiCard
              key={card.label}
              label={card.label}
              value={card.value}
              description={card.description}
              tone={card.tone}
            />
          ))}
        </section>

        {data.dashboardWarnings.length > 0 ? (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="text-base font-bold text-amber-900">운영 경고</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-amber-800">
              {data.dashboardWarnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </section>
        ) : (
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <h2 className="text-base font-bold text-emerald-900">운영 상태 정상</h2>
            <p className="mt-1 text-sm text-emerald-800">
              현재 6.x 운영 잠금, Smoke Test, 보안 기준, 기능 동결 상태가 모두 정상입니다.
            </p>
          </section>
        )}

        <OperationWarningDetailPanel warnings={data.dashboardWarnings} />

        <OperationRunbookChecklistPanel
          rollbackTargetCommit={data.latestDeployment.rollbackTargetCommit}
        />

        <OperationTimelineEvidencePanel
          deployedAt={data.latestDeployment.deployedAt}
          commitSha={data.latestDeployment.commitSha}
        />

        <OperationFeedbackClassificationPanel />

        <div className="grid gap-6 lg:grid-cols-3">
          <SectionCard title="운영 잠금 상태">
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">status</dt>
                <dd><StatusBadge value={data.status} /></dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">deploymentStatus</dt>
                <dd><StatusBadge value={data.deploymentStatus} /></dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">operationMode</dt>
                <dd className="font-semibold text-slate-800">{data.operationMode}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">phase</dt>
                <dd className="font-semibold text-slate-800">{data.phase}</dd>
              </div>
            </dl>
          </SectionCard>

          <SectionCard title="배포 기준">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">branch</dt>
                <dd className="mt-1 font-mono text-xs text-slate-900">
                  {data.latestDeployment.branch}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">commitSha</dt>
                <dd className="mt-1 break-all font-mono text-xs text-slate-900">
                  {data.latestDeployment.commitSha}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">rollbackTargetCommit</dt>
                <dd className="mt-1 break-all font-mono text-xs text-slate-900">
                  {data.latestDeployment.rollbackTargetCommit}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">deployedAt</dt>
                <dd className="mt-1 font-mono text-xs text-slate-900">
                  {data.latestDeployment.deployedAt}
                </dd>
              </div>
            </dl>
          </SectionCard>

          <SectionCard title="7.x 분리 상태">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">6.x 다음 상태</dt>
                <dd className="mt-1 font-semibold text-slate-900">{data.next.sixX}</dd>
              </div>
              <div>
                <dt className="text-slate-500">7.x 다음 상태</dt>
                <dd className="mt-1 font-semibold text-slate-900">{data.next.sevenX}</dd>
              </div>
              <div>
                <dt className="text-slate-500">원칙</dt>
                <dd className="mt-1 text-slate-700">
                  6.x는 잠금, 7.x는 별도 로드맵으로만 진행합니다.
                </dd>
              </div>
            </dl>
          </SectionCard>
        </div>

        <SectionCard
          title="Smoke Test 14개 항목"
          description="운영 배포 후 실측 완료된 6.x Smoke Test 결과입니다."
        >
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-slate-700">ID</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700">검증 내용</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700">결과</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {data.smokeTests.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{item.id}</td>
                    <td className="px-4 py-3 text-slate-800">{item.name}</td>
                    <td className="px-4 py-3"><StatusBadge value={item.result} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard title="보안 노출 방지 체크">
            <div className="space-y-3">
              {securityRows.map(([label, passed]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                >
                  <span className="text-slate-700">{label}</span>
                  <StatusBadge value={passed ? "PASS" : "FAIL"} />
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="운영 허용/금지 작업">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-bold text-emerald-700">허용 작업</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {data.allowedWork.map((item) => (
                    <li key={item} className="rounded-lg bg-emerald-50 px-3 py-2">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-bold text-rose-700">금지 작업</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {data.blockedWork.map((item) => (
                    <li key={item} className="rounded-lg bg-rose-50 px-3 py-2">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
