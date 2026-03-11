'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { updateUserSettings, uploadAvatar, deleteAvatar } from '@/lib/userApi';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Avatar } from '@/components/ui/Avatar';
import type { PokVisibility } from '@/lib/pokApi';
import type { ProfileVisibility } from '@/lib/auth';

const BIO_MAX = 200;

export default function SettingsPage() {
  const t = useTranslations('settings');
  const { user, updateUser } = useAuth();
  const params = useParams<{ locale: string }>();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileVisibility, setProfileVisibility] = useState<ProfileVisibility>(
    user?.profileVisibility ?? 'PRIVATE'
  );
  const [defaultPokVisibility, setDefaultPokVisibility] = useState<PokVisibility>(
    user?.defaultPokVisibility ?? 'PRIVATE'
  );

  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');

  const [avatarSaving, setAvatarSaving] = useState(false);
  const [displayNameSaving, setDisplayNameSaving] = useState(false);
  const [bioSaving, setBioSaving] = useState(false);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (user) {
      setProfileVisibility(user.profileVisibility ?? 'PRIVATE');
      setDefaultPokVisibility(user.defaultPokVisibility ?? 'PRIVATE');
      setDisplayName(user.displayName ?? '');
      setBio(user.bio ?? '');
    }
  }, [user]);

  function showFeedback(type: 'success' | 'error', key: string) {
    setFeedback({ type, message: t(key as Parameters<typeof t>[0]) });
  }

  async function handleProfileVisibilityChange(value: ProfileVisibility) {
    setProfileVisibility(value);
    setFeedback(null);
    try {
      await updateUserSettings({ profileVisibility: value });
      updateUser({ profileVisibility: value });
      showFeedback('success', 'privacy.saveSuccess');
    } catch {
      showFeedback('error', 'privacy.saveError');
      setProfileVisibility(user?.profileVisibility ?? 'PRIVATE');
    }
  }

  async function handleDefaultPokVisibilityChange(value: PokVisibility) {
    setDefaultPokVisibility(value);
    setFeedback(null);
    try {
      await updateUserSettings({ defaultPokVisibility: value });
      updateUser({ defaultPokVisibility: value });
      showFeedback('success', 'privacy.saveSuccess');
    } catch {
      showFeedback('error', 'privacy.saveError');
      setDefaultPokVisibility(user?.defaultPokVisibility ?? 'PRIVATE');
    }
  }

  async function handleDisplayNameSave() {
    setFeedback(null);
    setDisplayNameSaving(true);
    try {
      await updateUserSettings({ displayName });
      updateUser({ displayName });
      showFeedback('success', 'profile.saveSuccess');
    } catch {
      showFeedback('error', 'profile.saveError');
    } finally {
      setDisplayNameSaving(false);
    }
  }

  async function handleBioSave() {
    setFeedback(null);
    setBioSaving(true);
    try {
      await updateUserSettings({ bio });
      updateUser({ bio });
      showFeedback('success', 'profile.saveSuccess');
    } catch {
      showFeedback('error', 'profile.saveError');
    } finally {
      setBioSaving(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showFeedback('error', 'profile.avatarInvalidType');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showFeedback('error', 'profile.avatarTooLarge');
      return;
    }

    setFeedback(null);
    setAvatarSaving(true);
    try {
      const { avatarUrl } = await uploadAvatar(file);
      updateUser({ avatarUrl });
      showFeedback('success', 'profile.saveSuccess');
    } catch {
      showFeedback('error', 'profile.saveError');
    } finally {
      setAvatarSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleAvatarRemove() {
    setFeedback(null);
    setAvatarSaving(true);
    try {
      await deleteAvatar();
      updateUser({ avatarUrl: undefined });
      showFeedback('success', 'profile.saveSuccess');
    } catch {
      showFeedback('error', 'profile.saveError');
    } finally {
      setAvatarSaving(false);
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

      {/* Profile section */}
      <Card className="mb-6 p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          {t('profile.heading')}
        </h2>

        <div className="space-y-6">
          {/* Avatar */}
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('profile.avatar')}
            </p>
            <div className="flex items-center gap-4">
              <Avatar
                avatarUrl={user?.avatarUrl}
                displayName={user?.displayName ?? user?.handle ?? ''}
                handle={user?.handle ?? ''}
                size={64}
              />
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={avatarSaving}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {avatarSaving ? t('profile.uploading') : t('profile.uploadAvatar')}
                  </Button>
                  {user?.avatarUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={avatarSaving}
                      onClick={handleAvatarRemove}
                    >
                      {t('profile.removeAvatar')}
                    </Button>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('profile.avatarHint')}
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* Display name */}
          <div>
            <label
              htmlFor="displayName"
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('profile.displayName')}
            </label>
            <div className="flex gap-2">
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t('profile.displayNamePlaceholder')}
                maxLength={100}
                disabled={displayNameSaving}
              />
              <Button
                variant="secondary"
                size="sm"
                disabled={displayNameSaving}
                onClick={handleDisplayNameSave}
              >
                {displayNameSaving ? t('profile.displayNameSaving') : t('profile.displayNameSave')}
              </Button>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label
              htmlFor="bio"
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('profile.bio')}
            </label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={t('profile.bioPlaceholder')}
              maxLength={BIO_MAX}
              rows={3}
              disabled={bioSaving}
              className="mb-1"
            />
            <div className="mb-2 flex justify-end">
              <span className="text-xs text-slate-400">{bio.length}/{BIO_MAX}</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              disabled={bioSaving}
              onClick={handleBioSave}
            >
              {bioSaving ? t('profile.bioSaving') : t('profile.bioSave')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Privacy section */}
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
