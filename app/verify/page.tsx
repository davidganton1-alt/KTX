import { Suspense } from "react";
import { VerifyClient } from "./VerifyClient";

export const dynamic = "force-dynamic";

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[var(--gold)] border-t-transparent" />
          <p className="text-sm text-[var(--muted)]">Loading verification environment...</p>
        </div>
      </div>
    }>
      <VerifyClient />
    </Suspense>
  );
}
