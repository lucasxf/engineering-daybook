'use client';

import { Suspense, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import dynamic from 'next/dynamic';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { LoginForm } from '@/components/auth/LoginForm';

const GoogleLoginButton = dynamic(
  () => import('@/components/auth/GoogleLoginButton').then(m => m.GoogleLoginButton),
  { ssr: false }
);

function LoginContent() {
  const t = useTranslations('auth');
  const params = useParams<{ locale: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const redirectTo = searchParams.get('redirect') || undefined;
  const resetSuccess = searchParams.get('reset') === 'success';

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(`/${params.locale}/poks`);
    }
  }, [isLoading, isAuthenticated, router, params.locale]);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <Card className="w-full max-w-[400px] p-6 sm:p-8">
        {/* Logo mark / icon placeholder */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <div className="mb-6 text-center">
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            {t('loginTitle')}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('loginSubtitle')}
          </p>
        </div>

        {resetSuccess && (
          <Alert variant="success" role="status" className="mb-4">
            {t('resetPasswordSuccess')}
          </Alert>
        )}

        <LoginForm locale={params.locale} redirectTo={redirectTo} />

        <div className="my-6 flex items-center gap-3">
          <hr className="flex-1 border-card-border" />
          <span className="text-xs text-muted-foreground">
            {t('orContinueWith')}
          </span>
          <hr className="flex-1 border-card-border" />
        </div>

        <GoogleLoginButton mode="login" />

        {/* Register link */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t('noAccount')}{' '}
          <Link
            href={`/${params.locale}/register` as never}
            className="font-medium text-primary hover:text-primary-hover transition-colors"
          >
            {t('signUpLink')}
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
