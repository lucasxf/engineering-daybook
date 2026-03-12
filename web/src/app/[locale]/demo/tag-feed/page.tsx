'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useLocale } from 'next-intl';
import { type Locale } from '@/lib/i18n';

// =============================================================================
// DEMO DATA
// =============================================================================

interface DemoLearning {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: { id: string; name: string }[];
  visibility: 'private' | 'public';
}

const createDemoData = (locale: Locale): DemoLearning[] => {
  const isEn = locale === 'en';
  return [
    {
      id: '1',
      title: isEn ? 'React Server Components' : 'Componentes de Servidor React',
      content: isEn
        ? 'RSCs allow you to render components on the server, reducing JS bundle size.'
        : 'RSCs permitem renderizar componentes no servidor, reduzindo o tamanho do bundle JS.',
      createdAt: '2026-03-10T10:00:00Z',
      updatedAt: '2026-03-10T10:00:00Z',
      tags: [
        { id: 't1', name: 'React' },
        { id: 't2', name: 'Performance' },
      ],
      visibility: 'private',
    },
    {
      id: '2',
      title: isEn ? 'TypeScript Generics' : 'Generics em TypeScript',
      content: isEn
        ? 'Generics provide type safety without sacrificing flexibility.'
        : 'Generics fornecem segurança de tipos sem sacrificar flexibilidade.',
      createdAt: '2026-03-09T14:30:00Z',
      updatedAt: '2026-03-11T08:00:00Z',
      tags: [{ id: 't3', name: 'TypeScript' }],
      visibility: 'private',
    },
    {
      id: '3',
      title: isEn ? 'CSS Container Queries' : 'Container Queries CSS',
      content: isEn
        ? 'Container queries let components respond to their container size, not viewport.'
        : 'Container queries permitem que componentes respondam ao tamanho do container, não da viewport.',
      createdAt: '2026-03-08T09:15:00Z',
      updatedAt: '2026-03-08T09:15:00Z',
      tags: [{ id: 't4', name: 'CSS' }],
      visibility: 'public',
    },
    {
      id: '4',
      title: isEn ? 'Untagged Learning Example' : 'Exemplo de Aprendizado Sem Etiqueta',
      content: isEn
        ? 'This learning has no tags yet — perfect for testing the untagged section.'
        : 'Este aprendizado ainda não tem etiquetas — perfeito para testar a seção sem etiquetas.',
      createdAt: '2026-03-07T16:45:00Z',
      updatedAt: '2026-03-07T16:45:00Z',
      tags: [],
      visibility: 'private',
    },
    {
      id: '5',
      title: isEn ? 'State Management Patterns' : 'Padrões de Gerenciamento de Estado',
      content: isEn
        ? 'Zustand is great for simple global state; React Query for server state.'
        : 'Zustand é ótimo para estado global simples; React Query para estado do servidor.',
      createdAt: '2026-03-06T11:20:00Z',
      updatedAt: '2026-03-12T09:00:00Z',
      tags: [
        { id: 't1', name: 'React' },
        { id: 't5', name: 'Architecture' },
      ],
      visibility: 'private',
    },
    {
      id: '6',
      title: isEn ? 'Tailwind JIT Mode' : 'Modo JIT do Tailwind',
      content: isEn
        ? 'JIT compiles only the classes you use, dramatically reducing CSS size.'
        : 'JIT compila apenas as classes que você usa, reduzindo drasticamente o tamanho do CSS.',
      createdAt: '2026-03-05T08:00:00Z',
      updatedAt: '2026-03-05T08:00:00Z',
      tags: [{ id: 't4', name: 'CSS' }],
      visibility: 'private',
    },
  ];
};

// =============================================================================
// STATE SELECTOR
// =============================================================================

type DemoState =
  | 'populated'
  | 'single-tag'
  | 'all-untagged'
  | 'loading'
  | 'empty'
  | 'no-results'
  | 'error';

interface StatePillProps {
  state: DemoState;
  currentState: DemoState;
  label: string;
  onClick: (state: DemoState) => void;
}

