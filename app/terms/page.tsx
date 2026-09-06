import { SectionIcon } from "@/components/SectionIcon";
import { Reveal } from "@/components/Reveal";
import Link from "next/link";

export const metadata = { title: "Terms of Service — KingdomTradeX" };

const sections = [
  {
    id: "acceptance",
    h: "1. Acceptance of Terms",
    p: "These Terms of Service (\"Terms\") are a legally binding agreement between you (\"you\" or \"user\") and KingdomTradeX (\"we\", \"our\", or \"us\"). By creating an account, depositing funds, or using any part of the platform, you accept these Terms in full. If you do not agree, you must not use the platform.",
  },
  {
    id: "eligibility",
    h: "2. Eligibility",
    p: "You must be at least 18 years old and legally capable of entering binding agreements in your jurisdiction to use the platform. By using KingdomTradeX, you represent and warrant that you meet these requirements and that your use does not violate any law applicable to you.",
  },
  {
    id: "account",
    h: "3. Your Account",
    list: [
      "You are responsible for maintaining the confidentiality of your login credentials.",
      "You are responsible for all activity that occurs under your account.",
      "You must notify us immediately of any unauthorized access or suspicious activity.",
      "One person may not hold more than one account. We reserve the right to close duplicate accounts.",
      "Email verification is required before login or transactions. Unverified accounts cannot access the platform.",
    ],
  },
  {
    id: "platform",
    h: "4. Description of the Platform",
    p: "KingdomTradeX is a faith-driven investment platform. When you deposit funds, you entrust them to our AI trading engine, which executes trades across a diversified basket of cryptocurrencies, U.S. stocks, and commodities on your behalf. You are not a trader yourself — the engine trades for you under the plan and tier you have selected.",
  },
  {
    id: "plans",
    h: "5. Plans and Tiers",
    p: "We offer three tiers — Faithful, Steward, and Ambassador — each with its own minimum deposit, target daily rate, and holding period. The daily rates displayed on the platform are target rates based on the engine's design, not guaranteed returns. Actual daily returns vary with market conditions.",
  },
  {
    id: "deposits",
    h: "6. Deposits",
    p: "Deposits are credited to your account upon confirmed receipt by our payment processors. Once credited, your deposit is active in the engine under your selected tier. The free $50 welcome credit, where applicable, is a promotional gift that trades alongside your deposit under the same engine rules but is not withdrawable as principal.",
  },
  {
    id: "withdrawals",
    h: "7. Withdrawals",
    list: [
      "Profit withdrawals: Your accrued profit is withdrawable at any time, subject to routine review to prevent fraud.",
      "Principal withdrawals: Your deposited principal becomes fully withdrawable after your tier's holding period (3 months for Faithful, 6 months for Steward, 12 months for Ambassador).",
      "Early principal withdrawal: Withdrawing your principal before the holding period completes incurs a 25% deduction to cover engine rebalancing and administrative costs.",
      "The free $50 welcome credit is a promotional gift and is not part of your withdrawable principal.",
    ],
  },
  {
    id: "holding",
    h: "8. Holding Periods",
    p: "Each tier's holding period reflects the time the engine needs to execute its full strategy across market cycles. Withdrawing early disrupts this cycle and reduces the engine's ability to protect and grow your principal, which is why the early-withdrawal deduction exists.",
  },
  {
    id: "risk",
    h: "9. Trading Risk and Agreement",
    p: "Trading involves substantial risk of loss, including the possible loss of some or all of your deposited principal. Before using the platform, you must sign our Trading Agreement, which contains the full risk disclosure, the statement that profits are not guaranteed, and your acknowledgment that you trade at your own risk. The Trading Agreement is a separate document that supplements these Terms and is required before you can transact.",
  },
  {
    id: "not-advice",
    h: "10. Not Investment Advice",
    p: "Nothing on this platform constitutes financial, investment, legal, or tax advice. We provide a technology and stewardship framework — not personalized financial guidance. You are solely responsible for your own investment decisions and should consult independent professional advisors where appropriate.",
  },
  {
    id: "fees",
    h: "11. Fees",
    p: "KingdomTradeX does not charge hidden fees. Deposits are processed without platform deductions. Your daily target rate is the net rate you earn. Withdrawals may be subject to external payment-processor or network fees that are disclosed at the time of withdrawal.",
  },
  {
    id: "referrals",
    h: "12. Referral Program",
    p: "Members and approved pastors may earn referral bonuses when they invite others to the platform and those invitees activate their first plan. Bonuses are credited according to the rates displayed in your dashboard at the time of the referral. We reserve the right to modify the referral program or withhold bonuses for referrals that appear fraudulent or abusive.",
  },
  {
    id: "pastors",
    h: "13. Pastors",
    p: "Pastors are approved community shepherds who walk with this work and may refer members to the platform. Every pastor application is reviewed by our admin before approval. Approved pastors earn a share of the profit their referred members generate, at the share rate displayed in their dashboard. We may suspend or remove any pastor for conduct that violates these Terms or our community standards.",
  },
  {
    id: "official",
    h: "14. Official Website Declaration",
    p: "This is the ONLY official KingdomTradeX website. No other person, website, social media channel, or organization is authorized to operate under our name, collect funds on our behalf, or represent us. If anyone contacts you claiming to represent KingdomTradeX through a channel other than this website, do not send money and report the contact to us immediately.",
  },
  {
    id: "prohibited",
    h: "15. Prohibited Conduct",
    p: "You agree not to:",
    list: [
      "Use the platform for money laundering, fraud, or any illegal activity.",
      "Create multiple accounts to abuse the referral or welcome-credit programs.",
      "Attempt to interfere with the platform's operation, security, or infrastructure.",
      "Misrepresent your identity, jurisdiction, or eligibility.",
      "Impersonate KingdomTradeX or its staff, pastors, or affiliates.",
    ],
  },
  {
    id: "termination",
    h: "16. Termination",
    p: "We may suspend or close your account for violations of these Terms, fraudulent activity, or prolonged inactivity. You may close your account at any time, subject to any outstanding holding periods and withdrawal rules that apply to your balance.",
  },
  {
    id: "ip",
    h: "17. Intellectual Property",
    p: "All content on the platform — including the AI engine, design, text, graphics, logos, and trademarks — is owned by or licensed to KingdomTradeX and protected by intellectual-property law. You may not copy, modify, or redistribute our content without written permission.",
  },
  {
    id: "limitation",
    h: "18. Limitation of Liability",
    p: "To the maximum extent permitted by law, KingdomTradeX is not liable for any indirect, incidental, consequential, or punitive damages arising out of your use of the platform, including lost profits or trading losses. Our total liability to you for any claim is limited to the amount of funds actually held in your account at the time the claim arises.",
  },
  {
    id: "indemnity",
    h: "19. Indemnification",
    p: "You agree to indemnify and hold harmless KingdomTradeX, its officers, directors, and employees from any claim, loss, or expense arising out of your use of the platform or your breach of these Terms.",
  },
  {
    id: "law",
    h: "20. Governing Law and Dispute Resolution",
    p: "These Terms are governed by the laws of the United States and the state in which KingdomTradeX is registered. Any dispute arising out of or relating to these Terms shall first be attempted to be resolved through good-faith negotiation, then through binding arbitration in accordance with the rules of the American Arbitration Association, unless prohibited by law.",
  },
  {
    id: "changes",
    h: "21. Changes to These Terms",
    p: "We may update these Terms from time to time. When we make material changes, we will notify you through the platform and post the updated Terms with a new \"last updated\" date. Your continued use after changes take effect constitutes your acceptance. You may stop using the platform if you do not agree with the changes.",
  },
  {
    id: "severability",
    h: "22. Severability",
    p: "If any provision of these Terms is held invalid or unenforceable, the remaining provisions remain in full effect.",
  },
  {
    id: "contact",
    h: "23. Contact",
    p: "For questions about these Terms, contact us at support@kingdomtradex.com or through the support form on this website.",
  },
];

