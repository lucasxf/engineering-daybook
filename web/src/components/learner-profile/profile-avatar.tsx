"use client";

interface ProfileAvatarProps {
  avatarUrl?: string | null;
  displayName: string;
  size?: number;
  altText?: string;
  initialsLabel?: string;
}

function getInitialsBg(theme: "dark" | "light") {
  return theme === "dark" ? "#2B4A78" : "#E0E8F2";
}

function getInitialsText(theme: "dark" | "light") {
  return theme === "dark" ? "#F5F0E8" : "#1A365D";
}

export function ProfileAvatar({
  avatarUrl,
  displayName,
  size = 80,
  theme = "dark",
  altText,
  initialsLabel,
}: ProfileAvatarProps & { theme?: "dark" | "light" }) {
  const initial = displayName.trim().charAt(0).toUpperCase();

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={altText ?? `Avatar de ${displayName}`}
        width={size}
        height={size}
        className="rounded-full object-cover ring-2 ring-card-border"
        style={{ width: size, height: size, flexShrink: 0 }}
        crossOrigin="anonymous"
      />
    );
  }

  return (
    <div
      aria-label={initialsLabel ?? `Iniciais de ${displayName}`}
      role="img"
      className="rounded-full flex items-center justify-center font-heading font-semibold select-none flex-shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: getInitialsBg(theme),
        color: getInitialsText(theme),
        fontSize: size * 0.38,
      }}
    >
      {initial}
    </div>
  );
}