function StatePill({ state, currentState, label, onClick }: StatePillProps) {
  const isActive = state === currentState;
  return (
    <button
      type="button"
      onClick={() => onClick(state)}
      className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'bg-card text-foreground hover:bg-muted'
      }`}
    >
      {label}
    </button>
  );
}

// =============================================================================
// NAV COMPONENT
// =============================================================================

function DemoNav() {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();
  const locale = useLocale() as Locale;
  const [mounted, setMounted] = useState(false);

  useState(() => {
    setMounted(true);
  });

  const toggleLanguage = () => {
    const nextLocale = locale === 'en' ? 'pt-BR' : 'en';
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace(`/${locale}`, `/${nextLocale}`);
    window.location.href = newPath;
  };

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  return (
    <header className="sticky top-0 z-10 border-b border-nav-border bg-nav">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-foreground">learnimo</span>
          <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            DEMO
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLanguage}
            className="rounded px-2 py-1 text-sm text-muted-foreground hover:text-foreground"
            aria-label={locale === 'en' ? 'Switch to Português' : 'Switch to English'}
          >
            {locale === 'en' ? 'EN' : 'PT'}
          </button>
          {mounted && (
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded p-1 text-muted-foreground hover:text-foreground"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

// =============================================================================
// VIEW SWITCHER TABS
// =============================================================================

function ViewSwitcherTabs() {
  const t = useTranslations('poks.views');
  return (
    <div role="tablist" className="flex gap-6 border-b border-nav-border">
      <button
        type="button"
        role="tab"
        aria-selected="false"
        className="border-b-2 border-transparent pb-2 text-sm font-medium text-tab-inactive hover:text-foreground"
      >
        {t('feed')}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected="true"
        className="border-b-2 border-tab-active pb-2 text-sm font-semibold text-tab-active"
      >
        {t('tags')}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected="false"
        className="border-b-2 border-transparent pb-2 text-sm font-medium text-tab-inactive hover:text-foreground"
      >
        {t('timeline')}
      </button>
    </div>
  );
}

// =============================================================================
// SEARCH / SORT TOOLBAR
// =============================================================================

interface SearchSortToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortOption: 'newest' | 'oldest' | 'updated';
  onSortChange: (value: 'newest' | 'oldest' | 'updated') => void;
}

function SearchSortToolbar({
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
}: SearchSortToolbarProps) {
  const t = useTranslations('poks');

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 sm:max-w-xs">
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('search.placeholder')}
          className="w-full rounded-lg border border-input-border bg-input py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-input-focus focus:outline-none focus:ring-1 focus:ring-input-focus"
        />
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="sort-select" className="text-sm text-muted-foreground">
          {t('sort.label')}:
        </label>
        <select
          id="sort-select"
          value={sortOption}
          onChange={(e) => onSortChange(e.target.value as 'newest' | 'oldest' | 'updated')}
          className="rounded-lg border border-input-border bg-input px-3 py-1.5 text-sm text-foreground focus:border-input-focus focus:outline-none focus:ring-1 focus:ring-input-focus"
        >
          <option value="newest">{t('sort.newestFirst')}</option>
          <option value="oldest">{t('sort.oldestFirst')}</option>
          <option value="updated">{t('sort.recentlyUpdated')}</option>
        </select>
      </div>
    </div>
  );
}

// =============================================================================
// LEARNING CARD
// =============================================================================

interface LearningCardProps {
  learning: DemoLearning;
}

function LearningCard({ learning }: LearningCardProps) {
  const t = useTranslations('poks');
  const locale = useLocale() as Locale;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'pt-BR', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const wasUpdated = learning.updatedAt !== learning.createdAt;

  return (
    <article className="rounded-xl border border-card-border bg-card p-4 transition-shadow hover:shadow-md">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 font-semibold text-card-foreground">{learning.title}</h3>
        <span
          className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${
            learning.visibility === 'public'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
          }`}
        >
          {t(`visibility.${learning.visibility}`)}
        </span>
      </div>
      <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{learning.content}</p>
      {learning.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {learning.tags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full bg-chip px-2 py-0.5 text-xs font-medium text-chip-text"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>{formatDate(learning.createdAt)}</span>
        {wasUpdated && (
          <span className="italic">
            {t('feed.card.updatedAt', { relativeTime: formatDate(learning.updatedAt) })}
          </span>
        )}
      </div>
    </article>
  );
}

// =============================================================================
// TAG GROUP SECTION
// =============================================================================

interface TagGroupSectionProps {
  tagName: string;
  count: number;
  isUntagged?: boolean;
  children: React.ReactNode;
}

