"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Login failed");
      const dest =
        json.user?.role === "admin"
          ? "/admin"
          : json.user?.isPastor
          ? "/pastor"
          : "/console";
      router.push(dest);
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Reveal as="main" variant="left" className="container-wide flex min-h-screen items-center justify-center py-16">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="logo-glow">
              <Logo size={96} />
            </div>
            <h1 className="mt-4 text-3xl font-bold">
              Welcome <span className="gradient-text">back</span>
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Sign in to your KingdomTradeX account.
            </p>
          </div>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[var(--fg)] outline-none focus:border-[var(--gold)]"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[var(--fg)] outline-none focus:border-[var(--gold)]"
            />
            {error && <p className="text-sm text-loss">{error}</p>}
            <button disabled={loading} className="btn-primary w-full disabled:opacity-60">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-[var(--muted)]">
            New here?{" "}
            <Link href="/register" className="text-[var(--gold)] hover:underline">
              Create an account
            </Link>
          </p>
          <p className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 text-center text-xs text-[var(--muted)]">
            Demo admin: <span className="text-[var(--fg)]">admin@kingdomtradex.com</span> / admin1234
          </p>
        </div>
        <p className="mt-6 text-center text-xs text-[var(--muted)]">
          &ldquo;Commit to the Lord whatever you do, and he will establish your plans.&rdquo; Proverbs 16:3
        </p>
      </div>
    </Reveal>
  );
}
