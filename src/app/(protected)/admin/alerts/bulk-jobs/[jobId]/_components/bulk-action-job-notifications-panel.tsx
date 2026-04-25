"use client";

import Link from "next/link";

type Row = {
  id: string;
  title: string;
  body: string | null;
  type: string;
  createdAt: string | Date;
  targetHref: string | null;
};

export function BulkActionJobNotificationsPanel({ rows }: { rows: Row[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-800">관련 알림</h2>
      </div>

      <div className="space-y-3">
        {rows.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
            연결된 알림이 없습니다.
          </div>
        )}

        {rows.map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-medium text-slate-800">{item.title}</div>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                {item.type}
              </span>
            </div>

            {item.body && (
              <div className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{item.body}</div>
            )}

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {new Date(item.createdAt).toLocaleString("ko-KR")}
              </span>
              {item.targetHref && (
                <Link href={item.targetHref} className="text-xs text-blue-600 hover:underline">
                  바로가기
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
