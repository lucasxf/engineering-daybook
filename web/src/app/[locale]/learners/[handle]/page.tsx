'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getLearnerProfile, type LearnerProfileResponse, type RelationshipStatus } from '@/lib/learnerApi';
import { ApiRequestError } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { MarkdownContent } from '@/components/ui/MarkdownContent';
import { FollowButton } from '@/components/FollowButton';

export default function LearnerProfilePage() {
  const t = useTranslations('learners');
  const tPoks = useTranslations('poks');
  const { user } = useAuth();
  const params = useParams<{ locale: string; handle: string }>();
  const handle = params.handle;

  const [profile, setProfile] = useState<LearnerProfileResponse | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [relationshipStatus, setRelationshipStatus] = useState<RelationshipStatus>('NONE');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      setNotFound(false);
      try {
        const data = await getLearnerProfile(handle);
        setProfile(data);
        setRelationshipStatus(data.relationshipStatus ?? 'NONE');
      } catch (err) {
        if (err instanceof ApiRequestError && err.status === 404) {
          setNotFound(true);
        } else {
          setError(t('unexpectedError'));
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [handle]);

  if (loading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <Alert variant="info" role="status">
          <p className="font-medium">{t('notFound')}</p>
          <p className="text-sm">{t('notFoundHint')}</p>
        </Alert>
      </main>
    );
  }

  if (error !== null || profile === null) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <Alert variant="error">{error ?? t('unexpectedError')}</Alert>
      </main>
    );
  }

  const isOwner = user?.handle === handle;
  const isPrivateShell = profile.profileVisibility != null && !isOwner;

  if (isPrivateShell) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <Card className="p-8 text-center">
          <p className="mb-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
            @{handle}
          </p>
          <p className="text-slate-500 dark:text-slate-400">{t('privateProfile')}</p>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {profile.displayName}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">@{handle}</p>
          {isOwner && (profile.followerCount !== undefined || profile.followingCount !== undefined) && (
            <div className="mt-1 flex gap-3 text-sm text-slate-500 dark:text-slate-400">
              {profile.followerCount !== undefined && (
                <span>{t('social.followerCount', { count: profile.followerCount })}</span>
              )}
              {profile.followingCount !== undefined && (
                <span>{t('social.followingCount', { count: profile.followingCount })}</span>
              )}
              {profile.colleagueCount !== undefined && (
                <span>{t('social.colleagueCount', { count: profile.colleagueCount })}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {isOwner && profile.learningCount !== undefined && (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {t('learningCount', { count: profile.learningCount })}
            </span>
          )}
          {!isOwner && (
            <FollowButton
              handle={handle}
              relationshipStatus={relationshipStatus}
              onRelationshipChange={setRelationshipStatus}
            />
          )}
        </div>
      </div>

      {(!profile.learnings || profile.learnings.length === 0) ? (
        <p className="text-slate-500 dark:text-slate-400">{t('noLearnings')}</p>
      ) : (
        <div className="space-y-4">
          {profile.learnings.map((pok) => (
            <Card key={pok.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  {pok.title && (
                    <p className="mb-1 font-medium text-slate-900 dark:text-slate-100">
                      {pok.title}
                    </p>
                  )}
                  <MarkdownContent content={pok.content} variant="compact" />
                </div>
                {isOwner && pok.visibility && (
                  <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium
                    bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    {pok.visibility === 'PUBLIC' ? tPoks('visibility.public')
                      : pok.visibility === 'FOLLOWERS_ONLY' ? tPoks('visibility.followersOnly')
                      : pok.visibility === 'COLLEAGUES_ONLY' ? tPoks('visibility.colleaguesOnly')
                      : tPoks('visibility.private')}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
