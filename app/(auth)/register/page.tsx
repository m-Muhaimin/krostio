'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const router = useRouter();

  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);

    // If email confirmation is disabled (mailer_autoconfirm), session is returned immediately
    if (data?.session) {
      router.push('/onboarding');
    } else {
      setIsDone(true);
    }
  };

  if (isDone) {
    return (
      <div className="card-cohere p-8 text-center">
        <h1 className="font-display text-3xl font-medium tracking-tight">Check your email</h1>
        <p className="text-ink/50 text-sm mt-2">
          We&apos;ve sent a confirmation link to <strong>{email}</strong>
        </p>
        <Link href="/login" className="btn-primary inline-block mt-6">
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="card-cohere p-8">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-medium tracking-tight">Create your account</h1>
        <p className="text-ink/50 text-sm mt-2">Start building your financial identity</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="text-[11px] font-mono uppercase tracking-widest text-ink/40 block mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            required
            className="w-full px-4 py-3 rounded-cohere-lg border border-hairline bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink/10 transition-all"
          />
        </div>

        <div>
          <label className="text-[11px] font-mono uppercase tracking-widest text-ink/40 block mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full px-4 py-3 rounded-cohere-lg border border-hairline bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink/10 transition-all"
          />
        </div>

        <div>
          <label className="text-[11px] font-mono uppercase tracking-widest text-ink/40 block mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-cohere-lg border border-hairline bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink/10 transition-all"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full text-center disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-ink/50 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-action-blue hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
