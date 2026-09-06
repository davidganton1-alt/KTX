import Link from "next/link";
import { FAQS } from "@/lib/faqs";
import { Verse } from "@/components/Verse";
import { SectionIcon } from "@/components/SectionIcon";
import { Reveal } from "@/components/Reveal";

export const metadata = {
  title: "FAQ — KingdomTradeX",
  description: "Common questions about KingdomTradeX, the plans, withdrawals and how the AI trades.",
};

export default function FaqPage() {
  return (
    <Reveal as="main" variant="up" className="container-page py-16">
      <div className="text-center">
        <div className="mx-auto mb-4 flex w-fit justify-center">
          <SectionIcon name="book" size={56} />
        </div>
        <p className="eyebrow">Answers</p>
        <h1 className="mt-2 text-4xl font-bold md:text-5xl">
          Questions, <span className="gradient-text">answered</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-[var(--muted)]">
          Plain answers about how KingdomTradeX works. Still unsure? Reach our team on
          the <Link href="/support" className="text-[var(--gold)] hover:underline">Support</Link> page.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-3xl space-y-3">
        {FAQS.map((f, i) => (
          <details key={i} className="group card p-5 [&_summary]:cursor-pointer">
            <summary className="flex items-center justify-between font-semibold">
              {f.q}
              <span className="text-[var(--muted)] transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm text-[var(--muted)]">{f.a}</p>
          </details>
        ))}
      </div>

      <div className="mx-auto mt-12 max-w-3xl card-grad p-8 text-center md:p-10">
        <h2 className="text-2xl font-bold">Ready to begin?</h2>
        <p className="mx-auto mt-2 max-w-xl text-[var(--muted)]">
          Claim your free $50 credit and let the AI trade with wisdom.
        </p>
        <Link href="/register" className="btn-primary mt-6 inline-flex">Get $50 free</Link>
      </div>

      <div className="mx-auto mt-10 max-w-3xl">
        <Verse variant="random" className="text-center" />
      </div>
    </Reveal>
    );
    }
