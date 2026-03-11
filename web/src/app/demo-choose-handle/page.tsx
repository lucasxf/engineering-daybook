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
      <div className="min-h-screen bg-background text-foreground transition-colors">
        {/* Theme Toggle */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setIsDark(!isDark)}
            className="px-4 py-2 rounded-lg bg-accent text-accent-foreground font-medium text-sm hover:opacity-90 transition-opacity"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        {/* Content */}
        <ChooseHandleForm
          email="user@example.com"
          displayName="Example User"
          onSuccess={() => {
            console.log('[Demo] Registration would complete here');
          }}
        />
      </div>
    </NextIntlClientProvider>
  );
}
