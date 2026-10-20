// Phase S.1: tiny shared in-memory rate limiter (per key = IP or email).
// Single-container preview makes in-memory acceptable; a Redis/DB-backed
// limiter is a known upgrade for the VPS deploy.
interface Bucket { name: string; ts: number }

const g = globalThis as any;
const store: Map<string, Bucket[]> = g.__ktxRateLimit || (g.__ktxRateLimit = new Map<string, Bucket[]>());

export function rateLimit(name: string, key: string, max: number, windowMs: number): { ok: boolean; retryAfterMs?: number } {
  if (!key) return { ok: true };
  const now = Date.now();
  const list: Bucket[] = (store.get(`${name}:${key}`) || []).filter((b: Bucket) => now - b.ts < windowMs);
  if (list.length >= max) {
    const oldest = Math.min(...list.map((b: Bucket) => b.ts));
    return { ok: false, retryAfterMs: windowMs - (now - oldest) };
  }
  list.push({ name, ts: now });
  store.set(`${name}:${key}`, list);
  return { ok: true };
}

export function ipKey(req: { headers: { get(name: string): string | null } }): string {
  return (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown').split(',')[0].trim();
}

// Phase S.1: per-key async mutex for check-then-insert money paths (referral
// withdrawal reservation). Correct for the single-container deploy; a multi-
// instance VPS deploy must move these claims into Postgres (RPC/advisory lock).
const chains = new Map<string, Promise<unknown>>();
export function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = chains.get(key) || Promise.resolve();
  const next = prev.then(fn, fn);
  chains.set(key, next.catch(() => {}));
  return next;
}
