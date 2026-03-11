'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { ChooseHandleForm } from '@/components/auth/ChooseHandleForm';
import messages from '@/locales/en.json';

/**
 * DEMO PAGE - For preview purposes only
 * Shows the redesigned Choose Handle screen in isolation
 * Safe to delete - not tracked by Git
 */
export default function DemoChooseHandlePage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      <div className="min-h-screen bg-[#0F1B2D] dark:bg-[#0F1B2D] text-[#F5F0E8] dark:text-[#F5F0E8] transition-colors"
           style={!isDark ? { backgroundColor: '#F5F0E8', color: '#1A1A2E' } : {}}>
        {/* Theme Toggle */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="px-4 py-2 rounded-lg bg-[#D4854A] text-[#F5F0E8] font-medium text-sm hover:opacity-90 transition-opacity active:scale-95"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        {/* Content wrapper */}
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md">
            {/* Card container */}
            <div className="rounded-xl border bg-[#1A365D] dark:bg-[#1A365D] border-[#2B4A78] dark:border-[#2B4A78] p-8 shadow-lg dark:shadow-lg"
                 style={!isDark ? { backgroundColor: 'white', borderColor: '#E8E4DF' } : {}}>
              <ChooseHandleForm
                tempToken="demo-token"
              />
            </div>
          </div>
        </div>
      </div>
    </NextIntlClientProvider>
  );
}


