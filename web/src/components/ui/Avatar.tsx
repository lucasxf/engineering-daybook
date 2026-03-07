import Image from 'next/image';

// Deterministic background colors derived from handle hash
const INITIALS_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-orange-500',
  'bg-teal-500',
];

function colorForHandle(handle: string): string {
  let hash = 0;
  for (let i = 0; i < handle.length; i++) {
    hash = (hash * 31 + handle.charCodeAt(i)) | 0;
  }
  return INITIALS_COLORS[Math.abs(hash) % INITIALS_COLORS.length];
}

interface AvatarProps {
  /** Public URL of the avatar image. When absent, shows an initials placeholder. */
  avatarUrl?: string | null;
  /** The user's display name — first letter used as the initials placeholder. */
  displayName: string;
  /** The user's handle — used to derive the placeholder background color. */
  handle: string;
  /** Diameter in pixels. Defaults to 40. */
  size?: number;
  className?: string;
}

/**
 * Displays a circular avatar image, or an initials placeholder when no image is set.
 *
 * The placeholder background color is deterministically derived from the user's handle
 * so the same user always gets the same color across sessions and devices.
 */
export function Avatar({ avatarUrl, displayName, handle, size = 40, className = '' }: AvatarProps) {
  const initial = displayName.trim().charAt(0).toUpperCase() || '?';
  const fontSize = Math.max(10, Math.round(size * 0.4));

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={`${displayName}'s avatar`}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  const bgColor = colorForHandle(handle);
  return (
    <span
      aria-label={`${displayName}'s avatar`}
      className={`inline-flex shrink-0 items-center justify-center rounded-full text-white font-medium ${bgColor} ${className}`}
      style={{ width: size, height: size, fontSize }}
    >
      {initial}
    </span>
  );
}
