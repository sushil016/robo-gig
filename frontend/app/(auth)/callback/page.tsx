/**
 * OAuth Callback Handler
 * Processes OAuth redirects from Google and GitHub
 * Receives tokens from backend redirect and stores in auth state
 */

'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/lib/store/authStore';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

function OAuthCallbackPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setLoading = useAuthStore((state) => state.setLoading);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setLoading(true);

        // Extract parameters from URL
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const errorParam = searchParams.get('error');
        const redirectTo = searchParams.get('redirect') || '/';

        // Check for OAuth errors
        if (errorParam) {
          setError('Authentication failed');
          toast.error('Authentication failed', {
            description: decodeURIComponent(errorParam),
          });
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        // Validate required parameters
        if (!accessToken || !refreshToken) {
          setError('Invalid callback - missing tokens');
          toast.error('Authentication failed', {
            description: 'Invalid callback parameters',
          });
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        // Fetch user data using the access token
        // Temporarily store tokens for the API call
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
        }

        // Get user profile
        const user = await authApi.getCurrentUser();

        // Store authentication state
        setAuth(user, accessToken, refreshToken);

        // Success notification
        toast.success('Successfully logged in!', {
          description: `Welcome back, ${user.name || user.email}`,
        });

        // Redirect to intended destination
        router.push(redirectTo);
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('Failed to complete authentication');
        toast.error('Authentication failed', {
          description: 'An error occurred while logging in',
        });
        setTimeout(() => router.push('/login'), 2000);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, router, setAuth, setLoading]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-xl font-semibold">
            Authentication Error
          </div>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-lg font-medium">Completing authentication...</p>
        <p className="text-sm text-muted-foreground">
          Please wait while we log you in
        </p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <OAuthCallbackPageContent />
    </Suspense>
  );
}
