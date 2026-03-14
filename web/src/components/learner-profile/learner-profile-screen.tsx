"use client";

import { Lock, BookOpen } from "lucide-react";
import { LearnimoWordmark } from "@/components/ui/LearnimoWordmark";
import { ProfileHero, ProfileHeroSkeleton } from "./profile-hero";
import type { ProfileVariant } from "./profile-hero";
export type { ProfileVariant } from "./profile-hero";
import { LearningCard, LearningCardSkeleton } from "./learning-card";

// ─── i18n types ──────────────────────────────────────────────────────────────

export interface LearnerProfileTranslations {
  login: string;
  goToProfile: string;
  privateProfile: string;
  notFound: string;
  notFoundHint: string;
  noPublicLearnings: string;
  learnings: string;
  follow: string;
  following: string;
  editProfile: string;
}

const DEFAULT_TRANSLATIONS: LearnerProfileTranslations = {
  login: "Entrar",
  goToProfile: "Ir para perfil de @{handle}",
  privateProfile: "Este perfil é privado",
  notFound: "Perfil não encontrado",
  notFoundHint: "O perfil que você está procurando não existe ou foi removido.",
  noPublicLearnings: "Nenhum aprendizado público ainda",
  learnings: "Aprendizados",
  follow: "Seguir",
  following: "Seguindo",
  editProfile: "Editar perfil",
};

const EN_DEFAULT_TRANSLATIONS: LearnerProfileTranslations = {
  login: "Log in",
  goToProfile: "Go to @{handle}'s profile",
  privateProfile: "This profile is private",
  notFound: "Profile not found",
  notFoundHint: "The profile you're looking for doesn't exist or has been removed.",
  noPublicLearnings: "No public learnings yet",
  learnings: "Learnings",
  follow: "Follow",
  following: "Following",
  editProfile: "Edit profile",
};

// ─── Mock data ───────────────────────────────────────────────────────────────

interface MockLearning {
  id: string;
  title: string;
  excerpt: string;
  tags: string[];
  timestamp: string;
}

export const MOCK_LEARNINGS_PT: MockLearning[] = [
  {
    id: "1",
    title: "Como o V8 otimiza funções hot com JIT compilation",
    excerpt:
      "O motor JavaScript do Chrome usa um compilador JIT de dois estágios: Ignition (interpretador) e TurboFan (otimizador). Funções chamadas repetidamente são marcadas como \"hot\" e recompiladas com otimizações agressivas como inlining e escape analysis.",
    tags: ["javascript", "v8", "performance"],
    timestamp: "há 2 dias",
  },
  {
    id: "2",
    title: "Row-level locking vs. table-level locking no PostgreSQL",
    excerpt:
      "O PostgreSQL usa MVCC (Multi-Version Concurrency Control) para isolar transações. Em operações de UPDATE e DELETE, apenas as linhas afetadas recebem lock, permitindo leituras concorrentes sem bloqueio.",
    tags: ["postgresql", "banco-de-dados", "concorrência"],
    timestamp: "há 5 dias",
  },
  {
    id: "3",
    title: "Diferença entre useMemo e useCallback no React",
    excerpt:
      "useMemo memoriza o resultado de um cálculo caro. useCallback memoriza a referência de uma função. Ambos previnem re-renders desnecessários, mas são usados em contextos distintos — useCallback é especialmente útil ao passar handlers para componentes filhos otimizados.",
    tags: ["react", "hooks", "performance"],
    timestamp: "há 1 semana",
  },
];

