'use client';

import { NextIntlClientProvider } from 'next-intl';
import { ChooseHandleForm } from '@/components/auth/ChooseHandleForm';
import messages from '@/locales/en.json';

/**
 * DEMO PAGE - For preview purposes only
 * Shows the redesigned Choose Handle screen in isolation
 * Safe to delete - not tracked by Git
 */
export default function DemoChooseHandlePage() {
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      <div className="min-h-screen bg-[#0F1B2D]">
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
