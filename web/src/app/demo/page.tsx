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
    content: 'Learned about the new React Server Components pattern. Allows rendering components on the server and sending minimal JavaScript to the browser. Great for performance optimization.',
    tags: ['react', 'performance'],
    createdAt: '2024-01-14T10:00:00Z',
    updatedAt: '2024-01-14T10:00:00Z',
  },
  {
    id: '2',
    title: 'TypeScript Generics',
    content: 'Deep dive into TypeScript generics. Understanding how to write reusable components and functions with type safety. Key concepts: constraints, default types, and conditional types.',
    tags: ['typescript', 'programming'],
    createdAt: '2024-01-13T14:30:00Z',
    updatedAt: '2024-01-13T14:30:00Z',
  },
  {
    id: '3',
    title: 'CSS Grid Layout',
    content: 'Mastered CSS Grid for complex layouts. Learned about grid areas, auto-placement, and responsive design patterns. Much more powerful than flexbox for 2D layouts.',
    tags: ['css', 'design'],
    createdAt: '2024-01-12T09:15:00Z',
    updatedAt: '2024-01-11T15:45:00Z',
  },
];

export default function DemoPage() {
  const [mode, setMode] = useState<'dark' | 'light'>('dark');

  const mockUser = {
    name: 'Lucas',
    avatar: null,
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="mx-auto max-w-6xl px-4">
        {/* Mode Selector */}
        <div className="mb-8 flex justify-center gap-4">
          <button
            onClick={() => setMode('dark')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              mode === 'dark'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-900 border border-slate-200'
            }`}
          >
            Modo Escuro
          </button>
          <button
            onClick={() => setMode('light')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              mode === 'light'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-900 border border-slate-200'
            }`}
          >
            Modo Claro
          </button>
        </div>

        {/* Preview */}
        <div className={mode === 'dark' ? 'dark' : ''}>
          <div className="min-h-screen bg-background dark:bg-deep-navy rounded-lg shadow-xl overflow-hidden">
            <TopNav />

            <main className="mx-auto max-w-3xl px-4 py-8">
              <PageHeader
                totalCount={42}
                onNewLearning={() => {}}
              />

              <SearchSortToolbar
                keyword=""
                sortBy="createdAt"
                sortDirection="DESC"
                onSearch={() => {}}
                onSort={() => {}}
                onClearSearch={() => {}}
                isSearching={false}
              />

              <LearningCardList learnings={mockLearnings} />

              <PaginationControls
                currentPage={1}
                totalPages={5}
                onPageChange={() => {}}
              />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