export const MOCK_LEARNINGS_EN: MockLearning[] = [
  {
    id: "1",
    title: "How V8 optimizes hot functions with JIT compilation",
    excerpt:
      "Chrome's JavaScript engine uses a two-stage JIT compiler: Ignition (interpreter) and TurboFan (optimizer). Functions called repeatedly are marked as \"hot\" and recompiled with aggressive optimizations like inlining and escape analysis.",
    tags: ["javascript", "v8", "performance"],
    timestamp: "2 days ago",
  },
  {
    id: "2",
    title: "Row-level locking vs. table-level locking in PostgreSQL",
    excerpt:
      "PostgreSQL uses MVCC (Multi-Version Concurrency Control) to isolate transactions. In UPDATE and DELETE operations, only affected rows receive locks, allowing concurrent reads without blocking.",
    tags: ["postgresql", "database", "concurrency"],
    timestamp: "5 days ago",
  },
  {
    id: "3",
    title: "Difference between useMemo and useCallback in React",
    excerpt:
      "useMemo memoizes the result of an expensive calculation. useCallback memoizes a function reference. Both prevent unnecessary re-renders but are used in different contexts — useCallback is especially useful when passing handlers to optimized child components.",
    tags: ["react", "hooks", "performance"],
    timestamp: "1 week ago",
  },
];

// ─── App Header ──────────────────────────────────────────────────────────────

interface AppHeaderProps {
  viewerHandle?: string;
  theme: "dark" | "light";
  t: LearnerProfileTranslations;
}

function AppHeader({ viewerHandle, theme, t }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between px-5 py-4 border-b border-card-border">
      <a
        href="#"
        aria-label="learnimo"
        className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-focus)]"
      >
        <LearnimoWordmark className="text-xl" ariaHidden />
      </a>

      {viewerHandle ? (
        <a
          href="#"
          className="flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-focus)]"
          aria-label={t.goToProfile.replace("{handle}", viewerHandle)}
        >
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center font-heading font-semibold text-sm"
            style={{
              backgroundColor: theme === "dark" ? "#2B4A78" : "#E0E8F2",
              color: theme === "dark" ? "#F5F0E8" : "#1A365D",
            }}
          >
            {viewerHandle.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium" style={{ color: "var(--color-handle)" }}>
            @{viewerHandle}
          </span>
        </a>
      ) : (
        <a
          href="#"
          className="text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-focus)] rounded"
          style={{ color: "var(--color-link)" }}
        >
          {t.login}
        </a>
      )}
    </header>
  );
}

// ─── Private Profile ─────────────────────────────────────────────────────────

function PrivateProfile({
  handle,
  theme,
  t,
}: {
  handle: string;
  theme: "dark" | "light";
  t: LearnerProfileTranslations;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 px-6 text-center">
      <Lock
        className="h-8 w-8"
        aria-hidden="true"
        style={{ color: theme === "dark" ? "#8899AA" : "#999999" }}
      />
      <p
        className="font-heading text-xl font-semibold"
        style={{ color: theme === "dark" ? "#DCCCC0" : "var(--color-card-foreground)" }}
      >
        @{handle}
      </p>
      <p className="text-sm" style={{ color: theme === "dark" ? "#8899AA" : "#666666" }}>
        {t.privateProfile}
      </p>
    </div>
  );
}

// ─── Not Found ───────────────────────────────────────────────────────────────

function NotFound({ theme, t }: { theme: "dark" | "light"; t: LearnerProfileTranslations }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 px-6 text-center">
      <p
        className="font-heading text-xl font-semibold"
        style={{ color: theme === "dark" ? "#DCCCC0" : "var(--color-card-foreground)" }}
      >
        {t.notFound}
      </p>
      <p className="text-sm" style={{ color: theme === "dark" ? "#8899AA" : "#666666" }}>
        {t.notFoundHint}
      </p>
    </div>
  );
}

// ─── Empty Learnings ─────────────────────────────────────────────────────────

function EmptyLearnings({ theme, t }: { theme: "dark" | "light"; t: LearnerProfileTranslations }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 px-6 text-center">
      <BookOpen
        className="h-10 w-10"
        aria-hidden="true"
        style={{ color: theme === "dark" ? "#2B4A78" : "#D1C9BC" }}
      />
      <p className="text-sm font-medium" style={{ color: theme === "dark" ? "#8899AA" : "#666666" }}>
        {t.noPublicLearnings}
      </p>
    </div>
  );
}

