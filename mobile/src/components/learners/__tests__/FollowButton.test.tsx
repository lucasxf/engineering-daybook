/**
 * FollowButton component tests.
 * Runs in the 'components' jest project (node environment).
 * Uses pure logic testing via getButtonConfig + React.createElement element tests.
 */
import React from 'react';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockFollowLearner = jest.fn();
const mockUnfollowLearner = jest.fn();

jest.mock('@/lib/learnerApi', () => ({
  followLearner: (...args: unknown[]) => mockFollowLearner(...args),
  unfollowLearner: (...args: unknown[]) => mockUnfollowLearner(...args),
}));

jest.mock('@/contexts/I18nContext', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        primary: '#000',
        textInverse: '#fff',
        border: '#ccc',
        surfaceAlt: '#f0f0f0',
        textPrimary: '#111',
        textDisabled: '#999',
        error: '#f00',
        errorBackground: '#ffe',
        textSecondary: '#555',
      },
      spacing: { sm: 4, md: 8 },
      radii: { md: 4 },
      typography: {
        sizes: { xs: 10, sm: 12, md: 14, lg: 16, xl: 20, xxl: 24, xxxl: 28 },
        weights: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      },
    },
  }),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks are set up)
// ---------------------------------------------------------------------------

import { FollowButton, getButtonConfig } from '../FollowButton';
import type { RelationshipStatus } from '@/lib/learnerApi';

// ---------------------------------------------------------------------------
// Helpers for test labels (mirrors the mock: t(key) => key)
// ---------------------------------------------------------------------------

const LABELS = {
  follow: 'learners.social.follow',
  following: 'learners.social.following',
  followBack: 'learners.social.followBack',
  colleague: 'learners.social.colleague',
};

// ---------------------------------------------------------------------------
// getButtonConfig — pure label/variant/action mapping
// ---------------------------------------------------------------------------

describe('getButtonConfig', () => {
  it('NONE → Follow, primary, follow action, next status FOLLOWING', () => {
    const cfg = getButtonConfig('NONE', LABELS);
    expect(cfg.label).toBe(LABELS.follow);
    expect(cfg.variant).toBe('primary');
    expect(cfg.apiAction).toBe('follow');
    expect(cfg.nextStatus).toBe('FOLLOWING');
  });

  it('FOLLOWING → Following, secondary, unfollow action, next status NONE', () => {
    const cfg = getButtonConfig('FOLLOWING', LABELS);
    expect(cfg.label).toBe(LABELS.following);
    expect(cfg.variant).toBe('secondary');
    expect(cfg.apiAction).toBe('unfollow');
    expect(cfg.nextStatus).toBe('NONE');
  });

  it('FOLLOWED_BY → Follow back, primary, follow action, next status COLLEAGUE', () => {
    const cfg = getButtonConfig('FOLLOWED_BY', LABELS);
    expect(cfg.label).toBe(LABELS.followBack);
    expect(cfg.variant).toBe('primary');
    expect(cfg.apiAction).toBe('follow');
    expect(cfg.nextStatus).toBe('COLLEAGUE');
  });

  it('COLLEAGUE → Colleague, secondary, unfollow action, next status FOLLOWED_BY', () => {
    const cfg = getButtonConfig('COLLEAGUE', LABELS);
    expect(cfg.label).toBe(LABELS.colleague);
    expect(cfg.variant).toBe('secondary');
    expect(cfg.apiAction).toBe('unfollow');
    expect(cfg.nextStatus).toBe('FOLLOWED_BY');
  });

  it('covers all 4 RelationshipStatus values without exhaustive errors', () => {
    const statuses: RelationshipStatus[] = ['NONE', 'FOLLOWING', 'FOLLOWED_BY', 'COLLEAGUE'];
    for (const status of statuses) {
      const cfg = getButtonConfig(status, LABELS);
      expect(cfg.label).toBeTruthy();
      expect(['primary', 'secondary']).toContain(cfg.variant);
      expect(['follow', 'unfollow']).toContain(cfg.apiAction);
      expect(cfg.nextStatus).toBeTruthy();
    }
  });
});

// ---------------------------------------------------------------------------
// FollowButton component — construction and element-level tests
// ---------------------------------------------------------------------------

