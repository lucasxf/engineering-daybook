import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../AuthContext';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('@/lib/tokenStore', () => ({
  tokenStore: {
    load: jest.fn().mockResolvedValue(undefined),
    hasTokens: jest.fn(() => false),
    clear: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@/lib/api', () => ({
  setAuthFailureListener: jest.fn(),
  apiFetch: jest.fn(),
}));

jest.mock('@/lib/auth', () => ({
  getMeApi: jest.fn(),
  logoutApi: jest.fn().mockResolvedValue(undefined),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

const baseUser = {
  id: '1',
  email: 'test@example.com',
  handle: 'tester',
  name: 'Tester',
  locale: 'en',
  theme: 'system',
} as const;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AuthContext — updateUser', () => {
  it('merges the patch into the current user state', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Populate user state via setUser
    act(() => {
      result.current.setUser({ ...baseUser });
    });

    expect(result.current.user).toMatchObject(baseUser);

    // Apply a partial patch
    act(() => {
      result.current.updateUser({ name: 'Updated Name', locale: 'pt-BR' });
    });

    expect(result.current.user).toEqual({
      ...baseUser,
      name: 'Updated Name',
      locale: 'pt-BR',
    });
  });

  it('is a no-op when user is null', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // user starts as null (tokenStore.hasTokens returns false)
    expect(result.current.user).toBeNull();

    // Calling updateUser must not throw and must leave user as null
    act(() => {
      result.current.updateUser({ name: 'Ghost' });
    });

    expect(result.current.user).toBeNull();
  });
});
