"use client";

import Link from "next/link";
import { useState } from "react";
import { EscalationDetailDrawer } from "./escalation-detail-drawer";
import { ReleaseEscalationButton } from "./release-escalation-button";

export type EscalationListRow = {
  id: string;
  status: string;
  level: string;
  alertTitle: string;
  message: string;
  caseCell: string;
  ruleText: string;
  assigneeName: string;
  createdAt: string;
  clearedLine: string | null;
  pending: boolean;
};

export function EscalationListTable({ rows }: { rows: EscalationListRow[] }) {
  const [drawerId, setDrawerId] = useState<string | null>(null);

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3">상태</th>
              <th className="px-4 py-3">레벨</th>
              <th className="px-4 py-3">경고</th>
              <th className="px-4 py-3">사건</th>
              <th className="px-4 py-3">규칙</th>
              <th className="px-4 py-3">담당자</th>
              <th className="px-4 py-3">생성일</th>
              <th className="px-4 py-3">해제</th>
              <th className="px-4 py-3">상세</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="px-4 py-3">{row.status}</td>
                <td className="px-4 py-3">{row.level}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{row.alertTitle}</div>
                  <div className="text-xs text-slate-500">{row.message}</div>
                </td>
                <td className="px-4 py-3">{row.caseCell}</td>
                <td className="px-4 py-3">{row.ruleText}</td>
                <td className="px-4 py-3">{row.assigneeName}</td>
                <td className="px-4 py-3">{row.createdAt}</td>
                <td className="px-4 py-3">
                  {row.pending ? (
                    <ReleaseEscalationButton escalationId={row.id} />
                  ) : (
                    <div className="text-xs text-slate-500">{row.clearedLine ?? "-"}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <Link
                      href={`/admin/alerts/escalations/${row.id}`}
                      className="text-blue-700 underline"
                    >
                      보기
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDrawerId(row.id)}
                      className="text-left text-xs text-slate-700 underline"
                    >
                      통합 상세
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EscalationDetailDrawer
        escalationId={drawerId}
        open={!!drawerId}
        onClose={() => setDrawerId(null)}
      />
    </>
  );
}
