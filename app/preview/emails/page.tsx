const SAMPLES = [
  { id: 'welcome', label: 'Welcome', subject: 'Welcome to KingdomTradeX' },
  { id: 'creator-received', label: 'Creator: application received', subject: 'Your creator application is under review' },
  { id: 'creator-approved', label: 'Creator: approved', subject: 'Your creator application is approved' },
  { id: 'creator-rejected', label: 'Creator: rejected', subject: 'Update on your creator application' },
  { id: 'pastor-approved', label: 'Pastor: approved', subject: 'Your pastor account is ready' },
  { id: 'deposit-confirmed', label: 'Deposit confirmed', subject: 'Deposit confirmed — $5,000.00' },
  { id: 'profit-processed', label: 'Profit withdrawal processed', subject: 'Your profit withdrawal is on the way' },
  { id: 'principal-requested', label: 'Principal withdrawal requested', subject: 'Principal withdrawal request received' },
  { id: 'principal-approved', label: 'Principal withdrawal approved', subject: 'Your withdrawal has been approved' },
  { id: 'principal-rejected', label: 'Principal withdrawal rejected', subject: 'Update on your withdrawal request' },
  { id: 'referral-requested', label: 'Referral withdrawal requested', subject: 'Referral withdrawal request received' },
  { id: 'referral-decision', label: 'Referral withdrawal decision', subject: 'Referral withdrawal approved' },
  { id: 'weekly-summary', label: 'Weekly profit summary', subject: 'Your week in review' },
  { id: 'password-reset', label: 'Password reset', subject: 'Reset your KingdomTradeX password' },
  { id: 'agreement-reminder', label: 'Agreement reminder', subject: 'One quick step left on your account' },
  { id: 'pastor-received', label: 'Pastor: application received', subject: 'Your pastor application is under review' },
  { id: 'pastor-rejected', label: 'Pastor: rejected', subject: 'Update on your pastor application' },
  { id: 'announcement', label: 'Platform announcement', subject: 'Scheduled maintenance — Sep 20, 02:00 UTC' },
  { id: 'new-login', label: 'New login alert', subject: 'New sign-in to your KingdomTradeX account' },
  { id: 'password-changed', label: 'Password changed', subject: 'Your password was changed' },
  { id: 'account-restricted', label: 'Account restricted', subject: 'Your account is under security review' },
  { id: 'first-deposit-reminder', label: 'First-deposit reminder', subject: 'Your $50 platform credit is waiting' },
  { id: 'support-ticket', label: 'Support ticket reply', subject: 'We received your message' },
];

export default async function EmailPreviews({ searchParams }: { searchParams?: { t?: string } }) {
  const selected = SAMPLES.find((s) => s.id === searchParams?.t) || SAMPLES[0];

  return (
    <div className="min-h-screen p-8" style={{ background: '#f7f6f1' }}>
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-1 text-[24px] font-semibold tracking-[-0.01em]" style={{ color: '#1a1e33' }}>Email template previews</h1>
        <p className="mb-6 text-[13px]" style={{ color: '#6b7086' }}>
          Phase G/G.5 · {SAMPLES.length} transactional templates · table HTML + inline CSS · plain-text auto-derived · SMTP inactive until EMAIL_USER/EMAIL_PASS are set
        </p>
        <div className="mb-6 flex flex-wrap gap-2">
          {SAMPLES.map((s) => (
            <a key={s.id} href={'/preview/emails?t=' + s.id}
              className="rounded-lg px-3.5 py-2 text-[13px] font-medium no-underline transition"
              style={s.id === selected.id
                ? { background: '#a8760a', color: '#fff' }
                : { background: '#fff', color: '#1a1e33', border: '1px solid #e5e7eb' }}>
              {s.label}
            </a>
          ))}
        </div>
        <div className="mb-4 rounded-lg border px-4 py-3 text-[12px]" style={{ background: '#fff', borderColor: '#e5e7eb', color: '#6b7086' }}>
          <strong style={{ color: '#1a1e33' }}>Subject:</strong> {selected.subject}
        </div>
        <div className="overflow-hidden rounded-xl border shadow-sm" style={{ borderColor: '#e5e7eb' }}>
          <iframe src={'/api/email-preview?t=' + selected.id} className="h-[900px] w-full" title="Email preview" sandbox="allow-popups" />
        </div>
      </div>
    </div>
  );
}
