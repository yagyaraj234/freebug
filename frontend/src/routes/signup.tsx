import { useState } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import AuthCard from '../components/auth/AuthCard';
import { errorCode, signup } from '../lib/auth';

export const Route = createFileRoute('/signup')({ component: SignupPage });

const ERRORS: Record<string, string> = {
  email_taken: 'An account with this email already exists.',
  invalid_request: 'Check your details — password must be at least 8 characters.',
};

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(name, email, password);
      navigate({ to: '/dashboard' });
    } catch (err) {
      setError(ERRORS[errorCode(err)] ?? 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Create your account."
      subtitle="Free forever. No credit card required."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-[#2B4BF2] no-underline">
            Log in
          </Link>
        </>
      }>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-xs font-medium text-[#3D4577]">
            Full name
          </label>
          <input
            id="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Ada Lovelace"
            value={name}
            onChange={e => setName(e.target.value)}
            className="fb-input"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-xs font-medium text-[#3D4577]">
            Work email
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
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
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
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthCard>
  );
}
