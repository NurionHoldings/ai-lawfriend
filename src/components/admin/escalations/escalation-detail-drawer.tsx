"use client";

import { useEffect, useState } from "react";
import { requireOkResponseBody } from "@/lib/client/api-error";

type UnifiedResponse = {
  ok?: boolean;
  escalation?: {
    id: string;
    alertEventId: string;
    caseId?: string | null;
    level: string;
    status: string;
    message: string;
    createdAt: string;
    clearedAt?: string | null;
    sentAt?: string | null;
  };
  timeline?: {
    id: string;
    memoType: string;
    content: string;
    createdAt: string;
    authorUserId: string;
    alertEventId?: string | null;
    caseId: string;
    noteType?: string | null;
  }[];
  auditLogs?: {
    id: string;
    actorUserId: string;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: unknown;
    message?: string | null;
    createdAt: string;
  }[];
  notifications?: {
    id: string;
    type: string;
    title: string;
    body: string;
    targetHref?: string | null;
    readAt: string | null;
    createdAt: string;
  }[];
};

type Props = {
  escalationId: string | null;
  open: boolean;
  onClose: () => void;
};

export function EscalationDetailDrawer({ escalationId, open, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<"timeline" | "audit" | "notifications">(
    "timeline"
  );
  const [data, setData] = useState<UnifiedResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !escalationId) return;

    let ignore = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/alert-escalations/${escalationId}/unified`, {
          cache: "no-store",
        });
        const raw = await res.json().catch(() => null);
        const body = requireOkResponseBody(
          res,
          raw,
          "데이터를 불러오지 못했습니다.",
        );
        if (!ignore) {
          setData(body as UnifiedResponse);
        }
      } catch {
        if (!ignore) {
          setData({ ok: false } as UnifiedResponse);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void load();

    return () => {
      ignore = true;
    };
  }, [open, escalationId]);

  if (!open || !escalationId) return null;

  const esc = data?.escalation;

  return (
    <div className="fixed inset-0 z-[70] bg-black/30">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="닫기"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 right-0 z-[71] w-full max-w-2xl overflow-hidden border-l border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">에스컬레이션 상세</h2>
            {esc && (
              <p className="mt-1 text-sm text-slate-500">
                Alert {esc.alertEventId} / Case {esc.caseId ?? "-"}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            닫기
          </button>
        </div>

        <div className="border-b border-slate-200 px-6 py-3">
          <div className="flex gap-2">
            <TabButton active={activeTab === "timeline"} onClick={() => setActiveTab("timeline")}>
              타임라인
            </TabButton>
            <TabButton active={activeTab === "audit"} onClick={() => setActiveTab("audit")}>
              감사로그
            </TabButton>
            <TabButton
              active={activeTab === "notifications"}
              onClick={() => setActiveTab("notifications")}
            >
              알림
            </TabButton>
          </div>
        </div>

        <div className="h-[calc(100vh-136px)] overflow-y-auto px-6 py-5">
          {loading && <div className="text-sm text-slate-500">불러오는 중입니다...</div>}

          {!loading && data?.ok && esc && (
            <>
              <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Info label="레벨" value={esc.level} />
                  <Info label="상태" value={esc.status} />
                  <Info label="발생시각" value={formatDate(esc.createdAt)} />
                  <Info
                    label="정리"
                    value={esc.clearedAt ? formatDate(esc.clearedAt) : "-"}
                  />
                </div>
                <div className="mt-3 rounded-xl bg-white p-3 text-sm text-slate-700">
                  {esc.message}
                </div>
              </div>

              {activeTab === "timeline" && (
                <div className="space-y-3">
                  {(data.timeline ?? []).map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="mb-1 text-xs text-slate-500">
                        {item.memoType} · {formatDate(item.createdAt)}
                      </div>
                      <div className="text-sm text-slate-800">{item.content}</div>
                    </div>
                  ))}
                  {(data.timeline ?? []).length === 0 && (
                    <p className="text-sm text-slate-500">타임라인 메모가 없습니다.</p>
                  )}
                </div>
              )}

              {activeTab === "audit" && (
                <div className="space-y-3">
                  {(data.auditLogs ?? []).map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="mb-1 text-xs text-slate-500">
                        {item.action} · {formatDate(item.createdAt)}
                      </div>
                      <div className="text-sm text-slate-700">
                        {item.entityType} / {item.entityId}
                      </div>
                      {item.message && (
                        <div className="mt-2 text-sm text-slate-600">{item.message}</div>
                      )}
                      {item.metadata != null && (
                        <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                          {JSON.stringify(item.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                  {(data.auditLogs ?? []).length === 0 && (
                    <p className="text-sm text-slate-500">감사 로그가 없습니다.</p>
                  )}
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-3">
                  {(data.notifications ?? []).map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="mb-1 flex items-center justify-between">
                        <div className="text-sm font-medium text-slate-800">{item.title}</div>
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            item.readAt
                              ? "bg-slate-100 text-slate-600"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {item.readAt ? "읽음" : "미읽음"}
                        </span>
                      </div>
                      <div className="text-sm text-slate-700">{item.body}</div>
                      <div className="mt-2 text-xs text-slate-500">
                        {formatDate(item.createdAt)}
                      </div>
                      {item.targetHref && (
                        <a
                          href={item.targetHref}
                          className="mt-2 inline-block text-xs text-blue-600 hover:underline"
                        >
                          관련 화면 열기
                        </a>
                      )}
                    </div>
                  ))}
                  {(data.notifications ?? []).length === 0 && (
                    <p className="text-sm text-slate-500">내 알림함에 연결된 항목이 없습니다.</p>
                  )}
                </div>
              )}
            </>
          )}

          {!loading && data && !data.ok && (
            <p className="text-sm text-red-600">데이터를 불러오지 못했습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm ${
        active
          ? "bg-slate-900 text-white"
          : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 font-medium text-slate-800">{value}</div>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("ko-KR");
}
