'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { pokApi, type Pok } from '@/lib/pokApi';
import { ApiRequestError } from '@/lib/api';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
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
      <div className="mx-auto max-w-2xl">
        <Alert variant="error">{error || t('errors.notFound')}</Alert>
        <Link href={`/${params.locale}/poks` as never} aria-label={t('view.backButton')}>
          <Button variant="ghost" size="sm" className="mt-4" tabIndex={-1} aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href={`/${params.locale}/poks` as never} aria-label={t('view.backButton')}>
          <Button variant="ghost" size="sm" tabIndex={-1} aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
          </Button>
        </Link>
        <div className="flex items-center space-x-1">
          <Link href={`/${params.locale}/poks/${pokId}/edit` as never}>
            <Button variant="ghost" size="sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="mr-1.5 h-4 w-4" aria-hidden="true">
                <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
              </svg>
              {t('view.editButton')}
            </Button>
          </Link>
          <DeletePokButton onDelete={handleDelete} />
        </div>
      </div>

      <Card as="article" className="p-6 shadow-sm">
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
      </Card>

      {showSuccessToast && (
        <Toast message={t('success.deleted')} onDismiss={handleSuccessToastDismiss} />
      )}
    </div>
  );
}
