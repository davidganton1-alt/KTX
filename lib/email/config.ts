import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

let cached: Transporter | null = null;

export function isEmailConfigured(): boolean {
  return !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
}

// Lazy: nodemailer must not capture empty creds at module load (Next evaluates
// env at build time). First real send creates the transport.
export function getTransporter(): Transporter {
  if (cached) return cached;
  cached = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT || 587),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  return cached;
}

export const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@kingdomtradex.com';
export const FROM_NAME = process.env.FROM_NAME || 'KingdomTradeX';
export const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://kingdomtradex.com';
