'use client';

import { useState } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';

// Define Learning type locally to avoid import issues
interface Learning {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const mockLearnings: Learning[] = [
  {
    id: '1',
    title: 'React Server Components',
    content: 'Learned about the new React Server Components pattern. Allows rendering components on the server and sending minimal JavaScript to the browser. Great for performance optimization and reducing client-side bundle size.',
    tags: ['react', 'performance'],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '2',
    title: 'TypeScript Generics',
    content: 'Deep dive into TypeScript generics. Understanding how to write reusable components and functions with type safety. Key concepts: constraints, default types, and conditional types. Really useful for building scalable libraries.',
    tags: ['typescript', 'programming'],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: '3',
    title: 'CSS Grid Layout',
    content: 'Mastered CSS Grid for complex layouts. Learned about grid areas, auto-placement, and responsive design patterns. Much more powerful than flexbox for 2D layouts. Great for creating magazine-style designs.',
    tags: ['css', 'design'],
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 345600000).toISOString(),
  },
  {
    id: '4',
    title: 'Next.js 16 Updates',
    content: 'Explored Next.js 16 new features including Turbopack, React Compiler support, and improved caching APIs. The revalidateTag() now requires cacheLife profile for SWR behavior. Significant performance improvements.',
    tags: ['nextjs', 'fullstack'],
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    updatedAt: new Date(Date.now() - 432000000).toISOString(),
  },
  {
    id: '5',
    title: 'Database Optimization',
    content: 'Studied database query optimization techniques. Index strategies, query planning, and N+1 problem prevention. Learned about connection pooling with Neon and query performance monitoring tools.',
    tags: ['database', 'backend'],
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    updatedAt: new Date(Date.now() - 604800000).toISOString(),
  },
];

