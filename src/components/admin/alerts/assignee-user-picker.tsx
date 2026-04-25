"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * `GET /api/admin/users/search` 는 평면 `{ users: [...] }` 만 반환(domain `ok()`·`{ ok, data }` 없음).
 * **슬라이스 12:** `requireOkData` / `requireOkResponseBody` 는 **적용하지 않음** — POST_278 **§6.3**:
 * 서버 래핑·클라 검증 강도는 **팀 합의** 후(선택). 현재는 HTTP 성공 + `users` 배열만 사용.
 */

type UserItem = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
};

type Props = {
  value: string;
  onChange: (next: string) => void;
  roleFilter?: string;
};

export function AssigneeUserPicker({
  value,
  onChange,
  roleFilter = "",
}: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [items, setItems] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = useCallback(async (keyword: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword.trim()) params.set("q", keyword.trim());
      if (roleFilter) params.set("role", roleFilter);

      const res = await fetch(`/api/admin/users/search?${params.toString()}`, {
        cache: "no-store",
      });
      const raw = await res.json().catch(() => null);
      if (!res.ok) {
        setItems([]);
        return;
      }
      if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
        setItems([]);
        return;
      }
      const list = (raw as { users?: unknown }).users;
      setItems(Array.isArray(list) ? (list as UserItem[]) : []);
    } finally {
      setLoading(false);
    }
  }, [roleFilter]);

  useEffect(() => {
    if (!open) return;
    void searchUsers(q);
  }, [q, open, searchUsers]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          placeholder="담당자 userId"
        />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium"
        >
          검색
        </button>
      </div>

      {open ? (
        <div className="absolute z-[90] mt-2 w-full rounded-2xl border border-zinc-200 bg-white shadow-xl">
          <div className="border-b border-zinc-100 p-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              placeholder="이름/이메일/userId 검색"
            />
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            {loading ? (
              <div className="p-3 text-sm text-zinc-500">검색 중...</div>
            ) : items.length > 0 ? (
              <div className="space-y-2">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onChange(item.id);
                      setOpen(false);
                    }}
                    className="block w-full rounded-xl border border-zinc-100 p-3 text-left hover:bg-zinc-50"
                  >
                    <div className="font-medium">
                      {item.name ?? item.email ?? item.id}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">
                      {item.email ?? "-"} / {item.role} / {item.id}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-3 text-sm text-zinc-500">검색 결과가 없습니다.</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
