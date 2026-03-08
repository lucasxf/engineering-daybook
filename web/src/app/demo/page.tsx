'use client';

import { useState } from 'react';
import TopNav from '@/components/learning-feed/TopNav';
import PageHeader from '@/components/learning-feed/PageHeader';
import SearchSortToolbar from '@/components/learning-feed/SearchSortToolbar';
import LearningCardList from '@/components/learning-feed/LearningCardList';
import PaginationControls from '@/components/learning-feed/PaginationControls';
import { Learning } from '@/app/(authenticated)/learning-feed/page';

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

  return (
    <div className={mode === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-background text-foreground dark:bg-deep-navy dark:text-parchment">
        {/* Demo Controls */}
        <div className="border-b border-border bg-parchment dark:border-mid-blue dark:bg-primary-blue px-4 py-4">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-lg font-heading font-semibold dark:text-parchment">
                  Preview - Learning Feed
                </h1>
                <p className="text-sm text-muted-foreground mt-1 dark:text-muted">
                  Visualize o design em modo escuro e claro
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('dark')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    mode === 'dark'
                      ? 'bg-primary-blue text-parchment dark:bg-mid-blue dark:text-parchment'
                      : 'bg-white text-primary-blue border border-border dark:bg-deep-navy dark:text-parchment dark:border-mid-blue'
                  }`}
                >
                  Escuro
                </button>
                <button
                  onClick={() => setMode('light')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    mode === 'light'
                      ? 'bg-primary-blue text-white border border-primary-blue'
                      : 'bg-parchment text-primary-blue border border-border dark:bg-deep-navy dark:text-parchment dark:border-mid-blue'
                  }`}
                >
                  Claro
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Container */}
        <div className="p-4 sm:p-8">
          <div className={`mx-auto max-w-4xl rounded-lg shadow-2xl overflow-hidden border ${
            mode === 'light'
              ? 'bg-parchment border-border'
              : 'bg-deep-navy border-mid-blue dark:border-mid-blue'
          }`}>
            {/* Screen Content */}
            <TopNav />

            <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
              <PageHeader
                totalCount={42}
                onNewLearning={() => console.log('Novo aprendizado')}
              />

              <div className="mt-8">
                <SearchSortToolbar
                  keyword={searchQuery}
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  onSearch={(query) => setSearchQuery(query)}
                  onSort={(by, direction) => {
                    setSortBy(by);
                    setSortDirection(direction);
                  }}
                  onClearSearch={() => setSearchQuery('')}
                  isSearching={false}
                />
              </div>

              <div className="mt-8">
                {filteredLearnings.length > 0 ? (
                  <>
                    <LearningCardList learnings={filteredLearnings} />
                    <div className="mt-8 flex justify-center">
                      <PaginationControls
                        currentPage={1}
                        totalPages={1}
                        onPageChange={() => {}}
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      Nenhum aprendizado encontrado para "{searchQuery}"
                    </p>
                  </div>
                )}
              </div>
            </main>
          </div>

          {/* Info Footer */}
          <div className="mx-auto max-w-4xl mt-8 text-center text-sm text-muted-foreground dark:text-muted">
            <p>Este é um preview do design. Use os controles acima para alternar entre os modos.</p>
            <p className="mt-2 text-xs">Dados são fictícios e apenas para demonstração visual.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