describe('FollowButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('is a valid React component (function)', () => {
    expect(typeof FollowButton).toBe('function');
  });

  it('creates a React element for NONE status', () => {
    const el = React.createElement(FollowButton, {
      handle: 'alice',
      relationshipStatus: 'NONE',
    });
    expect(el).toBeTruthy();
    expect(el.type).toBe(FollowButton);
    expect(el.props.relationshipStatus).toBe('NONE');
    expect(el.props.handle).toBe('alice');
  });

  it('creates a React element for FOLLOWING status', () => {
    const el = React.createElement(FollowButton, {
      handle: 'bob',
      relationshipStatus: 'FOLLOWING',
    });
    expect(el.props.relationshipStatus).toBe('FOLLOWING');
  });

  it('creates a React element for FOLLOWED_BY status', () => {
    const el = React.createElement(FollowButton, {
      handle: 'carol',
      relationshipStatus: 'FOLLOWED_BY',
    });
    expect(el.props.relationshipStatus).toBe('FOLLOWED_BY');
  });

  it('creates a React element for COLLEAGUE status', () => {
    const el = React.createElement(FollowButton, {
      handle: 'dave',
      relationshipStatus: 'COLLEAGUE',
    });
    expect(el.props.relationshipStatus).toBe('COLLEAGUE');
  });

  it('accepts optional onRelationshipChange callback prop', () => {
    const cb = jest.fn();
    const el = React.createElement(FollowButton, {
      handle: 'eve',
      relationshipStatus: 'NONE',
      onRelationshipChange: cb,
    });
    expect(el.props.onRelationshipChange).toBe(cb);
  });
});

// ---------------------------------------------------------------------------
// API integration — simulate the press handler logic indirectly
// ---------------------------------------------------------------------------

describe('FollowButton API integration (via getButtonConfig + mocked API)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls followLearner on NONE tap (simulated)', async () => {
    mockFollowLearner.mockResolvedValueOnce(undefined);
    const config = getButtonConfig('NONE', LABELS);
    // Simulate what the press handler does
    if (config.apiAction === 'follow') {
      await mockFollowLearner('alice');
    } else {
      await mockUnfollowLearner('alice');
    }
    expect(mockFollowLearner).toHaveBeenCalledWith('alice');
    expect(mockUnfollowLearner).not.toHaveBeenCalled();
  });

  it('calls unfollowLearner on FOLLOWING tap (simulated)', async () => {
    mockUnfollowLearner.mockResolvedValueOnce(undefined);
    const config = getButtonConfig('FOLLOWING', LABELS);
    if (config.apiAction === 'follow') {
      await mockFollowLearner('bob');
    } else {
      await mockUnfollowLearner('bob');
    }
    expect(mockUnfollowLearner).toHaveBeenCalledWith('bob');
    expect(mockFollowLearner).not.toHaveBeenCalled();
  });

  it('calls followLearner on FOLLOWED_BY tap (simulated)', async () => {
    mockFollowLearner.mockResolvedValueOnce(undefined);
    const config = getButtonConfig('FOLLOWED_BY', LABELS);
    if (config.apiAction === 'follow') {
      await mockFollowLearner('carol');
    } else {
      await mockUnfollowLearner('carol');
    }
    expect(mockFollowLearner).toHaveBeenCalledWith('carol');
    expect(mockUnfollowLearner).not.toHaveBeenCalled();
  });

  it('calls unfollowLearner on COLLEAGUE tap (simulated)', async () => {
    mockUnfollowLearner.mockResolvedValueOnce(undefined);
    const config = getButtonConfig('COLLEAGUE', LABELS);
    if (config.apiAction === 'follow') {
      await mockFollowLearner('dave');
    } else {
      await mockUnfollowLearner('dave');
    }
    expect(mockUnfollowLearner).toHaveBeenCalledWith('dave');
    expect(mockFollowLearner).not.toHaveBeenCalled();
  });

  it('resolves onRelationshipChange with FOLLOWING after NONE follow', async () => {
    mockFollowLearner.mockResolvedValueOnce(undefined);
    const cb = jest.fn();
    const config = getButtonConfig('NONE', LABELS);
    await mockFollowLearner('alice');
    cb(config.nextStatus);
    expect(cb).toHaveBeenCalledWith('FOLLOWING');
  });

  it('resolves onRelationshipChange with NONE after FOLLOWING unfollow', async () => {
    mockUnfollowLearner.mockResolvedValueOnce(undefined);
    const cb = jest.fn();
    const config = getButtonConfig('FOLLOWING', LABELS);
    await mockUnfollowLearner('bob');
    cb(config.nextStatus);
    expect(cb).toHaveBeenCalledWith('NONE');
  });

  it('resolves onRelationshipChange with COLLEAGUE after FOLLOWED_BY follow', async () => {
    mockFollowLearner.mockResolvedValueOnce(undefined);
    const cb = jest.fn();
    const config = getButtonConfig('FOLLOWED_BY', LABELS);
    await mockFollowLearner('carol');
    cb(config.nextStatus);
    expect(cb).toHaveBeenCalledWith('COLLEAGUE');
  });

  it('resolves onRelationshipChange with FOLLOWED_BY after COLLEAGUE unfollow', async () => {
    mockUnfollowLearner.mockResolvedValueOnce(undefined);
    const cb = jest.fn();
    const config = getButtonConfig('COLLEAGUE', LABELS);
    await mockUnfollowLearner('dave');
    cb(config.nextStatus);
    expect(cb).toHaveBeenCalledWith('FOLLOWED_BY');
  });
});
