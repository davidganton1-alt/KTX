// Phase I: shared password strength policy.
// Minimum 8 chars, at least 1 uppercase, 1 lowercase, 1 number.
export function passwordIssues(pw: string): string[] {
  const issues: string[] = [];
  if (pw.length < 8) issues.push('at least 8 characters');
  if (!/[A-Z]/.test(pw)) issues.push('one uppercase letter');
  if (!/[a-z]/.test(pw)) issues.push('one lowercase letter');
  if (!/[0-9]/.test(pw)) issues.push('one number');
  return issues;
}

export function passwordStrengthLabel(pw: string): 'weak' | 'fair' | 'strong' {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 2) return 'weak';
  if (score <= 4) return 'fair';
  return 'strong';
}

export function passwordErrorMessage(pw: string): string | null {
  const issues = passwordIssues(pw);
  if (issues.length === 0) return null;
  return `Password must contain ${issues.join(', ')}.`;
}
