'use client';

import { useState, useEffect } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { ChooseHandleForm } from '@/components/auth/ChooseHandleForm';
import messages from '@/locales/en.json';

/**
 * DEMO PAGE - For preview purposes only
 * Shows the redesigned Choose Handle screen in isolation
 * Safe to delete - not tracked by Git
 */
export default function DemoChooseHandlePage() {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark, mounted]);

  if (!mounted) return null;

  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      <div className="min-h-screen bg-[#0F1B2D] dark:bg-[#0F1B2D] light:bg-[#F5F0E8] text-[#F5F0E8] dark:text-[#F5F0E8] light:text-[#1A1A2E] transition-colors">
        {/* Theme Toggle */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setIsDark(!isDark)}
            className="px-4 py-2 rounded-lg bg-[#D4854A] text-[#F5F0E8] dark:bg-[#D4854A] dark:text-[#F5F0E8] light:bg-[#D4854A] light:text-white font-medium text-sm hover:opacity-90 transition-opacity"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        {/* Content wrapper */}
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md">
            {/* Card container */}
            <div className="rounded-xl border bg-[#1A365D] dark:bg-[#1A365D] light:bg-white border-[#2B4A78] dark:border-[#2B4A78] light:border-[#E8E4DF] p-8 shadow-lg dark:shadow-lg light:shadow-md">
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
