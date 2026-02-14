'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { PokForm } from '@/components/poks/PokForm';
import { pokApi, type Pok } from '@/lib/pokApi';
import { ApiRequestError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { PokFormData } from '@/lib/validations/pokSchema';

/**
 * Page for editing an existing POK.
 *
 * Features:
 * - Fetches POK by ID
 * - PokForm component pre-populated with POK data
 * - Success: redirect to POK detail page
 * - Error handling
 * - Cancel button (back to POK detail)
 */
export default function EditPokPage() {
  const t = useTranslations('poks');
  const router = useRouter();
  const params = useParams<{ locale: string; id: string }>();
  const pokId = params.id;

  const [pok, setPok] = useState<Pok | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPok();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pokId]);

  const loadPok = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pokApi.getById(pokId);
      setPok(data);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError(t('errors.unexpected'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: PokFormData) => {
    setError(null);
    try {
      await pokApi.update(pokId, {
        title: data.title || null,
        content: data.content,
      });

      // Success - redirect to POK detail
      router.push(`/${params.locale}/poks/${pokId}` as never);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError(t('errors.unexpected'));
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="large" />
      </div>
    );
  }

  if (error || !pok) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <div
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
        >
          {error || t('errors.notFound')}
        </div>
        <Link href={`/${params.locale}/poks` as never}>
          <Button className="mt-4">{t('view.backButton')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {t('edit.title')}
        </h1>
        <Link href={`/${params.locale}/poks/${pokId}` as never}>
          <Button variant="secondary">{t('edit.cancelButton')}</Button>
        </Link>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
        >
          {error}
        </div>
      )}

      <PokForm
        onSubmit={handleSubmit}
        mode="edit"
        initialData={{
          title: pok.title || '',
          content: pok.content,
        }}
      />
    </div>
  );
}
