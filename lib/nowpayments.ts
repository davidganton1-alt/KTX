const BASE_URL = process.env.NOWPAYMENTS_BASE_URL || 'https://api.nowpayments.io';
const API_KEY = process.env['NOWPAYMENTS_' + 'API_KEY'];
const IPN_SECRET = process.env['NOWPAYMENTS_' + 'IPN_SECRET'];

export interface CreatePaymentParams {
  price_amount: number;
  price_currency: string;
  pay_currency?: string;
  order_id?: string;
  ipn_callback_url?: string;
}

export interface PaymentResponse {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  pay_currency: string;
  pay_amount: number;
  price_amount: number;
  price_currency: string;
  created_at: string;
}

export interface PaymentStatusResponse {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  pay_currency: string;
  pay_amount: number;
  price_amount: number;
  actually_paid: number;
  outcome_amount: number;
  outcome_currency: string;
  order_id: string;
  created_at: string;
  updated_at: string;
}

// Create a new payment (generates deposit address)
export async function createPayment(params: CreatePaymentParams): Promise<PaymentResponse> {
  const response = await fetch(`${BASE_URL}/v1/payment`, {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY || '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...params,
      ipn_callback_url: params.ipn_callback_url || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/api/webhooks/nowpayments`,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `NOWPayments API error: ${response.status}`);
  }

  return response.json();
}

// Get payment status by ID
export async function getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
  const response = await fetch(`${BASE_URL}/v1/payment/${paymentId}`, {
    method: 'GET',
    headers: {
      'x-api-key': API_KEY || '',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `NOWPayments API error: ${response.status}`);
  }

  return response.json();
}

// Get estimated price (fiat to crypto conversion)
export async function getEstimate(amount: number, from: string, to: string): Promise<{ estimated_amount: number }> {
  const response = await fetch(`${BASE_URL}/v1/estimate?amount=${amount}&currency_from=${from}&currency_to=${to}`, {
    method: 'GET',
    headers: {
      'x-api-key': API_KEY || '',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `NOWPayments API error: ${response.status}`);
  }

  return response.json();
}

// Get available currencies
export async function getAvailableCurrencies(): Promise<string[]> {
  const response = await fetch(`${BASE_URL}/v1/currencies`, {
    method: 'GET',
    headers: {
      'x-api-key': API_KEY || '',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `NOWPayments API error: ${response.status}`);
  }

  const data = await response.json();
  return data.currencies || [];
}

// Verify IPN webhook signature (HMAC-SHA512; Node built-in crypto, timing-safe)
export function verifyIPNSignature(body: string, signature: string): boolean {
  if (!IPN_SECRET || !signature) return false;

  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha512', IPN_SECRET);
  hmac.update(body);
  const computedSignature = hmac.digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(computedSignature),
      Buffer.from(signature.toLowerCase())
    );
  } catch {
    return false;
  }
}

// Validate payout address
export async function validatePayoutAddress(address: string, currency: string): Promise<{ result: boolean }> {
  const response = await fetch(`${BASE_URL}/v1/cryptos/validate-address?address=${encodeURIComponent(address)}&currency=${encodeURIComponent(currency)}`, {
    method: 'GET',
    headers: {
      'x-api-key': API_KEY || '',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `NOWPayments API error: ${response.status}`);
  }

  return response.json();
}

// Create payout (withdrawal to user)
export async function createPayout(params: {
  address: string;
  currency: string;
  amount: number;
  extra_id?: string;
}): Promise<{ id: string; status: string }> {
  const response = await fetch(`${BASE_URL}/v1/payout/request`, {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY || '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `NOWPayments API error: ${response.status}`);
  }

  return response.json();
}
