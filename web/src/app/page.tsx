import { redirect } from 'next/navigation';
import { defaultLocale } from '@/lib/i18n';

/**
 * Root page redirects to default locale.
 */
export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
