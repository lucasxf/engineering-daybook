import Link from 'next/link';
import { Button } from '@/components/ui/Button';

/**
 * Custom 404 page.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen animate-fadeIn flex-col items-center justify-center">
      <h1 className="mb-4 text-6xl font-bold text-slate-900 dark:text-slate-100">404</h1>
      <p className="mb-8 text-xl text-slate-500 dark:text-slate-400">
        Page not found
      </p>
      <Link href="/">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}