function TagGroupSection({ tagName, count, isUntagged = false, children }: TagGroupSectionProps) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center gap-3">
        <div
          className={`h-6 w-1 rounded-full ${isUntagged ? 'bg-tag-untagged' : 'bg-tag-accent'}`}
          aria-hidden="true"
        />
        <h2 className="text-lg font-semibold text-tag-header">{tagName}</h2>
        <span className="rounded-full bg-tag-count px-2 py-0.5 text-xs font-medium text-tag-count-text">
          {count}
        </span>
      </div>
      <div className="space-y-3 pl-4">{children}</div>
    </section>
  );
}

// =============================================================================
// SKELETON LOADER
// =============================================================================

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-card-border bg-card p-4">
      <div className="mb-3 h-5 w-3/4 rounded bg-gradient-to-r from-skeleton-from to-skeleton-to" />
      <div className="mb-2 h-4 w-full rounded bg-gradient-to-r from-skeleton-from to-skeleton-to" />
      <div className="mb-4 h-4 w-2/3 rounded bg-gradient-to-r from-skeleton-from to-skeleton-to" />
      <div className="flex gap-2">
        <div className="h-5 w-16 rounded-full bg-gradient-to-r from-skeleton-from to-skeleton-to" />
        <div className="h-5 w-20 rounded-full bg-gradient-to-r from-skeleton-from to-skeleton-to" />
      </div>
    </div>
  );
}

function TagFeedSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2].map((group) => (
        <section key={group} className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <div className="h-6 w-1 rounded-full bg-skeleton-from" />
            <div className="h-5 w-24 rounded bg-gradient-to-r from-skeleton-from to-skeleton-to" />
            <div className="h-5 w-6 rounded-full bg-gradient-to-r from-skeleton-from to-skeleton-to" />
          </div>
          <div className="space-y-3 pl-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </section>
      ))}
    </div>
  );
}

// =============================================================================
// EMPTY / ERROR / NO RESULTS STATES
// =============================================================================

function TagFeedEmpty() {
  const t = useTranslations('poks');
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <svg
        className="mb-4 h-16 w-16 text-muted-foreground opacity-50"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
      <h2 className="mb-2 text-lg font-semibold text-foreground">{t('feed.empty.title')}</h2>
      <p className="mb-4 max-w-sm text-sm text-muted-foreground">{t('feed.empty.hint')}</p>
      <button
        type="button"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
      >
        {t('feed.empty.button')}
      </button>
    </div>
  );
}

function TagFeedNoResults({ query }: { query: string }) {
  const t = useTranslations('poks');
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <svg
        className="mb-4 h-16 w-16 text-muted-foreground opacity-50"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <h2 className="mb-2 text-lg font-semibold text-foreground">{t('feed.noResults.title')}</h2>
      <p className="mb-4 max-w-sm text-sm text-muted-foreground">
        {t('feed.noResults.hint', { query })}
      </p>
    </div>
  );
}

function TagFeedError() {
  const t = useTranslations('poks');
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <svg
        className="mb-4 h-16 w-16 text-red-500 opacity-70"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <h2 className="mb-2 text-lg font-semibold text-foreground">{t('feed.error.title')}</h2>
      <p className="mb-4 max-w-sm text-sm text-muted-foreground">{t('feed.error.hint')}</p>
      <button
        type="button"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
      >
        {t('feed.error.retry')}
      </button>
    </div>
  );
}

// =============================================================================
// UNTAGGED NUDGE
// =============================================================================

function UntaggedNudge() {
  const t = useTranslations('poks.tagGroups');
  return (
    <p className="mt-2 pl-4 text-sm italic text-nudge">
      {t('nudge')}{' '}
      <a href="#" className="font-medium text-nudge-link hover:underline">
        {/* Link placeholder */}
      </a>
    </p>
  );
}

// =============================================================================
// MAIN DEMO PAGE
// =============================================================================

