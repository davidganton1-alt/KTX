export type Faq = { q: string; a: string; category: string };

export const FAQ_CATEGORIES = [
  "Getting Started",
  "Plans & Trading",
  "Deposits & Withdrawals",
  "Security & Trust",
  "Pastors & Referrals",
];

export const FAQS: Faq[] = [
  // ── Getting Started ──
  {
    category: "Getting Started",
    q: "What is KingdomTradeX?",
    a: "KingdomTradeX is a faith-driven investment platform that pairs time-tested biblical stewardship with disciplined AI trading. Our engine trades crypto, US stocks, and commodities on your behalf, and every position is chosen, sized, and watched by models built for patience and protection, not hype.",
  },
  {
    category: "Getting Started",
    q: "How do I get the free $50 credit?",
    a: "Every new member receives a $50 free credit once their account is verified and they activate their first plan. The credit is applied automatically to your balance and trades alongside your deposit under the same AI engine.",
  },
  {
    category: "Getting Started",
    q: "Is this a real trading platform?",
    a: "Yes. KingdomTradeX is a registered business operating under an MSB license with a certificate of good standing. Our trading activity, plans, and financial structure are documented and compliant. You can review our licensing in the About section of this site.",
  },
  {
    category: "Getting Started",
    q: "How do I create an account?",
    a: "Click 'Register', choose whether you're joining as a Member or a Pastor, and enter your details. You'll receive a verification email. Confirm it to activate your account. This step protects you and keeps the platform secure.",
  },
  {
    category: "Getting Started",
    q: "Why do I need to verify my email?",
    a: "Email verification confirms you own the address and prevents fraud, fake accounts, and unauthorized access. You cannot log in until your email is confirmed. This is a security measure that protects your funds.",
  },

  // ── Plans & Trading ──
  {
    category: "Plans & Trading",
    q: "What are the plans and their daily rates?",
    a: "We offer three tiers, all with a consistent notional sizing model. Faithful earns 0.5% per day (min. $100), Steward earns 0.75% per day (min. $650), and Ambassador earns 1.0% per day (min. $2,000). Higher tiers unlock additional benefits like priority withdrawals and dedicated support.",
  },
  {
    category: "Plans & Trading",
    q: "What assets does the AI trade?",
    a: "The engine trades a diversified basket of crypto (BTC, ETH, SOL, XRP, BNB and more), US stocks (AAPL, MSFT, NVDA, TSLA, AMZN, GOOGL, META and others), and commodities (gold, silver, oil, natural gas, wheat, corn, coffee, and sugar).",
  },
  {
    category: "Plans & Trading",
    q: "Are the profits guaranteed?",
    a: "No. All trading involves risk, and past performance does not guarantee future results. The AI is designed to manage risk carefully and protect your principal, but markets are unpredictable and losses are possible. You should only invest what you can afford, and you trade at your own risk.",
  },
  {
    category: "Plans & Trading",
    q: "What are the holding periods for each plan?",
    a: "Each plan has a holding period during which your principal remains active in the engine. Faithful is 6 months, Steward is 9 months, and Ambassador is 12 months. Your daily profit is available for withdrawal throughout the holding period.",
  },
  {
    category: "Plans & Trading",
    q: "How does the AI engine make trading decisions?",
    a: "The engine fuses live price, volume, and order-flow signals, then runs them through LSTM and GRU forecasting models and a Kalman volatility filter. Every position is sized against a drawdown guard before entry, so no single move can undo your plan. You can watch the engine live in your dashboard.",
  },

  // ── Deposits & Withdrawals ──
  {
    category: "Deposits & Withdrawals",
    q: "Can I withdraw my deposit?",
    a: "Your daily profit is withdrawable at any time. Your principal (deposit) becomes withdrawable after your plan's holding period completes. This structure lets the engine trade with stability while still giving you regular access to your earnings.",
  },
  {
    category: "Deposits & Withdrawals",
    q: "How often can I withdraw profit?",
    a: "You can request a profit withdrawal at any time from your dashboard. There is no minimum waiting period between profit withdrawals. Your accrued profit is always yours to claim.",
  },
  {
    category: "Deposits & Withdrawals",
    q: "What are the fees?",
    a: "KingdomTradeX does not charge hidden fees. Deposits are free, and your daily rate is net. Withdrawals are processed without platform deductions beyond any network or processor fees that may apply on your payment method.",
  },
  {
    category: "Deposits & Withdrawals",
    q: "How long do withdrawals take?",
    a: "Profit withdrawal requests are reviewed and processed promptly, typically within 24 hours. Ambassador members with priority withdrawal enjoy faster processing. You'll see the status of every request in your dashboard.",
  },
  {
    category: "Deposits & Withdrawals",
    q: "What payment methods are accepted?",
    a: "We support a range of deposit methods including crypto and traditional payment processors. Available options are shown at the deposit step. All transactions are recorded and visible in your wallet history.",
  },

  // ── Security & Trust ──
  {
    category: "Security & Trust",
    q: "Is my money safe?",
    a: "We treat your capital as a sacred trust. The engine guards your principal with drawdown limits, diversifies across asset classes, and never over-leverages. Combined with our licensed, compliant operation and secure account controls, your funds are handled with the highest standard of care.",
  },
  {
    category: "Security & Trust",
    q: "Is KingdomTradeX licensed?",
    a: "Yes. KingdomTradeX operates under a Money Services Business (MSB) license and holds a certificate of good standing. Our registration and compliance details are displayed in the About section so every member can verify our legitimacy.",
  },
  {
    category: "Security & Trust",
    q: "How do I know this is the official website?",
    a: "This is the ONLY official KingdomTradeX website. No other person, site, or group is authorized to operate under our name. Always verify you are on this domain before logging in or depositing. We will never ask for your password or seed phrase via email, chat, or phone.",
  },
  {
    category: "Security & Trust",
    q: "What should I do if someone claims to represent KingdomTradeX?",
    a: "Be cautious. Apart from our pastors listed on this site, no individual is authorized to collect funds or represent KingdomTradeX. If someone contacts you claiming to be us through another channel, do not send money. Contact us directly through this website's support page.",
  },

  // ── Pastors & Referrals ──
  {
    category: "Pastors & Referrals",
    q: "What is a pastor on KingdomTradeX?",
    a: "Pastors are approved community shepherds who walk with this work, pray over it, and refer members. They earn a share of the growth of the people they shepherd. Every pastor application is reviewed by our admin before approval.",
  },
  {
    category: "Pastors & Referrals",
    q: "How do referral bonuses work?",
    a: "When you refer a member who funds their first plan, you earn a referral bonus. Pastors additionally earn an ongoing share rate on their flock's profit. Your referral link and live earnings are tracked in your dashboard.",
  },
];
