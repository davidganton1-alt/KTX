import { SectionIcon } from "@/components/SectionIcon";
import { Reveal } from "@/components/Reveal";

export default function PrivacyPage() {
  const sections = [
    {
      h: "What we collect",
      p: "We collect the basics you give us: your name, email and a password that is hashed before it is stored. If you add funds in this demo, we keep a record of the plan you chose and the balance on your account. We do not sell your data and we do not share it with advertisers.",
    },
    {
      h: "How we use it",
      p: "Your information is used to run your account, show your profit, and keep your withdrawals secure. That is the whole point. We use it to serve you, not to profile you.",
    },
    {
      h: "Deposits and withdrawals",
      p: "You may withdraw profit at any time, subject to the platform's review. You may also withdraw your deposited principal at any time. Withdrawing before your plan's holding period, which is 6 months for Faithful, 9 months for Steward and 12 months for Ambassador, carries a 25% deduction. After the holding period, the full deposit is returned with no deduction. The free $50 credit is a gift and is not withdrawable as principal.",
    },
    {
      h: "Your control",
      p: "You can ask us to delete your account and the data tied to it at any time by emailing help@kingdomtradex.com. We will honour the request as soon as we reasonably can.",
    },
    {
      h: "A note on this demo",
      p: "KingdomTradeX in its current form is a demonstration. No real money moves and no live exchange is connected. When real trading arrives, this policy will be updated and we will tell you clearly what changes.",
    },
  ];

  return (
    <Reveal as="main" variant="left" className="container-page py-16">
      <div className="text-center">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-2 text-4xl font-bold md:text-5xl">Privacy Policy</h1>
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
