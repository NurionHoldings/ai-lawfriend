import type { ReactNode } from "react";
import { requireLawyer } from "@/lib/auth/session";
import AuthStatus from "@/components/auth/auth-status";
import { AibeopchinLogo } from "@/components/brand/aibeopchin-logo";

type Props = {
  children: ReactNode;
};

export default async function LawyerLayout({ children }: Props) {
  const user = await requireLawyer();

  return (
    <div className="min-h-screen bg-aibeop-bg text-aibeop-text">
      <header className="border-b border-aibeop-line bg-aibeop-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="space-y-2">
            <AibeopchinLogo href="/lawyer" compact />
            <div className="text-sm font-medium text-aibeop-text">변호사 포털</div>
            <div className="text-sm text-aibeop-muted">권한: {user.role}</div>
          </div>
          <AuthStatus user={user} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
