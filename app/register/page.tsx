import { Suspense } from "react";
import { RegisterForm } from "./RegisterForm";

export const metadata = { title: "Register — KingdomTradeX" };

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen">
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[var(--gold)] border-t-transparent" />
            <p className="mt-4 text-sm text-[var(--muted)]">Loading...</p>
          </div>
        </div>
      }>
        <RegisterForm />
      </Suspense>
    </main>
  );
}
