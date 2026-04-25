import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";

export default async function HomePage() {
  const user = await getSessionUser();

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold">AI법친</h1>
      <p className="mt-4 text-gray-700">
        법률판단을 대신하지 않고, 사건 정리와 상담 준비를 돕는 플랫폼입니다.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        {user ? (
          <Link
            href="/dashboard"
            className="rounded-lg bg-black px-5 py-3 text-white"
          >
            대시보드로 이동
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-lg bg-black px-5 py-3 text-white"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="rounded-lg border px-5 py-3"
            >
              회원가입
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
