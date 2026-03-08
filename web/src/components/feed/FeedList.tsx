'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { ReLearningCard } from '@/components/poks/ReLearningCard';
import { stripMarkdown } from '@/lib/stripMarkdown';
import type { FeedItem, Pok } from '@/lib/pokApi';

interface FeedListProps {
  items: FeedItem[];
  onShareRemoved?: () => void;
}

/**
 * Renders a list of discovery feed items.
 *
 * Owned learnings are shown as author-attributed cards linking to the
 * author's profile and the learning's detail page.
 * Re-learnings are rendered using the existing {@link ReLearningCard}.
 */
export function FeedList({ items, onShareRemoved }: FeedListProps) {
  return (
    <ul className="space-y-4" aria-label="Discovery feed">
      {items.map((item) =>
        item.type === 'shared' ? (
          <li key={item.id}>
            <ReLearningCard share={item} isOwner={false} onRemoved={onShareRemoved} />
          </li>
        ) : (
          <li key={item.id}>
            <FeedPokCard pok={item} />
          </li>
        )
      )}
    </ul>
  );
}

interface FeedPokCardProps {
  pok: Pok & { type: 'owned' };
}

function FeedPokCard({ pok }: FeedPokCardProps) {
  const params = useParams<{ locale: string }>();

  const authorHandle = pok.authorHandle ?? '';
  const authorDisplayName = pok.authorDisplayName ?? pok.authorHandle ?? '';
  const header = pok.title?.trim() ? pok.title : truncate(pok.content, 60);
  const contentPreview = truncate(stripMarkdown(pok.content), 120);
  const formattedDate = new Date(pok.createdAt).toLocaleDateString(params.locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      className="group rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/60"
      aria-label={`Learning by @${authorHandle}: ${header}`}
    >
      {/* Author row */}
      <div className="flex items-center gap-3 px-4 pt-3">
        <Link href={`/${params.locale}/learners/${authorHandle}` as never}>
          <Avatar
            avatarUrl={pok.authorAvatarUrl}
            displayName={authorDisplayName}
            handle={authorHandle}
            size={32}
          />
        </Link>
        <Link
          href={`/${params.locale}/learners/${authorHandle}` as never}
          className="text-sm font-medium text-slate-700 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400"
        >
          {authorDisplayName || `@${authorHandle}`}
        </Link>
      </div>

      {/* Content */}
      <Link href={`/${params.locale}/poks/${pok.id}` as never} className="block px-4 pb-4 pt-2">
        <article>
          <h3 className="mb-1 text-base font-semibold text-slate-900 transition-colors group-hover:text-primary-600 dark:text-slate-100 dark:group-hover:text-primary-400">
            {header}
          </h3>
          <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">{contentPreview}</p>
          <time dateTime={pok.createdAt} className="text-xs text-slate-500 dark:text-slate-500">
            {formattedDate}
          </time>
        </article>
      </Link>
    </div>
  );
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : text.slice(0, max) + '…';
}
