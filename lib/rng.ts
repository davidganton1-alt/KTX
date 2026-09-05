// lib/rng.ts
// Seeded PRNG (Lehmer/Park-Miller). Identical algorithm to lib/engine.ts.
// Shared helper so dataAggregator + aitrading2 don't duplicate it.

export function rng(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
