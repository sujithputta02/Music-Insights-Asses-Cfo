'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post<{ user: any; token: string }>('/api/auth/register', {
        name,
        email,
        password,
      });

      if (response.success && response.data) {
        setAuth(response.data.user, response.data.token);
        router.push('/search');
      } else {
        setError(response.error || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <Card>
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <p className="text-text-muted mt-2">
              Start building your music library today
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-accent-red-bg border border-accent-red-text/20 text-accent-red-text px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <Input
                label="Name (Optional)"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                autoComplete="name"
              />

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
              <div className="text-xs text-text-muted -mt-2 space-y-1">
                <p className="font-medium">Password must contain:</p>
                <ul className="list-disc list-inside space-y-0.5 ml-2">
                  <li>At least 8 characters</li>
                  <li>One uppercase letter (A-Z)</li>
                  <li>One number (0-9)</li>
                  <li>One special character (!@#$%^&*)</li>
                </ul>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={loading}
                disabled={loading}
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-text-muted">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="text-text-primary font-medium hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
