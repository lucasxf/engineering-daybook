"use client";

import { Lock, BookOpen } from "lucide-react";
import { LearnimoWordmark } from "@/components/learnimo-wordmark";
import { ProfileHero, ProfileHeroSkeleton, type ProfileVariant } from "./profile-hero";
import { LearningCard, LearningCardSkeleton } from "./learning-card";

// ─── Mock data ───────────────────────────────────────────────────────────────

const MOCK_LEARNINGS = [
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

// ─── App Header ──────────────────────────────────────────────────────────────

interface AppHeaderProps {
  viewerHandle?: string;
  viewerAvatarUrl?: string;
  theme: "dark" | "light";
}

function AppHeader({ viewerHandle, theme }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between px-5 py-4 border-b border-card-border">
      <a
        href="#"
        aria-label="learnimo"
        className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-focus)]"
      >
        <LearnimoWordmark className="text-xl" />
      </a>

      {viewerHandle ? (
        <a
          href="#"
          className="flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-focus)]"
          aria-label={`Ir para perfil de @${viewerHandle}`}
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
          Entrar
        </a>
      )}
    </header>
  );
}

// ─── Private Profile ─────────────────────────────────────────────────────────

function PrivateProfile({ handle, theme }: { handle: string; theme: "dark" | "light" }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 px-6 text-center">
      <Lock
        className="h-8 w-8"
        aria-hidden="true"
        style={{ color: theme === "dark" ? "#8899AA" : "#999999" }}
      />
      <p
        className="font-heading text-xl font-semibold"
        style={{ color: "var(--color-card-foreground)" }}
      >
        @{handle}
      </p>
      <p className="text-sm" style={{ color: theme === "dark" ? "#8899AA" : "#666666" }}>
        Este perfil é privado
      </p>
    </div>
  );
}

// ─── Not Found ───────────────────────────────────────────────────────────────

function NotFound({ theme }: { theme: "dark" | "light" }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 px-6 text-center">
      <p
        className="font-heading text-xl font-semibold"
        style={{ color: "var(--color-card-foreground)" }}
      >
        Perfil não encontrado
      </p>
      <p className="text-sm" style={{ color: theme === "dark" ? "#8899AA" : "#666666" }}>
        O perfil que você está procurando não existe ou foi removido.
      </p>
    </div>
  );
}

// ─── Empty Learnings ─────────────────────────────────────────────────────────

function EmptyLearnings({ theme }: { theme: "dark" | "light" }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 px-6 text-center">
      <BookOpen
        className="h-10 w-10"
        aria-hidden="true"
        style={{ color: theme === "dark" ? "#2B4A78" : "#D1C9BC" }}
      />
      <p className="text-sm font-medium" style={{ color: theme === "dark" ? "#8899AA" : "#666666" }}>
        Nenhum aprendizado público ainda
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
  learnings: typeof MOCK_LEARNINGS;
  theme: "dark" | "light";
}

function LearningsFeed({ learnings, theme }: LearningsFeedProps) {
  return (
    <section aria-label="Aprendizados">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="font-heading text-[13px] font-semibold uppercase tracking-widest" style={{ color: "var(--color-handle)" }}>
          Aprendizados
        </h2>
        <div className="flex-1 h-px" style={{ backgroundColor: "var(--color-card-border)" }} />
      </div>

      {learnings.length === 0 ? (
        <EmptyLearnings theme={theme} />
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
}

export function LearnerProfileScreen({ variant, theme }: LearnerProfileScreenProps) {
  const profile = {
    displayName: "Lucas Fernandes",
    handle: "lucasxf",
    bio: "Engenheiro de software interessado em sistemas distribuídos, banco de dados e aprendizado contínuo. Escrevo sobre o que aprendo no dia a dia.",
    avatarUrl: null as string | null,
  };

  const renderContent = () => {
    if (variant === "loading") {
      return <LoadingState />;
    }

    if (variant === "not-found") {
      return <NotFound theme={theme} />;
    }

    if (variant === "private") {
      return <PrivateProfile handle={profile.handle} theme={theme} />;
    }

    const learnings =
      variant === "empty-learnings" ? [] : MOCK_LEARNINGS;
    const showBio =
      variant !== "no-bio" ? profile.bio : null;
    const avatarUrl =
      variant === "no-avatar" ? null : null; // always null — uses initials in mock

    return (
      <div className="flex flex-col gap-6">
        <ProfileHero
          displayName={profile.displayName}
          handle={profile.handle}
          bio={showBio}
          avatarUrl={avatarUrl}
          isFollowing={false}
          isOwnProfile={variant === "own-profile"}
          theme={theme}
          variant={variant}
        />
        <LearningsFeed learnings={learnings} theme={theme} />
      </div>
    );
  };

  return (
    <div
      className={`flex min-h-full flex-col bg-background font-sans${theme === "dark" ? "" : ""}`}
    >
      <AppHeader viewerHandle="ana.souza" theme={theme} />
      <main className="flex-1 px-4 py-6 max-w-[680px] mx-auto w-full">
        {renderContent()}
      </main>
    </div>
  );
}
