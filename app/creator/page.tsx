'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RoleDashboard } from '@/components/design-system/RoleDashboard';
import dynamic from 'next/dynamic';

// Phase O.1: conditional panels (all mount behind state flags); lazy off first paint
const DepositModal = dynamic(() => import('@/components/DepositModal').then((m) => ({ default: m.DepositModal })), { ssr: false });
const ProfitWithdrawModal = dynamic(() => import('@/components/ProfitWithdrawModal').then((m) => ({ default: m.ProfitWithdrawModal })), { ssr: false });
const PrincipalWithdrawModal = dynamic(() => import('@/components/PrincipalWithdrawModal').then((m) => ({ default: m.PrincipalWithdrawModal })), { ssr: false });
const ReferralWithdrawModal = dynamic(() => import('@/components/ReferralWithdrawModal').then((m) => ({ default: m.ReferralWithdrawModal })), { ssr: false });
const TradingAgreementModal = dynamic(() => import('@/components/TradingAgreementModal').then((m) => ({ default: m.TradingAgreementModal })), { ssr: false });
const ReviewInvitationModal = dynamic(() => import('@/components/ReviewInvitationModal').then((m) => ({ default: m.ReviewInvitationModal })), { ssr: false });

// Phase F: creators now have their own identity (profiles.is_creator /
// role='creator' via creator_applications). Economics identical to pastors
// (5% first-deposit + 0.1% lifetime, wired through referred_by + the
// is_creator check in the deposit webhook).

const BASE_CREATOR = {
  brandSub: 'Creator',
  roleSection: 'Network',
  peopleLabel: 'Community',
  name: 'Creator',
  org: 'My Brand',
  orgField: 'Brand',
};

export default function CreatorPage() {
  const router = useRouter();
  const [creator, setCreator] = useState<any>(null);
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
      const cRes = await fetch('/api/creator/me', { cache: 'no-store', credentials: 'include' });
      if (cRes.status === 401) { router.push('/login'); return; }
      if (cRes.status === 403) { router.push('/console'); return; }
      if (cRes.ok) setCreator(await cRes.json());

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

  if (loading || !wallet || !creator) {
    return <div className="flex min-h-screen items-center justify-center"><p className="text-[var(--muted)]">Loading...</p></div>;
  }

  const principal = Number(wallet.deposited || 0);
  const availableProfit = Number(wallet.availableProfit || 0);
  const tier = wallet.tier || 'faithful';

  const persona = {
    ...BASE_CREATOR,
    name: creator?.name || wallet.name || 'Creator',
    org: creator?.brandName || 'My Brand',
  };

  // RoleDashboard expects `pastor` shaped data for flock + invite link;
  // creator/me returns the same shape (referrals[], inviteLink, ministry=null).
  const roleData = {
    ...(creator || {}),
    ministry: creator?.brandName || null,
    earnedTotal: referral?.totalEarned ?? 0,
    available: referral?.availableBalance ?? 0,
  };

  return (
    <>
      <RoleDashboard
        persona={persona}
        data={{ wallet, deposits, referral, pastor: roleData, me }}
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
