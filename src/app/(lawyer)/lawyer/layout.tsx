import type { ReactNode } from "react";
import { requireLawyer } from "@/lib/auth/session";
import AuthStatus from "@/components/auth/auth-status";

type Props = {
  children: ReactNode;
};

export default async function LawyerLayout({ children }: Props) {
  const user = await requireLawyer();

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b bg-slate-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <div className="text-lg font-semibold">AI법친 변호사 포털</div>
            <div className="text-sm text-gray-600">권한: {user.role}</div>
          </div>
          <AuthStatus user={user} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
