import { Suspense } from "react";
import LoginPageClient from "./login-page-client";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="px-6 py-16 text-center text-sm text-gray-600">
          로딩...
        </div>
      }
    >
      <LoginPageClient />
    </Suspense>
  );
}
