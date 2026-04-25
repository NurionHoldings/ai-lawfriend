"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ToastKind = "success" | "error" | "info" | "warning";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  kind: ToastKind;
};

type ToastContextValue = {
  pushToast: (toast: Omit<ToastItem, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const pushToast = useCallback((toast: Omit<ToastItem, "id">) => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
    setItems((prev) => [...prev, { ...toast, id }]);

    window.setTimeout(() => {
      setItems((prev) => prev.filter((x) => x.id !== id));
    }, 3000);
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto rounded-2xl border bg-white p-4 shadow-lg ${
              item.kind === "success"
                ? "border-green-200"
                : item.kind === "error"
                  ? "border-red-200"
                  : item.kind === "warning"
                    ? "border-amber-200"
                    : "border-slate-200"
            }`}
          >
            <div className="text-sm font-semibold text-slate-900">{item.title}</div>
            {item.description ? (
              <div className="mt-1 text-xs text-slate-500">{item.description}</div>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return value;
}