export default function TagFeedDemoPage() {
  const t = useTranslations();
  const locale = useLocale() as Locale;

  const [demoState, setDemoState] = useState<DemoState>('populated');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'updated'>('newest');

  const demoData = createDemoData(locale);

  // Group learnings by tag
  const groupByTags = (learnings: DemoLearning[]) => {
    const tagGroups: Record<string, DemoLearning[]> = {};
    const untagged: DemoLearning[] = [];

    learnings.forEach((learning) => {
      if (learning.tags.length === 0) {
        untagged.push(learning);
      } else {
        learning.tags.forEach((tag) => {
          if (!tagGroups[tag.name]) {
            tagGroups[tag.name] = [];
          }
          if (!tagGroups[tag.name].some((l) => l.id === learning.id)) {
            tagGroups[tag.name].push(learning);
          }
        });
      }
    });

    return { tagGroups, untagged };
  };

  // Filter by search
  const filterBySearch = (learnings: DemoLearning[], query: string) => {
    if (!query.trim()) return learnings;
    const lowerQuery = query.toLowerCase();
    return learnings.filter(
      (l) =>
        l.title.toLowerCase().includes(lowerQuery) ||
        l.content.toLowerCase().includes(lowerQuery) ||
        l.tags.some((tag) => tag.name.toLowerCase().includes(lowerQuery))
    );
  };

  // Sort learnings
  const sortLearnings = (
    learnings: DemoLearning[],
    option: 'newest' | 'oldest' | 'updated'
  ) => {
    return [...learnings].sort((a, b) => {
      if (option === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (option === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      // updated
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  };

  // Compute data based on state
  const getDataForState = () => {
    switch (demoState) {
      case 'single-tag':
        return demoData.filter((l) => l.tags.some((t) => t.name === 'React'));
      case 'all-untagged':
        return demoData.filter((l) => l.tags.length === 0);
      case 'empty':
      case 'loading':
      case 'error':
        return [];
      case 'no-results':
        return [];
      default:
        return demoData;
    }
  };

  const stateData = getDataForState();
  const filteredData = filterBySearch(stateData, demoState === 'no-results' ? 'xyznonexistent' : searchQuery);
  const sortedData = sortLearnings(filteredData, sortOption);
  const { tagGroups, untagged } = groupByTags(sortedData);

  const stateLabels: Record<DemoState, string> = {
    populated: locale === 'en' ? 'Populated' : 'Populado',
    'single-tag': locale === 'en' ? 'Single Tag' : 'Uma Etiqueta',
    'all-untagged': locale === 'en' ? 'All Untagged' : 'Todos Sem Etiqueta',
    loading: locale === 'en' ? 'Loading' : 'Carregando',
    empty: locale === 'en' ? 'Empty' : 'Vazio',
    'no-results': locale === 'en' ? 'No Results' : 'Sem Resultados',
    error: locale === 'en' ? 'Error' : 'Erro',
  };

  return (
    <div className="min-h-screen bg-background">
      <DemoNav />

      {/* State selector bar */}
      <div className="border-b border-nav-border bg-card/50 py-3">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-2 px-4">
          <span className="mr-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {locale === 'en' ? 'Demo State:' : 'Estado Demo:'}
          </span>
          {(Object.keys(stateLabels) as DemoState[]).map((state) => (
            <StatePill
              key={state}
              state={state}
              currentState={demoState}
              label={stateLabels[state]}
              onClick={setDemoState}
            />
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="mx-auto max-w-4xl px-4 py-6">
        {/* Page header */}
        <h1 className="mb-6 text-2xl font-bold text-foreground">{t('poks.list.title')}</h1>

        {/* View switcher */}
        <div className="mb-6">
          <ViewSwitcherTabs />
        </div>

        {/* Search and sort */}
        <div className="mb-6">
          <SearchSortToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortOption={sortOption}
            onSortChange={setSortOption}
          />
        </div>

        {/* Content based on state */}
        {demoState === 'loading' ? (
          <TagFeedSkeleton />
        ) : demoState === 'empty' ? (
          <TagFeedEmpty />
        ) : demoState === 'error' ? (
          <TagFeedError />
        ) : demoState === 'no-results' || (searchQuery && filteredData.length === 0) ? (
          <TagFeedNoResults query={searchQuery || 'xyznonexistent'} />
        ) : (
          <>
            {/* Tag groups */}
            {Object.entries(tagGroups).map(([tagName, learnings]) => (
              <TagGroupSection key={tagName} tagName={tagName} count={learnings.length}>
                {learnings.map((learning) => (
                  <LearningCard key={learning.id} learning={learning} />
                ))}
              </TagGroupSection>
            ))}

            {/* Untagged section */}
            {untagged.length > 0 && (
              <TagGroupSection
                tagName={t('poks.tagGroups.untagged')}
                count={untagged.length}
                isUntagged
              >
                {untagged.map((learning) => (
                  <LearningCard key={learning.id} learning={learning} />
                ))}
                <UntaggedNudge />
              </TagGroupSection>
            )}
          </>
        )}
      </main>
    </div>
  );
}
