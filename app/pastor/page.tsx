'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RoleDashboard } from '@/components/design-system/RoleDashboard';
import { DepositModal } from '@/components/DepositModal';
import { ProfitWithdrawModal } from '@/components/ProfitWithdrawModal';
import { PrincipalWithdrawModal } from '@/components/PrincipalWithdrawModal';
import { ReferralWithdrawModal } from '@/components/ReferralWithdrawModal';
import { TradingAgreementModal } from '@/components/TradingAgreementModal';
import { ReviewInvitationModal } from '@/components/ReviewInvitationModal';

const PASTOR = {
  brandSub: 'Pastor',
  roleSection: 'Ministry',
  peopleLabel: 'Flock',
  name: 'Pastor',
  org: 'Ministry',
  orgField: 'Ministry / church',
};

export default function PastorPage() {
  const router = useRouter();
  const [pastor, setPastor] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [referral, setReferral] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<any>(null);

  const [showDeposit, setShowDeposit] = useState(false);
  const [showProfitWithdraw, setShowProfitWithdraw] = useState(false);
  const [showPrincipalWithdraw, setShowPrincipalWithdraw] = useState(false);
  const [showReferralWithdraw, setShowReferralWithdraw] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const pRes = await fetch('/api/pastor/me', { cache: 'no-store', credentials: 'include' });
      if (pRes.status === 401) { router.push('/login'); return; }
      if (pRes.status === 403) { router.push('/console'); return; }
      if (pRes.ok) setPastor(await pRes.json());

      const [wRes, dRes, rRes, meRes] = await Promise.all([
        fetch('/api/wallet/state', { credentials: 'include' }),
        fetch('/api/deposits/history', { credentials: 'include' }),
        fetch('/api/referral/balance', { credentials: 'include' }),
        fetch('/api/auth/me', { credentials: 'include' }),
      ]);
      if (wRes.ok) setWallet(await wRes.json());
      if (dRes.ok) setDeposits((await dRes.json()).deposits || []);
      if (rRes.ok) setReferral(await rRes.json());
      if (meRes.ok) {
        const meData = await meRes.json();
        setMe(meData);
        if (meData?.role && !meData.hasSignedAgreement) setShowAgreement(true);
      }
    } catch (e) {
      console.error('Load failed', e);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
    const h = () => loadData();
    window.addEventListener('ktx:deposits-changed', h);
    return () => window.removeEventListener('ktx:deposits-changed', h);
  }, [loadData]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  if (loading || !wallet || !pastor) {
    return <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]"><p className="text-[var(--muted)]">Loading...</p></div>;
  }

  const principal = Number(wallet.deposited || 0);
  const availableProfit = Number(wallet.availableProfit || 0);
  const tier = wallet.tier || 'faithful';

  const persona = { ...PASTOR, name: wallet.name ?? pastor.name ?? 'Pastor', org: pastor.ministry ?? PASTOR.org };

  return (
    <>
      <RoleDashboard
        persona={persona}
        data={{ wallet, deposits, referral, pastor, me }}
        handlers={{
          onDeposit: () => setShowDeposit(true),
          onWithdrawProfit: () => setShowProfitWithdraw(true),
          onWithdrawPrincipal: () => setShowPrincipalWithdraw(true),
          onCommissionWithdraw: () => setShowReferralWithdraw(true),
          onLogout: handleLogout,
          onViewAgreement: () => setShowAgreement(true),
          onReview: () => setShowReview(true),
        }}
      />

      <DepositModal open={showDeposit} onClose={() => setShowDeposit(false)} />
      <ProfitWithdrawModal open={showProfitWithdraw} onClose={() => setShowProfitWithdraw(false)} availableProfit={availableProfit} onDone={loadData} />
      <PrincipalWithdrawModal open={showPrincipalWithdraw} onClose={() => setShowPrincipalWithdraw(false)} principal={principal} tier={tier} depositAt={wallet.depositAt} onDone={loadData} />
      <ReferralWithdrawModal open={showReferralWithdraw} onClose={() => setShowReferralWithdraw(false)} availableBalance={referral?.availableBalance || 0} onSuccess={loadData} title="Withdraw Commissions" />
      {showAgreement && <TradingAgreementModal userName={me?.name ?? wallet.name} onAgree={() => { setShowAgreement(false); setMe((m: any) => (m ? { ...m, hasSignedAgreement: true } : m)); }} />}
      <ReviewInvitationModal open={showReview} triggerType="activeUser30Days" onClose={() => setShowReview(false)} onInvited={() => setShowReview(false)} />
    </>
  );
}
