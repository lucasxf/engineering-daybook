'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { Alert } from '@/components/ui/Alert';
import { PokForm } from '@/components/poks/PokForm';
import { TagPicker } from '@/components/poks/TagPicker';
import { pokApi } from '@/lib/pokApi';
import { ApiRequestError } from '@/lib/api';
import { useState } from 'react';
import type { Tag } from '@/lib/tagApi';
import type { PokFormData } from '@/lib/validations/pokSchema';

/**
 * Page for creating a new POK.
 *
 * Features:
 * - PokForm component for input
 * - TagPicker slot for pre-assigning tags atomically
 * - Success toast + redirect to POK list
 * - Error handling with user-friendly messages
 */
export default function NewPokPage() {
  const t = useTranslations('poks');
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  const handleSubmit = async (data: PokFormData) => {
    setError(null);
    try {
      const newPok = await pokApi.create({
        title: data.title || null,
        content: data.content,
        ...(selectedTags.length > 0 && { tagIds: selectedTags.map((tag) => tag.id) }),
      });

      // Redirect to the new POK's view page
      router.push(`/${params.locale}/poks/${newPok.id}` as never);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError(t('errors.unexpected'));
      }
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold text-slate-900 dark:text-slate-100">
        {t('create.title')}
      </h1>

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      <PokForm
        onSubmit={handleSubmit}
        mode="create"
        renderAfterContent={
          <TagPicker selectedTags={selectedTags} onSelectionChange={setSelectedTags} />
        }
      />
    </div>
  );
}
