'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { updateUserSettings } from '@/lib/userApi';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import type { PokVisibility } from '@/lib/pokApi';
import type { ProfileVisibility } from '@/lib/auth';

export default function SettingsPage() {
  const t = useTranslations('settings');
  const { user, updateUser } = useAuth();
  const params = useParams<{ locale: string }>();

  const [profileVisibility, setProfileVisibility] = useState<ProfileVisibility>(
    user?.profileVisibility ?? 'PRIVATE'
  );
  const [defaultPokVisibility, setDefaultPokVisibility] = useState<PokVisibility>(
    user?.defaultPokVisibility ?? 'PRIVATE'
  );
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (user) {
      setProfileVisibility(user.profileVisibility ?? 'PRIVATE');
      setDefaultPokVisibility(user.defaultPokVisibility ?? 'PRIVATE');
    }
  }, [user]);

  async function handleProfileVisibilityChange(value: ProfileVisibility) {
    setProfileVisibility(value);
    setFeedback(null);
    try {
      await updateUserSettings({ profileVisibility: value });
      updateUser({ profileVisibility: value });
      setFeedback({ type: 'success', message: t('privacy.saveSuccess') });
    } catch {
      setFeedback({ type: 'error', message: t('privacy.saveError') });
      setProfileVisibility(user?.profileVisibility ?? 'PRIVATE');
    }
  }

  async function handleDefaultPokVisibilityChange(value: PokVisibility) {
    setDefaultPokVisibility(value);
    setFeedback(null);
    try {
      await updateUserSettings({ defaultPokVisibility: value });
      updateUser({ defaultPokVisibility: value });
      setFeedback({ type: 'success', message: t('privacy.saveSuccess') });
    } catch {
      setFeedback({ type: 'error', message: t('privacy.saveError') });
      setDefaultPokVisibility(user?.defaultPokVisibility ?? 'PRIVATE');
    }
  }

  const visibilityOptions = [
    { value: 'PRIVATE', label: t('privacy.private') },
    { value: 'COLLEAGUES_ONLY', label: t('privacy.colleaguesOnly') },
    { value: 'FOLLOWERS_ONLY', label: t('privacy.followersOnly') },
    { value: 'PUBLIC', label: t('privacy.public') },
  ];

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">
        {t('title')}
      </h1>

      {feedback !== null && (
        <Alert
          variant={feedback.type === 'success' ? 'success' : 'error'}
          role={feedback.type === 'error' ? 'alert' : 'status'}
          className="mb-4"
        >
          {feedback.message}
        </Alert>
      )}

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          {t('privacy.heading')}
        </h2>

        <div className="space-y-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('privacy.profileVisibility')}
            </label>
            <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
              {t('privacy.profileVisibilityHint')}
            </p>
            <Select
              options={visibilityOptions}
              value={profileVisibility}
              onChange={(v) => handleProfileVisibilityChange(v as ProfileVisibility)}
              label={t('privacy.profileVisibility')}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('privacy.defaultPokVisibility')}
            </label>
            <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
              {t('privacy.defaultPokVisibilityHint')}
            </p>
            <Select
              options={visibilityOptions}
              value={defaultPokVisibility}
              onChange={(v) => handleDefaultPokVisibilityChange(v as PokVisibility)}
              label={t('privacy.defaultPokVisibility')}
            />
          </div>

          {user && (
            <Link
              href={`/${params.locale}/learners/${user.handle}`}
              className="inline-block text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              {t('privacy.viewProfile')}
            </Link>
          )}
        </div>
      </Card>
    </main>
  );
}
