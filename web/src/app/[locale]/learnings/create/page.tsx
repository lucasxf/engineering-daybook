'use client';

import { useRouter, useParams } from 'next/navigation';
import { CreateLearningForm } from '@/components/learnings/CreateLearningForm';
import { LearningPageHeader } from '@/components/learnings/LearningPageHeader';
import type { LearningFormData } from '@/lib/validations/learningSchema';
import { pokApi } from '@/lib/pokApi';

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

  const handleSubmit = async (data: LearningFormData) => {
    const newLearning = await pokApi.create({
      title: data.title || null,
      content: data.content,
    });
    router.push(`/${params.locale}/poks/${newLearning.id}`);
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
