'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { pokApi, type Pok } from '@/lib/pokApi';
import { ApiRequestError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Toast } from '@/components/ui/Toast';
import { DeletePokButton } from '@/components/poks/DeletePokButton';
import { TagSection } from '@/components/poks/TagSection';

/**
 * Page for viewing a single POK.
 *
 * Features:
 * - Fetches POK by ID
 * - Displays title (if present) and content
 * - Tag management via TagSection (display, add, remove, AI suggestions)
 * - Edit link and delete button
 * - Formatted timestamps
 */
export default function ViewPokPage() {
  const t = useTranslations('poks');
  const router = useRouter();
  const params = useParams<{ locale: string; id: string }>();
  const pokId = params.id;

  const [pok, setPok] = useState<Pok | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

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

  const handleDelete = async () => {
    try {
      await pokApi.delete(pokId);
      setShowSuccessToast(true);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError(t('errors.unexpected'));
      }
    }
  };

  const handleSuccessToastDismiss = () => {
    router.push(`/${params.locale}/poks` as never);
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error !== null || !pok) {
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
        <Link href={`/${params.locale}/poks` as never}>
          <Button variant="secondary">{t('view.backButton')}</Button>
        </Link>
        <div className="flex space-x-2">
          <Link href={`/${params.locale}/poks/${pokId}/edit` as never}>
            <Button>{t('view.editButton')}</Button>
          </Link>
          <DeletePokButton onDelete={handleDelete} />
        </div>
      </div>

      <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {pok.title && (
          <h1 className="mb-4 text-3xl font-bold text-slate-900 dark:text-slate-100">
            {pok.title}
          </h1>
        )}
        <div className="prose prose-gray max-w-none dark:prose-invert">
          <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
            {pok.content}
          </p>
        </div>

        <TagSection
          pokId={pokId}
          tags={pok.tags}
          pendingSuggestions={pok.pendingSuggestions}
          onChanged={loadPok}
        />

        <div className="mt-6 flex space-x-4 text-sm text-slate-500 dark:text-slate-500">
          <time dateTime={pok.createdAt}>
            {t('view.created')}: {new Date(pok.createdAt).toLocaleDateString(params.locale)}
          </time>
          <time dateTime={pok.updatedAt}>
            {t('view.updated')}: {new Date(pok.updatedAt).toLocaleDateString(params.locale)}
          </time>
        </div>
      </article>

      {showSuccessToast && (
        <Toast message={t('success.deleted')} onDismiss={handleSuccessToastDismiss} />
      )}
    </div>
  );
}
