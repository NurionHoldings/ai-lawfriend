import type { ReactNode } from "react";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast/ToastProvider";

export const metadata = {
  title: "AI법친",
  description: "사건 정리와 상담 준비를 돕는 플랫폼",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-dvh bg-white text-neutral-900 antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
