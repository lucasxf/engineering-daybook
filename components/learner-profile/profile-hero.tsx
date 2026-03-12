"use client";

import { ProfileAvatar } from "./profile-avatar";

export type ProfileVariant =
  | "public-populated"
  | "no-avatar"
  | "no-bio"
  | "empty-learnings"
  | "loading"
  | "private"
  | "own-profile"
  | "not-found";

interface ProfileHeroProps {
  displayName: string;
  handle: string;
  bio?: string | null;
  avatarUrl?: string | null;
  isFollowing?: boolean;
  onFollow?: () => void;
  isOwnProfile?: boolean;
  theme: "dark" | "light";
  variant: ProfileVariant;
}

export function ProfileHeroSkeleton() {
  return (
    <div
      className="rounded-2xl border border-card-border bg-card px-6 py-6 animate-pulse"
      role="status"
      aria-label="Carregando perfil"
    >
      <div className="flex items-start gap-4">
        {/* Avatar skeleton */}
        <div className="h-20 w-20 flex-shrink-0 rounded-full bg-card-border" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-5 w-40 rounded bg-card-border" />
          <div className="h-3.5 w-24 rounded bg-card-border" />
          <div className="mt-3 h-3 w-full rounded bg-card-border" />
          <div className="h-3 w-3/4 rounded bg-card-border" />
        </div>
      </div>
      <div className="mt-4 h-9 w-28 rounded-lg bg-card-border" />
    </div>
  );
}

export function ProfileHero({
  displayName,
  handle,
  bio,
  avatarUrl,
  isFollowing = false,
  onFollow,
  isOwnProfile = false,
  theme,
  variant,
}: ProfileHeroProps) {
  const showAvatar = variant !== "no-avatar";

  return (
    <div className="rounded-2xl border border-card-border bg-card px-6 py-6 shadow-sm">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        {showAvatar ? (
          <ProfileAvatar
            avatarUrl={avatarUrl}
            displayName={displayName}
            size={80}
            theme={theme}
          />
        ) : (
          <ProfileAvatar
            avatarUrl={null}
            displayName={displayName}
            size={80}
            theme={theme}
          />
        )}

        {/* Identity */}
        <div className="flex-1 min-w-0">
          <h1 className="font-heading text-[22px] font-semibold leading-tight text-card-foreground text-balance">
            {displayName}
          </h1>
          <p className="mt-0.5 text-sm font-medium" style={{ color: "var(--color-handle)" }}>
            @{handle}
          </p>

          {bio && (
            <p className="mt-2 text-sm leading-relaxed line-clamp-3" style={{ color: "var(--color-bio)" }}>
              {bio}
            </p>
          )}
        </div>
      </div>

      {/* Action row */}
      <div className="mt-4">
        {isOwnProfile ? (
          <a
            href="#"
            className="text-sm font-medium transition-colors"
            style={{ color: "var(--color-link)" }}
          >
            Editar perfil
          </a>
        ) : (
          <button
            onClick={onFollow}
            aria-pressed={isFollowing}
            className={[
              "rounded-lg px-5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-focus)]",
              isFollowing
                ? "border bg-transparent font-medium"
                : "text-white",
            ].join(" ")}
            style={
              isFollowing
                ? {
                    borderColor: theme === "dark" ? "#2B4A78" : "#CCCCCC",
                    color: theme === "dark" ? "#8899AA" : "#666666",
                  }
                : { backgroundColor: "#D4854A" }
            }
          >
            {isFollowing ? "Seguindo" : "Seguir"}
          </button>
        )}
      </div>
    </div>
  );
}
