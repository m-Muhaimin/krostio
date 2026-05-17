'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  };

  return (
    <div className="card-cohere p-8">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-medium tracking-tight">Welcome back</h1>
        <p className="text-ink/50 text-sm mt-2">Sign in to your Krostio account</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
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
            placeholder="••••••••"
            required
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
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-sm text-ink/50 mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-action-blue hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="card-cohere p-8"><p className="text-ink/60 text-center">Loading...</p></div>}>
      <LoginForm />
    </Suspense>
  );
}
