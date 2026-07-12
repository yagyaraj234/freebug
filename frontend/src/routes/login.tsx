import { useState } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import AuthCard from '../components/auth/AuthCard';
import { errorCode, login } from '../lib/auth';

export const Route = createFileRoute('/login')({ component: LoginPage });

const ERRORS: Record<string, string> = {
  invalid_credentials: 'Wrong email or password.',
};

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate({ to: '/dashboard' });
    } catch (err) {
      setError(ERRORS[errorCode(err)] ?? 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Welcome back."
      subtitle="Log in to see what shipped while you were away."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link
            to="/signup"
            className="font-semibold text-[#2B4BF2] no-underline">
            Sign up
          </Link>
        </>
      }>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-xs font-medium text-[#3D4577]">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="fb-input"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-xs font-medium text-[#3D4577]">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="fb-input"
          />
        </div>
        {error && (
          <p className="m-0 text-[13px] text-[#C23B4B]" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="fb-cta-glow mt-2 w-full rounded-full bg-[#2B4BF2] py-3 text-sm font-semibold text-[#FFFFFF] transition hover:brightness-95 disabled:opacity-70">
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </AuthCard>
  );
}