export default function DemoPage() {
  const [mode, setMode] = useState<'dark' | 'light'>('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');

  const filteredLearnings = mockLearnings.filter((learning) =>
    learning.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    learning.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    learning.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const SORT_OPTIONS = [
    { value: 'createdAt:DESC', label: 'Mais Recentes' },
    { value: 'createdAt:ASC', label: 'Mais Antigos' },
    { value: 'updatedAt:DESC', label: 'Recentemente Atualizados' },
    { value: 'updatedAt:ASC', label: 'Atualizados Primeiro' },
  ];

  const currentSortValue = `${sortBy}:${sortDirection}`;

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const [newSortBy, newSortDirection] = value.split(':') as ['createdAt' | 'updatedAt', 'ASC' | 'DESC'];
    setSortBy(newSortBy);
    setSortDirection(newSortDirection);
  };

  function formatDate(date: Date): string {
    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    return `${day} de ${month}`;
  }

  function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'agora mesmo';
    if (diffMins < 60) return `há ${diffMins}m`;
    if (diffHours < 24) return `há ${diffHours}h`;
    if (diffDays < 7) return `há ${diffDays}d`;
    if (diffDays < 30) return `há ${Math.floor(diffDays / 7)}s`;
    if (diffDays < 365) return `há ${Math.floor(diffDays / 30)}m`;
    return `há ${Math.floor(diffDays / 365)}a`;
  }

  return (
    <div className={mode === 'dark' ? 'dark' : ''}>
      <div className={`min-h-screen ${mode === 'dark' ? 'bg-deep-navy text-parchment' : 'bg-slate-100 text-ink'}`}>
        {/* Demo Controls - barra de preview, nao faz parte do design real do app */}
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="mx-auto max-w-6xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-mono font-medium text-slate-500 uppercase tracking-wider">
                preview
              </span>
              <span className="text-sm text-slate-500">Learning Feed</span>
            </div>

            {/* Icone sol/lua - apenas para alternar o tema no preview */}
            <button
              onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700"
              aria-label={mode === 'dark' ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
            >
              {mode === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Preview Container */}
        <div className="p-4 sm:p-8">
          <div className={`mx-auto max-w-4xl rounded-lg shadow-2xl overflow-hidden border ${
            mode === 'light'
              ? 'bg-parchment border-slate-200'
              : 'bg-deep-navy border-mid-blue'
          }`}>
            {/* TopNav - Inline */}
            <nav className={`border-b backdrop-blur-sm ${
              mode === 'light'
                ? 'border-slate-200 bg-white/80'
                : 'border-mid-blue bg-primary-blue/30'
            }`}>
              <div className="mx-auto max-w-4xl px-4 py-4">
                <div className="flex items-center justify-between">
                  {/* Wordmark */}
                  <div className="font-wordmark text-xl font-semibold">
                    <span className={`wordmark-regular ${mode === 'light' ? 'text-ink' : 'text-parchment'}`}>learn</span>
                    <span className="wordmark-bold text-ember-cta">imo</span>
                  </div>

                  {/* User Avatar */}
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ember-cta/20">
                    <span className="text-sm font-semibold text-ember-cta">L</span>
                  </div>
                </div>
              </div>
            </nav>

            <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
              {/* PageHeader - Inline */}
              <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className={`text-3xl font-heading font-semibold ${mode === 'light' ? 'text-ink' : 'text-parchment'}`}>
                    Meus Aprendizados
                  </h2>
                  <p className={`mt-1 text-sm ${mode === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                    42 aprendizados
                  </p>
                </div>

                <button className="inline-flex items-center gap-2 rounded-md bg-ember-cta px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-ember-cta/90 active:scale-95 shadow-lg hover:shadow-xl">
                  <Plus className="h-4 w-4" />
                  <span>Novo Aprendizado</span>
                </button>
              </div>

              {/* SearchSortToolbar - Inline */}
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className={`h-4 w-4 ${mode === 'light' ? 'text-slate-400' : 'text-slate-500'}`} />
                  </div>
                  <input
                    type="text"
                    placeholder="Pesquisar seus aprendizados..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full rounded-md border pl-9 pr-3 py-2 text-sm transition-colors focus:outline-none ${
                      mode === 'light'
                        ? 'border-slate-300 bg-white text-ink placeholder:text-slate-400 focus:border-ember-cta'
                        : 'border-mid-blue bg-deep-navy text-parchment placeholder:text-slate-500 focus:border-ember-cta'
                    }`}
                    aria-label="Pesquisar aprendizados"
                  />
                </div>

                {/* Sort Dropdown */}
                <select
                  value={currentSortValue}
                  onChange={handleSortChange}
                  className={`rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none ${
                    mode === 'light'
                      ? 'border-slate-300 bg-white text-ink focus:border-ember-cta'
                      : 'border-mid-blue bg-deep-navy text-parchment focus:border-ember-cta'
                  }`}
                  aria-label="Ordenar aprendizados"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* Clear Search Button */}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="rounded-md border border-ember-cta bg-transparent px-3 py-2 text-sm font-medium text-ember-cta transition-colors hover:bg-ember-cta/10"
                  >
                    Limpar
                  </button>
                )}
              </div>

              {/* Learning Cards - Inline */}
              <div className="mt-8">
                {filteredLearnings.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {filteredLearnings.map((learning) => (
                        <div
                          key={learning.id}
                          className={`group rounded-md border p-4 transition-all duration-150 ease-out hover:shadow-sm ${
                            mode === 'light'
                              ? 'border-slate-200 bg-white hover:border-slate-300'
                              : 'border-mid-blue bg-primary-blue hover:shadow-md'
                          }`}
                        >
                          {/* Title */}
                          <h3 className={`font-heading text-lg font-semibold line-clamp-2 ${
                            mode === 'light' ? 'text-ink' : 'text-parchment'
                          }`}>
                            {learning.title}
                          </h3>

                          {/* Content Preview */}
                          <p className={`mt-2 text-sm line-clamp-2 ${
                            mode === 'light' ? 'text-slate-600' : 'text-slate-400'
                          }`}>
                            {learning.content}
                          </p>

                          {/* Tags */}
                          {learning.tags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {learning.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                                    mode === 'light'
                                      ? 'bg-slate-100 text-slate-600'
                                      : 'bg-mid-blue text-blue-200'
                                  }`}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Timestamps */}
                          <div className={`mt-3 flex flex-wrap gap-2 text-xs ${
                            mode === 'light' ? 'text-slate-500' : 'text-slate-400'
                          }`}>
                            <span>Criado {formatDate(new Date(learning.createdAt))}</span>
                            <span>·</span>
                            <span>Atualizado {formatRelativeTime(new Date(learning.updatedAt))}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination - Inline */}
                    <div className="mt-8 flex justify-center">
                      <div className="flex items-center gap-2">
                        <button
                          disabled
                          className={`flex h-9 w-9 items-center justify-center rounded-md border opacity-50 ${
                            mode === 'light'
                              ? 'border-slate-300 bg-white text-ink'
                              : 'border-mid-blue bg-deep-navy text-parchment'
                          }`}
                          aria-label="Pagina anterior"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>

                        <span className={`px-3 py-1 text-sm ${mode === 'light' ? 'text-ink' : 'text-parchment'}`}>
                          Pagina 1 de 1
                        </span>

                        <button
                          disabled
                          className={`flex h-9 w-9 items-center justify-center rounded-md border opacity-50 ${
                            mode === 'light'
                              ? 'border-slate-300 bg-white text-ink'
                              : 'border-mid-blue bg-deep-navy text-parchment'
                          }`}
                          aria-label="Proxima pagina"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Search className={`mx-auto h-12 w-12 ${mode === 'light' ? 'text-slate-400' : 'text-slate-500'}`} />
                    <h3 className={`mt-4 font-heading text-lg font-semibold ${mode === 'light' ? 'text-ink' : 'text-parchment'}`}>
                      Nenhum resultado encontrado
                    </h3>
                    <p className={`mt-2 text-sm ${mode === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                      Nao encontramos aprendizados que correspondam a "{searchQuery}"
                    </p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-4 rounded-md border border-ember-cta bg-transparent px-4 py-2 text-sm font-medium text-ember-cta transition-colors hover:bg-ember-cta/10"
                    >
                      Limpar pesquisa
                    </button>
                  </div>
                )}
              </div>
            </main>
          </div>

          {/* Info Footer */}
          <div className={`mx-auto max-w-4xl mt-8 text-center text-sm ${mode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
            <p>Este e um preview do design. Use os controles acima para alternar entre os modos.</p>
            <p className="mt-2 text-xs">Dados sao ficticios e apenas para demonstracao visual.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
