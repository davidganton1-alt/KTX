"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { GlowCard } from "@/components/GlowCard";

export function VerifyClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    async function verify() {
      try {
        const res = await fetch(`/api/auth/verify?token=${token}`, { cache: "no-store" });
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
          setTimeout(() => router.push("/login"), 2500);
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed.");
        }
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Network error.");
      }
    }
    verify();
  }, [token, router]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md">
        <GlowCard className="p-8 text-center">
          {status === "loading" && (
            <>
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[var(--gold)] border-t-transparent" />
              <h2 className="text-xl font-bold">Verifying your email...</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">Please wait while we confirm your account.</p>
            </>
          )}
          {status === "success" && (
            <>
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-profit/20 text-3xl text-profit">✓</div>
              <h2 className="text-xl font-bold text-profit">{message}</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">Redirecting you to sign in...</p>
            </>
          )}
          {status === "error" && (
            <>
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-loss/20 text-3xl text-loss">✕</div>
              <h2 className="text-xl font-bold text-loss">{message}</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">Please try registering again or contact support.</p>
              <a href="/register" className="btn-gold mt-5 inline-flex">Back to register</a>
            </>
          )}
        </GlowCard>
      </div>
    </main>
  );
}
