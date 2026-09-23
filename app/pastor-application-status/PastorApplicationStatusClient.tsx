'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PastorApplicationStatusClient() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === 'loading') return;

    setStatus('loading');
    try {
      const res = await fetch(`/api/pastors/status?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      
      if (res.ok || res.status === 404) {
        setResult(data);
        setStatus('success');
      } else {
        setResult({ error: data.error });
        setStatus('error');
      }
    } catch (err) {
      setResult({ error: 'Network error. Please try again.' });
      setStatus('error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#34D399'; // green
      case 'rejected': return '#EF4444'; // red
      case 'pending': return '#F5C97B'; // gold
      default: return 'var(--muted)';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'rejected':
        return (
          <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'pending':
        return (
          <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <section className="container-wide py-16 md:py-24">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 mb-4 rounded-full border text-xs font-bold uppercase tracking-widest" style={{ borderColor: 'var(--border)', color: 'var(--gold)', backgroundColor: 'var(--card)' }}>
              Application Status
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Check Your <span style={{ color: 'var(--gold)' }}>Application</span>
            </h1>
            <p className="text-lg text-[var(--muted)]">
              Enter the email address you used when applying to check your current status.
            </p>
          </div>

          <div className="rounded-2xl border p-8" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
            {(status === 'idle' || status === 'loading') && (
              <form onSubmit={handleCheck} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--fg)' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pastor@example.com"
                    className="w-full px-4 py-3 rounded-xl border text-base outline-none transition focus:border-[var(--gold)]"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-soft)', color: 'var(--fg)' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full rounded-xl px-6 py-3 text-sm font-bold transition hover:brightness-110 disabled:opacity-60"
                  style={{ backgroundColor: 'var(--gold)', color: 'black' }}
                >
                  {status === 'loading' ? 'Checking...' : 'Check Status'}
                </button>
              </form>
            )}

            {status === 'success' && result && (
              <div className="text-center">
                <div className="flex justify-center mb-6" style={{ color: getStatusColor(result.status) }}>
                  {getStatusIcon(result.status)}
                </div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--fg)' }}>
                  {result.status === 'approved' && 'Application Approved'}
                  {result.status === 'rejected' && 'Application Not Approved'}
                  {result.status === 'pending' && 'Application Under Review'}
                  {result.status === 'not_found' && 'Application Not Found'}
                </h2>
                <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
                  {result.message}
                </p>
                {result.name && (
                  <div className="text-sm mb-6" style={{ color: 'var(--fg)' }}>
                    <p><strong>Name:</strong> {result.name}</p>
                    {result.ministry && <p><strong>Ministry:</strong> {result.ministry}</p>}
                    {result.appliedAt && (
                      <p><strong>Applied:</strong> {new Date(result.appliedAt).toLocaleDateString()}</p>
                    )}
                  </div>
                )}
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      setStatus('idle');
                      setEmail('');
                      setResult(null);
                    }}
                    className="rounded-xl border px-6 py-3 text-sm font-medium transition hover:border-[var(--gold)]"
                    style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
                  >
                    Check Another
                  </button>
                  {result.status === 'approved' && (
                    <Link
                      href="/pastor"
                      className="rounded-xl px-6 py-3 text-sm font-bold transition hover:brightness-110"
                      style={{ backgroundColor: 'var(--gold)', color: 'black' }}
                    >
                      Go to Dashboard
                    </Link>
                  )}
                </div>
              </div>
            )}

            {status === 'error' && result && (
              <div className="text-center">
                <div className="flex justify-center mb-6" style={{ color: '#EF4444' }}>
                  <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--fg)' }}>
                  Error
                </h2>
                <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
                  {result.error}
                </p>
                <button
                  onClick={() => {
                    setStatus('idle');
                    setResult(null);
                  }}
                  className="rounded-xl border px-6 py-3 text-sm font-medium transition hover:border-[var(--gold)]"
                  style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/become-pastor"
              className="text-sm font-medium transition hover:text-[var(--gold)]"
              style={{ color: 'var(--muted)' }}
            >
              ← Back to Pastor Application
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
