/**
 * Shared test utilities for auth screen tests.
 * Import findAllByType and mockTheme into each screen test file to avoid duplication.
 *
 * mockTheme re-exports lightTheme directly so tests always use the real token values
 * and never drift from the source of truth in tokens.ts.
 */

import { lightTheme } from '@/theme/tokens';

export type ReactEl = { type: unknown; props: Record<string, unknown> };

export const mockTheme = lightTheme;

export function findAllByType(element: unknown, type: string): ReactEl[] {
  const results: ReactEl[] = [];
  function walk(node: unknown) {
    if (!node || typeof node !== 'object') return;
    const el = node as ReactEl;
    if (el.type === type || (el.type as { name?: string })?.name === type) results.push(el);
    const children = (el.props as Record<string, unknown>)?.children;
    if (Array.isArray(children)) children.forEach(walk);
    else if (children) walk(children);
  }
  walk(element);
  return results;
}
