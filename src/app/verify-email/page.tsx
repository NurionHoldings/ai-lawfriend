import { Suspense } from "react";
import VerifyEmailPage from "./verify-email-client";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="px-6 py-16 text-center text-sm text-aibeop-muted">로딩...</div>
      }
    >
      <VerifyEmailPage />
    </Suspense>
  );
}
