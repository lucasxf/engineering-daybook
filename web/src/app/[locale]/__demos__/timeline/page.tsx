'use client';

import { Suspense, useState, useMemo, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

// ─────────────────────────────────────────────────────────────────────────────
// DEMO-ONLY TYPES AND DATA — easy to delete before PR
// ─────────────────────────────────────────────────────────────────────────────

type DemoState =
  | 'populated'
  | 'single-month'
  | 'loading'
  | 'empty'
  | 'no-results'
  | 'error';

interface LearningItem {
  id: string;
  title: string | null;
  content: string;
  createdAt: Date;
  tags: string[];
}

interface MonthGroup {
  key: string;
  label: string;
  items: LearningItem[];
}

function generateMockData(locale: string): MonthGroup[] {
  const isPortuguese = locale === 'pt-BR';

  const items: LearningItem[] = [
    {
      id: '1',
      title: isPortuguese ? 'Closures em JavaScript' : 'JavaScript Closures',
      content: isPortuguese
        ? 'Closures permitem que funções internas acessem variáveis do escopo externo mesmo após a função externa ter terminado.'
        : 'Closures allow inner functions to access outer scope variables even after the outer function has finished.',
      createdAt: new Date('2026-03-10'),
      tags: ['javascript', 'programming'],
    },
    {
      id: '2',
      title: null,
      content: isPortuguese
        ? 'Promise.allSettled() retorna todas as promessas, rejeitadas ou resolvidas — diferente de Promise.all() que para no primeiro erro.'
        : 'Promise.allSettled() returns all promises, rejected or resolved — unlike Promise.all() which stops at first error.',
      createdAt: new Date('2026-03-08'),
      tags: ['javascript', 'async'],
    },
    {
      id: '3',
      title: isPortuguese ? 'Modelo Mental do Git' : 'Git Mental Model',
      content: isPortuguese
        ? 'Git pensa em dados como uma série de snapshots de um sistema de arquivos em miniatura, não como diffs.'
        : 'Git thinks of data as a series of snapshots of a miniature filesystem, not as diffs.',
      createdAt: new Date('2026-03-05'),
      tags: ['git', 'devtools'],
    },
    {
      id: '4',
      title: isPortuguese ? 'CSS Container Queries' : 'CSS Container Queries',
      content: isPortuguese
        ? 'Container queries permitem estilizar componentes baseado no tamanho do container pai, não do viewport.'
        : 'Container queries allow styling components based on parent container size, not viewport.',
      createdAt: new Date('2026-02-20'),
      tags: ['css', 'frontend'],
    },
    {
      id: '5',
      title: null,
      content: isPortuguese
        ? 'useCallback e useMemo servem para otimização de performance — não use prematuramente.'
        : 'useCallback and useMemo are for performance optimization — don\'t use prematurely.',
      createdAt: new Date('2026-02-15'),
      tags: ['react', 'performance'],
    },
    {
      id: '6',
      title: isPortuguese ? 'Indexação de Banco de Dados' : 'Database Indexing',
      content: isPortuguese
        ? 'Índices B-tree são excelentes para comparações de igualdade e range queries, mas adicionam overhead na escrita.'
        : 'B-tree indexes are great for equality comparisons and range queries, but add write overhead.',
      createdAt: new Date('2026-02-10'),
      tags: ['database', 'postgresql'],
    },
    {
      id: '7',
      title: isPortuguese ? 'Princípio da Inversão de Dependência' : 'Dependency Inversion Principle',
      content: isPortuguese
        ? 'Módulos de alto nível não devem depender de módulos de baixo nível. Ambos devem depender de abstrações.'
        : 'High-level modules should not depend on low-level modules. Both should depend on abstractions.',
      createdAt: new Date('2026-01-28'),
      tags: ['architecture', 'solid'],
    },
    {
      id: '8',
      title: null,
      content: isPortuguese
        ? 'O método reduce() é incrivelmente versátil — pode implementar map, filter e muito mais.'
        : 'The reduce() method is incredibly versatile — can implement map, filter, and much more.',
      createdAt: new Date('2026-01-20'),
      tags: ['javascript', 'functional'],
    },
  ];

  // Group by month
  const groups: Map<string, LearningItem[]> = new Map();
  items.forEach((item) => {
    const date = item.createdAt;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  });

  const monthNames = isPortuguese
    ? ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return Array.from(groups.entries())
    .map(([key, groupItems]) => {
      const [year, month] = key.split('-');
      return {
        key,
        label: `${monthNames[parseInt(month, 10) - 1]} ${year}`,
        items: groupItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
      };
    })
    .sort((a, b) => b.key.localeCompare(a.key));
}

// ─────────────────────────────────────────────────────────────────────────────
// DEMO COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function DemoStatePicker({
  value,
  onChange,
}: {
  value: DemoState;
  onChange: (v: DemoState) => void;
}) {
  const t = useTranslations();
  const states: { key: DemoState; labelEn: string; labelPt: string }[] = [
    { key: 'populated', labelEn: 'Populated', labelPt: 'Populado' },
    { key: 'single-month', labelEn: 'Single Month', labelPt: 'Mês único' },
    { key: 'loading', labelEn: 'Loading', labelPt: 'Carregando' },
    { key: 'empty', labelEn: 'Empty', labelPt: 'Vazio' },
    { key: 'no-results', labelEn: 'No Results', labelPt: 'Sem resultados' },
    { key: 'error', labelEn: 'Error', labelPt: 'Erro' },
  ];
  const locale = useLocale();
  const isPt = locale === 'pt-BR';

  return (
    <div className="flex flex-wrap gap-2">
      {states.map((s) => (
        <button
          key={s.key}
          onClick={() => onChange(s.key)}
          className={cn(
            'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
            value === s.key
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          {isPt ? s.labelPt : s.labelEn}
        </button>
      ))}
    </div>
  );
}

function LearningCard({ item }: { item: LearningItem }) {
  const locale = useLocale();
  const formattedDate = item.createdAt.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
  });

  return (
    <Card className="p-4 card-hover">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {item.title && (
            <h3 className="mb-1 truncate font-semibold text-foreground">
              {item.title}
            </h3>
          )}
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {item.content}
          </p>
          {item.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <time className="shrink-0 text-xs text-muted-foreground">
          {formattedDate}
        </time>
      </div>
    </Card>
  );
}

function MonthSection({ group }: { group: MonthGroup }) {
  return (
    <section aria-labelledby={`month-${group.key}`}>
      <div className="mb-4 flex items-center gap-3">
        <h2
          id={`month-${group.key}`}
          className="shrink-0 font-heading text-lg font-semibold text-foreground"
        >
          {group.label}
        </h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {group.items.length}
        </span>
        <hr className="flex-1 border-border" />
      </div>
      <div className="flex flex-col gap-3">
        {group.items.map((item) => (
          <LearningCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

function TimelineSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2].map((g) => (
        <div key={g}>
          <div className="mb-4 flex items-center gap-3">
            <div className="h-6 w-32 animate-pulse rounded bg-muted" />
            <div className="h-5 w-8 animate-pulse rounded-full bg-muted" />
            <hr className="flex-1 border-border" />
          </div>
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((c) => (
              <Card key={c} className="p-4">
                <div className="space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-full animate-pulse rounded bg-muted" />
                  <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  const t = useTranslations('poks');
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <svg
          className="h-8 w-8 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      </div>
      <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">
        {t('feed.empty.title')}
      </h3>
      <p className="mb-4 max-w-sm text-sm text-muted-foreground">
        {t('feed.empty.hint')}
      </p>
      <Button>{t('feed.empty.button')}</Button>
    </div>
  );
}

function NoResultsState({ keyword, onClear }: { keyword: string; onClear: () => void }) {
  const t = useTranslations('poks');
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <svg
          className="h-8 w-8 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      </div>
      <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">
        {t('feed.noResults.title')}
      </h3>
      <p className="mb-4 max-w-sm text-sm text-muted-foreground">
        {t('feed.noResults.hint', { query: keyword })}
      </p>
      <Button variant="secondary" onClick={onClear}>
        {t('feed.noResults.clearSearch')}
      </Button>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations('poks');
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive-background">
        <svg
          className="h-8 w-8 text-destructive"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>
      <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">
        {t('feed.error.title')}
      </h3>
      <p className="mb-4 max-w-sm text-sm text-muted-foreground">
        {t('feed.error.hint')}
      </p>
      <Button onClick={onRetry}>{t('feed.error.retry')}</Button>
    </div>
  );
}

function SearchSortToolbar({
  keyword,
  onKeywordChange,
  sortBy,
  onSortChange,
}: {
  keyword: string;
  onKeywordChange: (v: string) => void;
  sortBy: 'newest' | 'oldest';
  onSortChange: (v: 'newest' | 'oldest') => void;
}) {
  const t = useTranslations('poks');
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 sm:max-w-md">
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
        <input
          type="text"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder={t('search.placeholder')}
          className="h-10 w-full rounded-md border border-input-border bg-input pl-10 pr-4 text-sm text-foreground placeholder:text-input-placeholder focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground">{t('sort.label')}</label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as 'newest' | 'oldest')}
          className="h-10 rounded-md border border-input-border bg-input px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="newest">{t('sort.newestFirst')}</option>
          <option value="oldest">{t('sort.oldestFirst')}</option>
        </select>
      </div>
    </div>
  );
}

function ViewSwitcher() {
  const t = useTranslations('poks');
  const tabs = [
    { key: 'feed', label: t('views.feed') },
    { key: 'tags', label: t('views.tags') },
    { key: 'timeline', label: t('views.timeline') },
  ];

  return (
    <div className="mb-4 flex gap-1 rounded-lg bg-muted p-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={cn(
            'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            tab.key === 'timeline'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DEMO SCREEN
// ─────────────────────────────────────────────────────────────────────────────

function TimelineDemoContent() {
  const t = useTranslations('poks');
  const locale = useLocale();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [demoState, setDemoState] = useState<DemoState>('populated');

  // For no-results demo
  const initialKeyword = demoState === 'no-results' ? 'quantum entanglement' : '';
  const [keyword, setKeyword] = useState(initialKeyword);
  const [debouncedKeyword, setDebouncedKeyword] = useState(initialKeyword);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset keyword when demoState changes
  useEffect(() => {
    const kw = demoState === 'no-results' ? 'quantum entanglement' : '';
    setKeyword(kw);
    setDebouncedKeyword(kw);
  }, [demoState]);

  // Debounce keyword
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [keyword]);

  const allGroups = useMemo(() => generateMockData(locale), [locale]);
  const singleMonthGroup = useMemo(() => (allGroups.length > 0 ? [allGroups[0]] : []), [allGroups]);

  const sourceGroups = useMemo(() => {
    if (demoState === 'single-month') return singleMonthGroup;
    if (demoState === 'loading' || demoState === 'empty' || demoState === 'error') return [];
    return allGroups;
  }, [demoState, allGroups, singleMonthGroup]);

  const filteredGroups = useMemo(() => {
    if (!debouncedKeyword.trim()) return sourceGroups;
    const lowerKw = debouncedKeyword.toLowerCase();
    return sourceGroups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (item) =>
            (item.title?.toLowerCase().includes(lowerKw) ?? false) ||
            item.content.toLowerCase().includes(lowerKw) ||
            item.tags.some((tag) => tag.toLowerCase().includes(lowerKw))
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [sourceGroups, debouncedKeyword]);

  const sortedGroups = useMemo(() => {
    const sorted = [...filteredGroups];
    if (sortBy === 'oldest') sorted.reverse();
    return sorted;
  }, [filteredGroups, sortBy]);

  const isNoResults = demoState !== 'loading' && demoState !== 'error' && demoState !== 'empty' && sortedGroups.length === 0 && debouncedKeyword.trim();
  const isEmpty = demoState === 'empty' || (sortedGroups.length === 0 && !debouncedKeyword.trim() && demoState !== 'loading' && demoState !== 'error');
  const isError = demoState === 'error';
  const isLoading = demoState === 'loading';

  return (
    <div className="mx-auto max-w-4xl">
      {/* Demo controls */}
      <div className="mb-8 rounded-lg border border-warning/50 bg-warning/10 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-warning">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          {locale === 'pt-BR' ? 'Controles de Demo (remover antes do PR)' : 'Demo Controls (remove before PR)'}
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 text-xs text-muted-foreground">
              {locale === 'pt-BR' ? 'Estado da UI:' : 'UI State:'}
            </div>
            <DemoStatePicker value={demoState} onChange={setDemoState} />
          </div>
          {mounted && (
            <div>
              <div className="mb-2 text-xs text-muted-foreground">
                {locale === 'pt-BR' ? 'Tema:' : 'Theme:'}
              </div>
              <div className="flex gap-2">
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                      theme === t
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline screen */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{t('timeline.title')}</h1>
      </div>

      <ViewSwitcher />

      <SearchSortToolbar
        keyword={keyword}
        onKeywordChange={setKeyword}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {isLoading ? (
        <TimelineSkeleton />
      ) : isError ? (
        <ErrorState onRetry={() => setDemoState('populated')} />
      ) : isEmpty ? (
        <EmptyState />
      ) : isNoResults ? (
        <NoResultsState keyword={debouncedKeyword} onClear={() => setKeyword('')} />
      ) : (
        <div className="space-y-8">
          {sortedGroups.map((group) => (
            <MonthSection key={group.key} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TimelineDemoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <TimelineDemoContent />
    </Suspense>
  );
}
