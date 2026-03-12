'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { LogoLink } from '@/components/ui/LogoLink';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import {
  Camera,
  Trash2,
  Lock,
  Users,
  UserCheck,
  Globe,
  Sun,
  Moon,
  Monitor,
  AlertTriangle,
  Check,
  Loader2,
} from 'lucide-react';
import type { ProfileVisibility } from '@/lib/auth';

const BIO_MAX = 200;

type ThemeOption = 'light' | 'dark' | 'system';

interface MockUser {
  handle: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  profileVisibility: ProfileVisibility;
}

const initialMockUser: MockUser = {
  handle: 'demo-user',
  displayName: 'Demo User',
  bio: 'Learning about distributed systems and TypeScript.',
  avatarUrl: null,
  profileVisibility: 'PUBLIC',
};

export default function DemoSettingsPage() {
  const t = useTranslations('settings');
  const tCommon = useTranslations('common');
  const params = useParams<{ locale: string }>();
  const { theme, setTheme } = useTheme();

  // Mock user state
  const [user, setUser] = useState<MockUser>(initialMockUser);

  // Form states
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio);
  const [profileVisibility, setProfileVisibility] = useState<ProfileVisibility>(user.profileVisibility);
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>((theme as ThemeOption) ?? 'system');

  // Loading / saving states
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [displayNameSaving, setDisplayNameSaving] = useState(false);
  const [bioSaving, setBioSaving] = useState(false);

  // Saved indicators
  const [displayNameSaved, setDisplayNameSaved] = useState(false);
  const [bioSaved, setBioSaved] = useState(false);

  // Validation errors
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);
  const [bioError, setBioError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Global feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // URL detection for bio
  const urlRegex = /https?:\/\/|www\./i;
  const bioHasUrl = urlRegex.test(bio);

  // Avatar handlers
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError(null);

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setAvatarError(t('profile.avatarInvalidType'));
      return;
    }

    // Validate size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError(t('profile.avatarTooLarge'));
      return;
    }

    setAvatarUploading(true);
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Create object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setUser((prev) => ({ ...prev, avatarUrl: objectUrl }));
    setAvatarUploading(false);
    setFeedback({ type: 'success', message: t('profile.saveSuccess') });
    setTimeout(() => setFeedback(null), 3000);
  }

  async function handleAvatarRemove() {
    setAvatarUploading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setUser((prev) => ({ ...prev, avatarUrl: null }));
    setAvatarUploading(false);
    setFeedback({ type: 'success', message: t('profile.saveSuccess') });
    setTimeout(() => setFeedback(null), 3000);
  }

  // Display name handler
  async function handleDisplayNameSave() {
    setDisplayNameError(null);

    if (!displayName.trim()) {
      setDisplayNameError(params.locale === 'pt-BR' ? 'Nome de exibicao e obrigatorio' : 'Display name is required');
      return;
    }

    setDisplayNameSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setUser((prev) => ({ ...prev, displayName }));
    setDisplayNameSaving(false);
    setDisplayNameSaved(true);
    setTimeout(() => setDisplayNameSaved(false), 2000);
  }

  // Bio handler
  async function handleBioSave() {
    setBioError(null);

    if (bioHasUrl) {
      setBioError(params.locale === 'pt-BR' ? 'URLs nao sao permitidas na bio' : 'URLs are not allowed in bio');
      return;
    }

    setBioSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setUser((prev) => ({ ...prev, bio }));
    setBioSaving(false);
    setBioSaved(true);
    setTimeout(() => setBioSaved(false), 2000);
  }

  // Visibility handler
  async function handleVisibilityChange(value: ProfileVisibility) {
    setProfileVisibility(value);
    setUser((prev) => ({ ...prev, profileVisibility: value }));
    setFeedback({ type: 'success', message: t('privacy.saveSuccess') });
    setTimeout(() => setFeedback(null), 3000);
  }

  // Theme handler
  function handleThemeChange(value: ThemeOption) {
    setSelectedTheme(value);
    setTheme(value);
  }

  const visibilityOptions: { value: ProfileVisibility; label: string; icon: React.ReactNode; description: string }[] = [
    {
      value: 'PRIVATE',
      label: t('privacy.private'),
      icon: <Lock className="h-4 w-4" />,
      description: params.locale === 'pt-BR' ? 'Somente voce pode ver' : 'Only you can see',
    },
    {
      value: 'COLLEAGUES_ONLY',
      label: t('privacy.colleaguesOnly'),
      icon: <Users className="h-4 w-4" />,
      description: params.locale === 'pt-BR' ? 'Colegas mutuos' : 'Mutual colleagues',
    },
    {
      value: 'FOLLOWERS_ONLY',
      label: t('privacy.followersOnly'),
      icon: <UserCheck className="h-4 w-4" />,
      description: params.locale === 'pt-BR' ? 'Seus seguidores' : 'Your followers',
    },
    {
      value: 'PUBLIC',
      label: t('privacy.public'),
      icon: <Globe className="h-4 w-4" />,
      description: params.locale === 'pt-BR' ? 'Qualquer pessoa' : 'Anyone',
    },
  ];

  const themeOptions: { value: ThemeOption; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: params.locale === 'pt-BR' ? 'Claro' : 'Light', icon: <Sun className="h-4 w-4" /> },
    { value: 'dark', label: params.locale === 'pt-BR' ? 'Escuro' : 'Dark', icon: <Moon className="h-4 w-4" /> },
    { value: 'system', label: params.locale === 'pt-BR' ? 'Sistema' : 'System', icon: <Monitor className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Demo banner */}
      <div className="bg-warning/10 border-b border-warning/30 px-4 py-2 text-center text-sm text-warning">
        {params.locale === 'pt-BR'
          ? 'Modo demo - Alteracoes nao serao persistidas'
          : 'Demo mode - Changes will not be persisted'}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <LogoLink />
          </div>
          <div className="flex items-center gap-2">
            <Avatar
              avatarUrl={user.avatarUrl ?? undefined}
              displayName={user.displayName}
              handle={user.handle}
              size={32}
            />
            <span className="hidden text-sm text-muted-foreground sm:block">@{user.handle}</span>
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold text-foreground">{t('title')}</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {params.locale === 'pt-BR'
            ? 'Gerencie seu perfil e preferencias'
            : 'Manage your profile and preferences'}
        </p>

        {/* Global feedback */}
        {feedback && (
          <Alert
            variant={feedback.type === 'success' ? 'success' : 'error'}
            className="mb-4"
          >
            {feedback.message}
          </Alert>
        )}

        <div className="flex flex-col gap-4">
          {/* Avatar Section */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">{t('profile.avatar')}</h2>
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar
                  avatarUrl={user.avatarUrl ?? undefined}
                  displayName={user.displayName}
                  handle={user.handle}
                  size={80}
                />
                {avatarUploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/80">
                    <Spinner className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={avatarUploading}
                    onClick={() => document.getElementById('avatar-input')?.click()}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    {t('profile.uploadAvatar')}
                  </Button>
                  {user.avatarUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={avatarUploading}
                      onClick={handleAvatarRemove}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t('profile.removeAvatar')}
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{t('profile.avatarHint')}</p>
                {avatarError && <p className="text-xs text-destructive">{avatarError}</p>}
              </div>
            </div>
            <input
              id="avatar-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </Card>

          {/* Profile Section */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">{t('profile.heading')}</h2>
            <div className="space-y-4">
              {/* Display name */}
              <div>
                <label
                  htmlFor="displayName"
                  className="mb-1 block text-sm font-medium text-foreground"
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
                    className={displayNameError ? 'border-destructive' : ''}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={displayNameSaving}
                    onClick={handleDisplayNameSave}
                  >
                    {displayNameSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : displayNameSaved ? (
                      <>
                        <Check className="mr-1 h-4 w-4" />
                        {params.locale === 'pt-BR' ? 'Salvo' : 'Saved'}
                      </>
                    ) : (
                      t('profile.displayNameSave')
                    )}
                  </Button>
                </div>
                {displayNameError && (
                  <p className="mt-1 text-xs text-destructive">{displayNameError}</p>
                )}
              </div>

              {/* Bio */}
              <div>
                <label
                  htmlFor="bio"
                  className="mb-1 block text-sm font-medium text-foreground"
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
                  className={bioError || bioHasUrl ? 'border-destructive' : ''}
                />
                <div className="mt-1 flex items-center justify-between">
                  <div>
                    {bioHasUrl && (
                      <p className="text-xs text-destructive">
                        {params.locale === 'pt-BR' ? 'URLs nao sao permitidas' : 'URLs are not allowed'}
                      </p>
                    )}
                    {bioError && <p className="text-xs text-destructive">{bioError}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {bio.length}/{BIO_MAX}
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={bioSaving || bioHasUrl}
                  onClick={handleBioSave}
                  className="mt-2"
                >
                  {bioSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : bioSaved ? (
                    <>
                      <Check className="mr-1 h-4 w-4" />
                      {params.locale === 'pt-BR' ? 'Salvo' : 'Saved'}
                    </>
                  ) : (
                    t('profile.bioSave')
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Privacy Section */}
          <Card className="p-6">
            <h2 className="mb-2 text-lg font-semibold text-foreground">{t('privacy.heading')}</h2>
            <p className="mb-4 text-sm text-muted-foreground">{t('privacy.profileVisibilityHint')}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {visibilityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleVisibilityChange(option.value)}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                    profileVisibility === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      profileVisibility === option.value
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {option.icon}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Appearance Section */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              {params.locale === 'pt-BR' ? 'Aparencia' : 'Appearance'}
            </h2>
            <div className="flex gap-2">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleThemeChange(option.value)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg border p-3 transition-colors ${
                    selectedTheme === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                >
                  <span
                    className={
                      selectedTheme === option.value ? 'text-primary' : 'text-muted-foreground'
                    }
                  >
                    {option.icon}
                  </span>
                  <span className="font-medium text-foreground">{option.label}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Language Section */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              {params.locale === 'pt-BR' ? 'Idioma' : 'Language'}
            </h2>
            <div className="flex gap-2">
              <Link
                href="/en/demo/settings"
                className={`flex flex-1 items-center justify-center rounded-lg border p-3 transition-colors ${
                  params.locale === 'en'
                    ? 'border-primary bg-primary/5 font-medium text-foreground'
                    : 'border-border text-muted-foreground hover:border-muted-foreground/30'
                }`}
              >
                English
              </Link>
              <Link
                href="/pt-BR/demo/settings"
                className={`flex flex-1 items-center justify-center rounded-lg border p-3 transition-colors ${
                  params.locale === 'pt-BR'
                    ? 'border-primary bg-primary/5 font-medium text-foreground'
                    : 'border-border text-muted-foreground hover:border-muted-foreground/30'
                }`}
              >
                Portugues (Brasil)
              </Link>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/30 p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h2 className="text-lg font-semibold text-destructive">
                {params.locale === 'pt-BR' ? 'Zona de Perigo' : 'Danger Zone'}
              </h2>
            </div>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              {params.locale === 'pt-BR'
                ? 'Acoes irreversiveis. Tenha cuidado.'
                : 'Irreversible actions. Be careful.'}
            </p>
            <Button
              variant="danger"
              size="sm"
              onClick={() =>
                alert(
                  params.locale === 'pt-BR'
                    ? 'Esta e uma demo - nenhuma conta sera excluida'
                    : 'This is a demo - no account will be deleted'
                )
              }
            >
              {params.locale === 'pt-BR' ? 'Excluir minha conta' : 'Delete my account'}
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
