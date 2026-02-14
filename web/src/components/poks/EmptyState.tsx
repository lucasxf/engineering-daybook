import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

/**
 * Empty state component shown when user has no POKs.
 *
 * Features:
 * - Message: "No POKs yet. Create your first one!"
 * - CTA button linking to /poks/new
 * - Centered layout with icon
 */
export function EmptyState() {
  const t = useTranslations('poks.emptyState');
  const params = useParams<{ locale: string }>();

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
      <svg
        className="mb-4 h-16 w-16 text-gray-400 dark:text-gray-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <p className="mb-4 text-lg text-gray-600 dark:text-gray-400">
        {t('message')}
      </p>
      <Link
        href={`/${params.locale}/poks/new` as never}
        className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        {t('cta')}
      </Link>
    </div>
  );
}
