import { SectionIcon } from "@/components/SectionIcon";
import { Reveal } from "@/components/Reveal";

export default function TermsPage() {
  const sections = [
    {
      h: "The model",
      p: "KingdomTradeX lets you add funds, then an AI trades on your balance across crypto, US stocks and commodities. Profit accrues daily. You may withdraw profit, but not your principal. The free $50 credit is a gift; its profit becomes withdrawable only after you add your own funds.",
    },
    {
      h: "Plans",
      p: "Faithful, Steward and Ambassador are the three plans. Each has its own minimum, maximum and target daily rate. Amounts shown are illustrations, not guarantees. Markets move, and past performance never promises the future.",
    },
    {
      h: "Withdrawing your deposit",
      p: "You can withdraw your deposited principal at any time. If you do so before your plan's holding period (6 months for Faithful, 9 months for Steward, 12 months for Ambassador), a 25% deduction applies. Once the holding period has passed, you may withdraw the full deposit with no deduction. Profit withdrawals remain profit only, separate from this rule. The $50 welcome credit is a gift and is not part of your withdrawable principal.",
    },
    {
      h: "Your responsibility",
      p: "Keep your login details safe. You are responsible for activity on your account. If something looks wrong, tell us right away.",
    },
    {
      h: "Demo notice",
      p: "This is a demonstration build. No real funds are deposited or traded. When live features launch, fresh terms will apply and we will ask for your consent.",
    },
  ];

  return (
    <Reveal as="main" variant="right" className="container-page py-16">
      <div className="text-center">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-2 text-4xl font-bold md:text-5xl">Terms of Service</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Last updated: 2026</p>
      </div>

      <div className="mx-auto mt-12 max-w-3xl space-y-4">
        {sections.map((s) => (
          <section key={s.h} className="card p-6">
            <h2 className="text-xl font-semibold text-[var(--fg)]">{s.h}</h2>
            <p className="mt-2 text-[var(--muted)]">{s.p}</p>
          </section>
        ))}
      </div>
      </Reveal>
  );
}
