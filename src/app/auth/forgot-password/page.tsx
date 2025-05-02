'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();

    setLoading(false);

    if (data.error) {
      setErrorMessage(data.error);
    } else {
      router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background text-foreground px-4 py-8">
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/images/login-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-10 bg-card text-card-foreground rounded-2xl shadow-xl w-full max-w-md p-8">
        <h1 className="text-3xl font-semibold text-center mb-6">Forgot Password</h1>

        {errorMessage && (
          <div className="mb-4 text-center text-destructive font-medium">{errorMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </Button>
        </form>

        <div className="mt-6 text-sm text-center text-muted-foreground">
          Remember your password?{' '}
          <a href="/auth/login" className="text-primary underline font-medium">
            Login
          </a>
        </div>
      </div>
    </div>
  );
}