'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { PokForm } from '@/components/poks/PokForm';
import { pokApi } from '@/lib/pokApi';
import { ApiRequestError } from '@/lib/api';
import { useState } from 'react';
import type { PokFormData } from '@/lib/validations/pokSchema';

/**
 * Page for creating a new POK.
 *
 * Features:
 * - PokForm component for input
 * - Success toast + redirect to POK list
 * - Error handling with user-friendly messages
 */
export default function NewPokPage() {
  const t = useTranslations('poks');
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: PokFormData) => {
    setError(null);
    try {
      await pokApi.create({
        title: data.title || null,
        content: data.content,
      });

      // Success - redirect to POK list
      router.push('/poks');
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError(t('errors.unexpected'));
      }
    }
  };

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
        {t('create.title')}
      </h1>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
        >
          {error}
        </div>
      )}

      <PokForm onSubmit={handleSubmit} mode="create" />
    </div>
  );
}
