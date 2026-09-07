import { SectionIcon } from "@/components/SectionIcon";
import { Reveal } from "@/components/Reveal";
import Link from "next/link";

export const metadata = { title: "Privacy Policy | KingdomTradeX" };

const sections = [
  {
    id: "overview",
    h: "1. Overview",
    p: "KingdomTradeX (\"we\", \"our\", or \"us\") respects your privacy and is committed to protecting the personal information you share with us. This Privacy Policy describes how we collect, use, store, and safeguard information when you use our website and trading platform. By creating an account or using the platform, you agree to the practices described in this policy.",
  },
  {
    id: "collect",
    h: "2. Information We Collect",
    p: "We collect only the information needed to operate your account and provide the platform. This includes:",
    list: [
      "Account data: your name, email address, and a hashed password.",
      "Financial data: deposit records, withdrawal records, profit accruals, and the plan tier you have selected.",
      "Referral data: if you were invited by a pastor or member, the name or referral code that brought you to the platform.",
      "Technical data: your IP address, browser type, device type, and session information for security and fraud prevention.",
      "Pastor data (for approved pastors): ministry information, phone number (optional), and referral activity.",
    ],
  },
  {
    id: "use",
    h: "3. How We Use Your Information",
    p: "Your information is used strictly to operate the platform and serve you. Specifically:",
    list: [
      "To create and secure your account.",
      "To credit your account with deposits, accrue daily profit, and process withdrawals.",
      "To verify your email and protect against fraud.",
      "To attribute referral bonuses to the pastor or member who invited you.",
      "To contact you about account security, platform updates, or legal notices.",
      "To comply with our regulatory obligations under our MSB license.",
    ],
  },
  {
    id: "no-sell",
    h: "4. We Do Not Sell Your Data",
    p: "We never sell, rent, or trade your personal information to advertisers, data brokers, or third parties. Your data is not our product. You are our steward, and your information is held in trust.",
  },
  {
    id: "sharing",
    h: "5. Limited Sharing with Trusted Partners",
    p: "We may share minimal information with:",
    list: [
      "Payment processors: only the transaction details required to process your deposit or withdrawal.",
      "Regulatory authorities: when required by law, subpoena, or our MSB compliance obligations.",
      "Cloud infrastructure providers: partners who are contractually bound to protect data and do not use it for their own purposes.",
    ],
  },
  {
    id: "security",
    h: "6. Security of Your Information",
    p: "We protect your data with industry-standard safeguards: passwords are hashed with strong one-way encryption before storage, all connections are encrypted in transit, and administrative access to user data is restricted to authorized personnel. No system is perfectly secure, but we continuously harden ours against known attack patterns.",
  },
  {
    id: "email-verification",
    h: "7. Email Verification",
    p: "Every new account must be verified by clicking a link sent to the registered email address. This step is required. It protects you from unauthorized account creation and ensures only you can access your funds. Unverified accounts cannot log in or transact.",
  },
  {
    id: "retention",
    h: "8. Data Retention",
    p: "We retain your account data for as long as your account is active, plus the period required by our MSB obligations and tax regulations. Transaction records are kept for a minimum of five years to comply with financial regulations.",
  },
  {
    id: "deletion",
    h: "9. Your Right to Deletion",
    p: "You may request the deletion of your account and associated data at any time by contacting support@kingdomtradex.com. We will process your request within 30 days, subject to any data we are legally required to retain (such as transaction records for regulatory purposes).",
  },
  {
    id: "cookies",
    h: "10. Cookies and Local Storage",
    p: "We use essential cookies and local storage to keep you logged in, remember your theme preference, and protect your session. We do not use tracking cookies, advertising cookies, or third-party analytics that profile you across the web.",
  },
  {
    id: "children",
    h: "11. Children's Privacy",
    p: "The platform is not intended for users under the age of 18. We do not knowingly collect information from minors. If we learn we have collected such data, we will delete it promptly.",
  },
  {
    id: "msb",
    h: "12. MSB and Regulatory Compliance",
    p: "As a licensed Money Services Business, we may be required to collect additional identity verification information (such as government-issued ID) for certain transactions. This information is collected solely to comply with law and is protected with the same standards as the rest of your data.",
  },
  {
    id: "international",
    h: "13. International Users",
    p: "If you access the platform from outside the United States, your data may be transferred to and processed in the United States. By using the platform, you consent to this transfer and to the application of U.S. law to your data.",
  },
  {
    id: "changes",
    h: "14. Changes to This Policy",
    p: "We may update this Privacy Policy from time to time. When we make material changes, we will notify you through the platform and post the updated policy with a new \"last updated\" date. Your continued use of the platform after changes take effect constitutes your acceptance.",
  },
  {
    id: "contact",
    h: "15. Contact Us",
    p: "For privacy-related questions, data access requests, or deletion requests, please contact us at support@kingdomtradex.com or through the support form on this website.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="container-page py-16">
      <div className="text-center">
        <div className="mx-auto mb-4 flex w-fit justify-center"><SectionIcon name="shield" size={56} /></div>
        <p className="eyebrow">Legal</p>
        <h1 className="section-title mt-2 text-4xl md:text-5xl">Privacy <span className="gradient-text">Policy</span></h1>
        <p className="mt-3 text-sm text-[var(--muted)]">Last updated: September 2026</p>
      </div>

      <div className="mx-auto mt-12 grid gap-8 lg:grid-cols-[220px_1fr]">
        {/* TOC */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-[var(--border)] bg-[var(--bg-soft)] p-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--gold)]">Contents</p>
            <nav className="space-y-1.5 text-sm">
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="block text-[var(--muted)] transition hover:text-[var(--gold)]">{s.h}</a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Body */}
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
            <h3 className="section-title text-2xl">Questions about your <span className="gradient-text">privacy</span>?</h3>
            <p className="mt-2 text-[var(--muted)]">We&rsquo;re here to help. Reach out anytime.</p>
            <Link href="/support" className="btn-primary mt-5 inline-flex">Contact Support</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