// ─── Loading skeleton ────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex flex-col gap-4">
      <ProfileHeroSkeleton />
      <div className="flex flex-col gap-3 mt-2">
        <LearningCardSkeleton />
        <LearningCardSkeleton />
        <LearningCardSkeleton />
      </div>
    </div>
  );
}

// ─── Learnings Feed ──────────────────────────────────────────────────────────

interface LearningsFeedProps {
  learnings: MockLearning[];
  theme: "dark" | "light";
  t: LearnerProfileTranslations;
}

function LearningsFeed({ learnings, theme, t }: LearningsFeedProps) {
  return (
    <section aria-label={t.learnings}>
      <div className="flex items-center gap-2 mb-4">
        <h2
          className="font-heading text-[13px] font-semibold uppercase tracking-widest"
          style={{ color: "var(--color-handle)" }}
        >
          {t.learnings}
        </h2>
        <div className="flex-1 h-px" style={{ backgroundColor: "var(--color-card-border)" }} />
      </div>

      {learnings.length === 0 ? (
        <EmptyLearnings theme={theme} t={t} />
      ) : (
        <div className="flex flex-col gap-3">
          {learnings.map((learning) => (
            <LearningCard key={learning.id} {...learning} />
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Main screen component ───────────────────────────────────────────────────

interface LearnerProfileScreenProps {
  variant: ProfileVariant;
  theme: "dark" | "light";
  translations?: LearnerProfileTranslations;
  locale?: "en" | "pt-BR";
  viewerHandle?: string;
}

export function LearnerProfileScreen({
  variant,
  theme,
  translations,
  locale = "pt-BR",
  viewerHandle,
}: LearnerProfileScreenProps) {
  const defaultT = locale === "en" ? EN_DEFAULT_TRANSLATIONS : DEFAULT_TRANSLATIONS;
  const t = translations ?? defaultT;
  const mockLearnings = locale === "en" ? MOCK_LEARNINGS_EN : MOCK_LEARNINGS_PT;

  const profile = {
    displayName: "Lucas Fernandes",
    handle: "lucasxf",
    bio:
      locale === "en"
        ? "Software engineer interested in distributed systems, databases, and continuous learning. I write about what I learn day to day."
        : "Engenheiro de software interessado em sistemas distribuídos, banco de dados e aprendizado contínuo. Escrevo sobre o que aprendo no dia a dia.",
    avatarUrl: null as string | null,
  };

  const renderContent = () => {
    if (variant === "loading") {
      return <LoadingState />;
    }

    if (variant === "not-found") {
      return <NotFound theme={theme} t={t} />;
    }

    if (variant === "private") {
      return <PrivateProfile handle={profile.handle} theme={theme} t={t} />;
    }

    const learnings = variant === "empty-learnings" ? [] : mockLearnings;
    const showBio = variant !== "no-bio" ? profile.bio : null;
    const avatarAltText = locale === "en" ? `Avatar of ${profile.displayName}` : undefined;
    const avatarInitialsLabel = locale === "en" ? `Initials of ${profile.displayName}` : undefined;

    return (
      <div className="flex flex-col gap-6">
        <ProfileHero
          displayName={profile.displayName}
          handle={profile.handle}
          bio={showBio}
          avatarUrl={null}
          isFollowing={false}
          isOwnProfile={variant === "own-profile"}
          theme={theme}
          variant={variant}
          translations={{ follow: t.follow, following: t.following, editProfile: t.editProfile }}
          avatarAltText={avatarAltText}
          avatarInitialsLabel={avatarInitialsLabel}
        />
        <LearningsFeed learnings={learnings} theme={theme} t={t} />
      </div>
    );
  };

  return (
    <div className="flex min-h-full flex-col bg-background font-sans">
      <AppHeader viewerHandle={viewerHandle} theme={theme} t={t} />
      <main className="flex-1 px-4 py-6 max-w-[680px] mx-auto w-full">{renderContent()}</main>
    </div>
  );
}
