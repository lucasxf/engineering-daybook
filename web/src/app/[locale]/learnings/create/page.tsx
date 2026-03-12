'use client';

import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CreateLearningForm } from '@/components/learnings/CreateLearningForm';
import { LearningPageHeader } from '@/components/learnings/LearningPageHeader';
import type { LearningFormData } from '@/lib/validations/learningSchema';

/**
 * Page for creating a new Learning.
 *
 * Design: Focused, distraction-free capture surface with:
 * - Title field (optional)
 * - Content field (required)
 * - Character counters
 * - Loading state
 * - Success toast
 * - Keyboard shortcuts (Cmd/Ctrl+Enter, Escape)
 */
export default function CreateLearningPage() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const t = useTranslations('learnings.create');

  const handleSubmit = async (data: LearningFormData) => {
    // TODO: Replace with actual API call to create learning
    console.log('Creating learning:', data);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In a real implementation, this would be:
    // const newLearning = await learningApi.create(data);
    // Then redirect to the new learning's view page
    router.push(`/${params.locale}/poks`);
  };

  return (
    <div>
      <LearningPageHeader locale={params.locale} />
      <CreateLearningForm
        onSubmit={handleSubmit}
      />
    </div>
  );
}
