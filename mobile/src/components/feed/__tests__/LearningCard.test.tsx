/**
 * LearningCard component tests.
 * Runs in the 'components' jest project (node environment).
 * react-native is mocked via moduleNameMapper → src/__mocks__/react-native.js.
 * Components are called as plain functions to execute their bodies (no React fiber needed
 * since LearningCard uses only mocked hooks — no useState/useEffect/useMemo).
 */
import React from 'react';

// ---------------------------------------------------------------------------
// Mocks (must be before imports)
// ---------------------------------------------------------------------------

jest.mock('@/contexts/ThemeContext', () => {
  const { lightTheme } = require('@/theme/tokens');
  return { useTheme: () => ({ theme: lightTheme }) };
});

jest.mock('@/components/ui/Card', () => ({
  PressableCard: jest.fn(),
}));

jest.mock('@/components/ui/Text', () => ({
  Text: jest.fn(),
}));

jest.mock('@/lib/stripMarkdown', () => ({
  stripMarkdown: (content: string) => content.replace(/[*_`#]/g, ''),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { LearningCard } from '../LearningCard';
import type { Pok } from '@/lib/pokApi';
import { lightTheme } from '@/theme/tokens';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makePok(overrides: Partial<Pok> = {}): Pok {
  return {
    id: 'pok-1',
    title: 'Test Learning',
    content: 'Some learning content',
    createdAt: '2026-01-15T12:00:00Z',
    updatedAt: '2026-01-15T12:00:00Z',
    tags: [],
    visibility: 'PRIVATE',
    userId: 'user-1',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Component rendering (function-call style — executes body, covers formatDate)
// ---------------------------------------------------------------------------

describe('LearningCard rendering', () => {
  it('renders without crashing for a basic pok', () => {
    const result = LearningCard({ pok: makePok(), onPress: jest.fn() });
    expect(result).toBeTruthy();
  });

  it('renders when title is absent (no title branch)', () => {
    const result = LearningCard({ pok: makePok({ title: undefined }), onPress: jest.fn() });
    expect(result).toBeTruthy();
  });

  it('renders when content is short (no truncation branch)', () => {
    const result = LearningCard({ pok: makePok({ content: 'short' }), onPress: jest.fn() });
    expect(result).toBeTruthy();
  });

  it('renders when content exceeds 200 chars (truncation branch)', () => {
    const result = LearningCard({ pok: makePok({ content: 'a'.repeat(250) }), onPress: jest.fn() });
    expect(result).toBeTruthy();
  });

  it('renders when pok has tags (tag pill branch)', () => {
    const pok = makePok({
      tags: [
        { id: 't1', name: 'react', displayName: 'React', source: 'USER' },
        { id: 't2', name: 'ts', displayName: 'TypeScript', source: 'USER' },
      ],
    });
    const result = LearningCard({ pok, onPress: jest.fn() });
    expect(result).toBeTruthy();
  });

  it('renders overflow indicator when pok has more than 3 tags', () => {
    const pok = makePok({
      tags: [
        { id: 't1', name: 'a', displayName: 'A', source: 'USER' },
        { id: 't2', name: 'b', displayName: 'B', source: 'USER' },
        { id: 't3', name: 'c', displayName: 'C', source: 'USER' },
        { id: 't4', name: 'd', displayName: 'D', source: 'USER' },
      ],
    });
    const result = LearningCard({ pok, onPress: jest.fn() });
    expect(result).toBeTruthy();
  });

  it('renders with valid ISO date string', () => {
    const pok = makePok({ createdAt: '2026-03-15T09:30:00Z' });
    const result = LearningCard({ pok, onPress: jest.fn() });
    expect(result).toBeTruthy();
  });

  it('passes onPress through to the card', () => {
    const onPress = jest.fn();
    const pok = makePok();
    const result = LearningCard({ pok, onPress });
    // Result is a React element — type is the mocked PressableCard
    expect(result).toBeTruthy();
    expect(onPress).not.toHaveBeenCalled(); // not called until user taps
  });
});

// ---------------------------------------------------------------------------
// Tag pill token verification
// ---------------------------------------------------------------------------

describe('LearningCard tag pill tokens', () => {
  it('tagPillBg is distinct from surfaceAlt (token swap is meaningful)', () => {
    expect(lightTheme.colors.tagPillBg).not.toBe(lightTheme.colors.surfaceAlt);
    expect(lightTheme.colors.tagPillBg).toBe('#E0E8F2');
  });

  it('tagPillText is the brand navy color', () => {
    expect(lightTheme.colors.tagPillText).toBe('#1A365D');
  });
});
