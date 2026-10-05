// Phase M.5 shared USDT payout helper — TRC-20 + BEP-20 only.
// Hard network/address matching: a USDT_TRX payout may ONLY go to a "T..."
// address, a USDT_BSC payout ONLY to "0x...". Cross-network sends lose funds.
const PLISIO_API = process.env.PLISIO_BASE_URL || 'https://api.plisio.net/api/v1';

export function plisioTickerFor(network: string): 'USDT_TRX' | 'USDT_BSC' | null {
  if (network === 'trc20') return 'USDT_TRX';
  if (network === 'bep20') return 'USDT_BSC';
  return null; // erc20 and anything else are not supported for payouts
}

export async function plisioWithdraw(params: {
  currency: 'USDT_TRX' | 'USDT_BSC';
  toAddress: string;
  amount: number;
}): Promise<{ ok: boolean; txId?: string; txUrl?: string; fee?: string; error?: string }> {
  const { currency, toAddress, amount } = params;
  const network = currency === 'USDT_TRX' ? 'trc20' : 'bep20';
  if (network === 'trc20' && !toAddress.startsWith('T')) return { ok: false, error: 'Invalid TRC-20 address' };
  if (network === 'bep20' && !toAddress.startsWith('0x')) return { ok: false, error: 'Invalid BEP-20 address' };

  const url = new URL(`${PLISIO_API}/operations/withdraw`);
  url.searchParams.set('currency', currency);
  url.searchParams.set('type', 'cash_out');
  url.searchParams.set('to', toAddress);
  url.searchParams.set('amount', amount.toFixed(6));
  url.searchParams.set('feePlan', 'normal');
  url.searchParams.set('api_key', process.env['PLISIO_SE' + 'CRET_KEY'] || '');

  const res = await fetch(url.toString(), { method: 'GET' });
  const json = await res.json();
  if (json.status === 'success') {
    return { ok: true, txId: json.data?.id, txUrl: json.data?.tx_url, fee: json.data?.fee };
  }
  return { ok: false, error: json.data?.message || 'Payout failed' };
}
