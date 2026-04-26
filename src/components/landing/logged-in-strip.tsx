import Link from "next/link";
import type { SessionUser } from "@/lib/auth/session";
import { getPostLoginHref, getRoleLabelKo } from "@/lib/landing/post-login-href";

type Props = {
  user: SessionUser;
};

export default function LoggedInStrip({ user }: Props) {
  const href = getPostLoginHref(user.role);
  const label = getRoleLabelKo(user.role);

  return (
    <div className="border-b border-zinc-200 bg-zinc-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-700">
          <span className="font-medium text-zinc-900">{user.name}</span>님 ({label}) · 로그인됨
        </p>
        <Link
          href={href}
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          내 작업 공간으로
        </Link>
      </div>
    </div>
  );
}
