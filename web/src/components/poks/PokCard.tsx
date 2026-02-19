import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Pok } from '@/lib/pokApi';

interface PokCardProps {
  pok: Pok;
}

/**
 * Card component for displaying a POK in list view.
 *
 * Features:
 * - Title as header if present, otherwise first 50 chars of content
 * - Content preview (first 100 chars)
 * - Formatted date (updatedAt)
 * - Clickable card linking to POK detail page
 *
 * @param pok the POK to display
 */
export function PokCard({ pok }: PokCardProps) {
  const params = useParams<{ locale: string }>();
  // Determine header: title if present, otherwise first 50 chars of content
  const header = pok.title && pok.title.trim()
    ? pok.title
    : truncate(pok.content, 50);

  // Content preview: first 100 chars
  const contentPreview = truncate(pok.content, 100);

  // Format date using the active locale
  const formattedDate = new Date(pok.updatedAt).toLocaleDateString(params.locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link
      href={`/${params.locale}/poks/${pok.id}` as never}
      className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    >
      <article>
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          {header}
        </h3>
        <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
          {contentPreview}
        </p>
        <time
          dateTime={pok.updatedAt}
          className="text-xs text-gray-500 dark:text-gray-500"
        >
          {formattedDate}
        </time>
      </article>
    </Link>
  );
}

/**
 * Truncates text to specified length with ellipsis.
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + '...';
}
