const TAG_COLOR_PALETTE: Record<string, string> = {
  blue: '#3b82f6',
  green: '#22c55e',
  red: '#ef4444',
  purple: '#a855f7',
  yellow: '#eab308',
  orange: '#f97316',
  pink: '#ec4899',
  teal: '#14b8a6',
};

/** Maps a named tag color to its CSS hex value. Falls back to slate-500 for unknown colors. */
export function resolveTagColor(color: string): string {
  return TAG_COLOR_PALETTE[color] ?? '#6b7280';
}