export default function TermsPage() {
  return (
    <main className="container-page py-16">
      <div className="text-center">
        <div className="mx-auto mb-4 flex w-fit justify-center"><SectionIcon name="book" size={56} /></div>
        <p className="eyebrow">Legal</p>
        <h1 className="section-title mt-2 text-4xl md:text-5xl">Terms of <span className="gradient-text">Service</span></h1>
        <p className="mt-3 text-sm text-[var(--muted)]">Last updated: September 2026</p>
      </div>

      <div className="mx-auto mt-12 grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-[var(--border)] bg-[var(--bg-soft)] p-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--gold)]">Contents</p>
            <nav className="space-y-1.5 text-sm max-h-[70vh] overflow-y-auto">
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="block text-[var(--muted)] transition hover:text-[var(--gold)]">{s.h}</a>
              ))}
            </nav>
          </div>
        </aside>

        <div className="space-y-5">
          {sections.map((s, i) => (
            <Reveal key={s.id} variant="up" index={i} as="section" id={s.id} className="card p-6 md:p-7">
              <h2 className="text-xl font-semibold text-[var(--fg)]">{s.h}</h2>
              <p className="mt-3 leading-relaxed text-[var(--muted)]">{s.p}</p>
              {s.list && (
                <ul className="mt-3 space-y-2">
                  {s.list.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-[var(--muted)]">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--gold)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
          ))}

          <div className="card-grad mt-10 p-8 text-center">
            <h3 className="section-title text-2xl">Questions about the <span className="gradient-text">terms</span>?</h3>
            <p className="mt-2 text-[var(--muted)]">Our team is happy to clarify anything.</p>
            <Link href="/support" className="btn-primary mt-5 inline-flex">Contact Support</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
