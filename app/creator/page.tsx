'use client';

// Creator dashboard — Phase 2.2.
// TODO Phase F: add 'creator' role; currently shares pastor economics per spec
// (is_pastor accounts are the gate) and identical 5% + 0.1% referral math.
// Same RoleDashboard design as pastor, Creator persona: Network / Community.

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RoleDashboard, type RolePersona } from '@/components/design-system/RoleDashboard';
import { DepositModal } from '@/components/DepositModal';
import { ProfitWithdrawModal } from '@/components/ProfitWithdrawModal';
import { PrincipalWithdrawModal } from '@/components/PrincipalWithdrawModal';
import { ReferralWithdrawModal } from '@/components/ReferralWithdrawModal';
import { TradingAgreementModal } from '@/components/TradingAgreementModal';

const BASE_CREATOR: RolePersona = {
  brandSub: 'Creator',
  roleSection: 'Network',
  peopleLabel: 'Community',
  name: 'Creator',
  org: 'Your brand',
  orgField: 'Brand',
};

export default function CreatorPage() {
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
      // Gate: creator seats today are held by pastor-approved accounts.
      const pRes = await fetch('/api/pastor/me', { cache: 'no-store' });
      if (pRes.status === 401) { router.push('/login'); return; }
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
    ...BASE_CREATOR,
    name: wallet?.name ?? me?.name ?? 'Creator',
    org: pastor?.ministry ?? BASE_CREATOR.org,
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
