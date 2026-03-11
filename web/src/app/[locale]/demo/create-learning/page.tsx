'use client';

/**
 * DEMO PAGE - DO NOT INCLUDE IN PR
 * Navigate to /en/demo/create-learning or /pt-BR/demo/create-learning
 * to preview the Create Learning form redesign.
 */

import { CreateLearningForm } from '@/components/learnings/CreateLearningForm';
import { LearningPageHeader } from '@/components/learnings/LearningPageHeader';
import { useParams } from 'next/navigation';

export default function DemoCreateLearningPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  const handleSubmit = async (data: { title: string; content: string }) => {
    // Simulate API call
    console.log('[DEMO] Form submitted:', data);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // In demo mode, we just log and show success
    return;
  };

  const handleCancel = () => {
    console.log('[DEMO] Form cancelled');
    alert('Cancel clicked - would navigate back to feed');
  };

  const handleSuccess = () => {
    console.log('[DEMO] Success callback triggered');
    alert('Success! In production, this would redirect to the feed.');
  };

  return (
    <div className="min-h-screen bg-background dark">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Demo banner */}
        <div className="mb-6 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
          <p className="text-sm font-medium text-amber-400">
            DEMO MODE - This page is for preview only. Do not include in PR.
          </p>
          <p className="mt-1 text-xs text-amber-400/70">
            Locale: {locale} | Route: /demo/create-learning
          </p>
        </div>

        {/* Page Header */}
        <LearningPageHeader locale={locale} />

        {/* Create Learning Form */}
        <div className="mt-6">
          <CreateLearningForm
            locale={locale}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onSuccess={handleSuccess}
          />
        </div>

        {/* Demo instructions */}
        <div className="mt-8 rounded-lg border border-mid-blue/30 bg-deep-navy/50 p-4">
          <h3 className="text-sm font-semibold text-parchment">Demo Features:</h3>
          <ul className="mt-2 space-y-1 text-xs text-slate-400">
            <li>- Auto-expanding textarea (type to see it grow)</li>
            <li>- Live character counters (title: 200 max, content: 50K max)</li>
            <li>- Submit button disabled until content is entered</li>
            <li>- Keyboard shortcuts: Cmd/Ctrl+Enter to submit, Escape to cancel</li>
            <li>- Try submitting to see loading state and success toast</li>
            <li>- Try exceeding character limits to see validation errors</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
