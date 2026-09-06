// Dev Mode email sender — logs verification link to console + returns it for UI display.
// Later, swap this with a real provider (Resend/SendGrid) by adding one env var.

export function sendVerificationEmail(email: string, token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";
  const verifyLink = `${baseUrl}/verify?token=${token}`;
  
  // Log to server console for Dev Mode
  console.log(`
═══════════════════════════════════════════════════════════
📧 VERIFICATION EMAIL (Dev Mode)
═══════════════════════════════════════════════════════════
To: ${email}
Subject: Verify your KingdomTradeX account

Click the link below to verify your account:

${verifyLink}

This link expires in 24 hours.
═══════════════════════════════════════════════════════════
  `);

  return verifyLink;
}
