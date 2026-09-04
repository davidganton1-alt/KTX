import { randomVerse, verseOfTheDay, type Verse } from "@/lib/bible";

export function Verse({
  variant = "random",
  className = "",
}: {
  variant?: "random" | "today";
  className?: string;
}) {
  const v: Verse = variant === "today" ? verseOfTheDay() : randomVerse();
  return (
    <blockquote className={`rounded-2xl border border-[var(--gold)]/30 bg-[var(--card)] p-5 ${className}`}>
      <p className="text-lg leading-relaxed text-[var(--fg)]">"{v.text}"</p>
      <p className="mt-2 text-sm text-[var(--gold)]">— {v.ref}</p>
    </blockquote>
  );
}
