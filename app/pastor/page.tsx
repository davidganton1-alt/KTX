'use client';

// Pastor dashboard — Phase 2.2. Renders the shared RoleDashboard (approved
// preview design) bound to live data: wallet/state, deposits/history,
// referral/balance (commissions ledger), pastor/me (flock + invite link).
// Pastors are users first: all member features plus Ministry section.

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RoleDashboard, type RolePersona } from '@/components/design-system/RoleDashboard';
import { DepositModal } from '@/components/DepositModal';
import { ProfitWithdrawModal } from '@/components/ProfitWithdrawModal';
import { PrincipalWithdrawModal } from '@/components/PrincipalWithdrawModal';
import { ReferralWithdrawModal } from '@/components/ReferralWithdrawModal';
import { TradingAgreementModal } from '@/components/TradingAgreementModal';

const BASE_PASTOR: RolePersona = {
  brandSub: 'Pastor',
  roleSection: 'Ministry',
  peopleLabel: 'Flock',
  name: 'Pastor',
  org: 'Your ministry',
  orgField: 'Ministry / church',
};

export default function PastorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<any>(null);
  const [pastor, setPastor] = useState<any>(null);
  const [referral, setReferral] = useState<any>(null);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [me, setMe] = useState<any>(null);
  const [showAgreement, setShowAgreement] = useState(false);

  const [showDeposit, setShowDeposit] = useState(false);
  const [showProfit, setShowProfit] = useState(false);
  const [showPrincipal, setShowPrincipal] = useState(false);
  const [showCommission, setShowCommission] = useState(false);

  const load = useCallback(async () => {
    try {
      const pRes = await fetch('/api/pastor/me', { cache: 'no-store' });
      if (pRes.status === 401) { router.push('/login'); return; }
      if (pRes.status === 403) { router.push('/console'); return; }
      if (pRes.ok) setPastor(await pRes.json());

      const [wRes, dRes, rRes, meRes] = await Promise.all([
        fetch('/api/wallet/state', { cache: 'no-store' }),
        fetch('/api/deposits/history', { credentials: 'include', cache: 'no-store' }),
        fetch('/api/referral/balance', { credentials: 'include', cache: 'no-store' }),
        fetch('/api/auth/me', { cache: 'no-store' }),
      ]);
      if (wRes.ok) setWallet(await wRes.json());
      else if (wRes.status === 401) { router.push('/login'); return; }
      if (dRes.ok) { const d = await dRes.json(); setDeposits(d.deposits || []); }
      if (rRes.ok) setReferral(await rRes.json());
      const meData = meRes.ok ? await meRes.json() : null;
      if (meData) setMe(meData);
      if (meData?.role && !meData.hasSignedAgreement) setShowAgreement(true);
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
    const h = () => { load(); };
    window.addEventListener('ktx:deposits-changed', h);
    return () => window.removeEventListener('ktx:deposits-changed', h);
  }, [load]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  const persona: RolePersona = {
    ...BASE_PASTOR,
    name: wallet?.name ?? pastor?.name ?? 'Pastor',
    org: pastor?.ministry ?? BASE_PASTOR.org,
  };

  return (
    <>
      <RoleDashboard
        persona={persona}
        loading={loading}
        data={{ wallet, deposits, referral, pastor }}
        handlers={{
          onDeposit: () => setShowDeposit(true),
          onWithdrawProfit: () => setShowProfit(true),
          onWithdrawPrincipal: () => setShowPrincipal(true),
          onCommissionWithdraw: () => setShowCommission(true),
          onLogout: handleLogout,
        }}
      />

      <DepositModal open={showDeposit} onClose={() => setShowDeposit(false)} />
      <ProfitWithdrawModal
        open={showProfit}
        onClose={() => setShowProfit(false)}
        availableProfit={Number(wallet?.availableProfit || 0)}
        onDone={load}
      />
      <PrincipalWithdrawModal
        open={showPrincipal}
        onClose={() => setShowPrincipal(false)}
        principal={Number(wallet?.deposited || 0)}
        tier={wallet?.tier || 'none'}
        depositAt={wallet?.depositAt}
        onDone={load}
      />
      <ReferralWithdrawModal
        open={showCommission}
        availableBalance={Number(referral?.availableBalance || 0)}
        onClose={() => setShowCommission(false)}
        onSuccess={load}
        title="Withdraw Commissions"
      />
      {showAgreement && (
        <TradingAgreementModal
          userName={me?.name}
          onAgree={() => {
            setShowAgreement(false);
            setMe((m: any) => (m ? { ...m, hasSignedAgreement: true } : m));
          }}
        />
      )}
    </>
  );
}
