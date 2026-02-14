'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { PokList } from '@/components/poks/PokList';
import { pokApi, type Pok } from '@/lib/pokApi';
import { ApiRequestError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

/**
 * Page for listing all POKs.
 *
 * Features:
 * - Fetches POKs with pagination (default: page 0, size 20)
 * - PokList component for display
 * - Loading state
 * - Error handling
 * - Create new POK button
 */
export default function PoksPage() {
  const t = useTranslations('poks');
  const [poks, setPoks] = useState<Pok[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPoks();
  }, []);

  const loadPoks = async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await pokApi.getAll(0, 20);
      setPoks(page.content);
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

  return (
    <div className="mx-auto max-w-7xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {t('list.title')}
        </h1>
        <Link href="/poks/new">
          <Button>{t('list.createButton')}</Button>
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

      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Spinner size="large" />
        </div>
      ) : (
        <PokList poks={poks} />
      )}
    </div>
  );
}
