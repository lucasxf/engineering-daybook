import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from '@/lib/i18n';

/**
 * Public paths that don't require authentication.
 * Auth protection is handled client-side via AuthContext (since tokens are
 * stored in memory and not available to the middleware). This middleware
 * only handles i18n locale routing.
 *
 * Client-side protection in AuthContext redirects unauthenticated users
 * when they try to access protected routes.
 */
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export default function middleware(request: NextRequest) {
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(en|pt-BR)/:path*'],
};
