import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor, act, configure } from '@testing-library/react-native';
import { ProfileScreen } from '../ProfileScreen';

// Pre-configure host component names so RNTL skips detectHostComponentNames.
// Required because our react-native stub (node env) renders HTML elements, not RN fibers.
configure({
  hostComponentNames: {
    text: 'span',
    textInput: 'input',
    image: 'img',
    switch: 'input',
    scrollView: 'div',
    modal: 'div',
  },
});

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

jest.mock('@/lib/userApi', () => ({
  updateUserSettings: jest.fn(),
  uploadAvatar: jest.fn(),
  deleteAvatar: jest.fn(),
}));

jest.mock('@/lib/tokenStore', () => ({
  tokenStore: {
    load: jest.fn(),
    hasTokens: jest.fn(() => true),
    getAccessToken: jest.fn(() => 'tok'),
    clear: jest.fn(),
  },
}));

jest.mock('@/lib/api', () => ({
  setAuthFailureListener: jest.fn(),
  apiFetch: jest.fn(),
  ApiRequestError: class extends Error {
    status: number;
    constructor(status: number, msg: string) {
      super(msg);
      this.status = status;
    }
  },
}));

jest.mock('@/lib/auth', () => ({
  getMeApi: jest.fn(() =>
    Promise.resolve({
      id: '1',
      handle: 'alice',
      email: 'a@a.com',
      displayName: 'Alice',
      bio: 'My bio',
      avatarUrl: null,
      profileVisibility: 'PRIVATE',
      defaultPokVisibility: 'PRIVATE',
      locale: 'en',
      theme: 'system',
    })
  ),
  logoutApi: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({ canceled: true, assets: [] })),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/components/ui/AvatarPicker', () => ({
  AvatarPicker: ({ onUpload, onRemove }: { onUpload?: () => void; onRemove?: () => void }) => null,
}));

// ---------------------------------------------------------------------------
// Context mocks — defined before mock factories so we can spy on updateUser
// ---------------------------------------------------------------------------

const mockUpdateUser = jest.fn();

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: '#fff',
        surface: '#f9fafb',
        surfaceAlt: '#f3f4f6',
        border: '#e5e7eb',
        borderFocus: '#6366f1',
        primary: '#6366f1',
        primaryDark: '#4f46e5',
        textPrimary: '#111827',
        textSecondary: '#6b7280',
        textDisabled: '#d1d5db',
        textInverse: '#ffffff',
        error: '#ef4444',
        errorBackground: '#fee2e2',
        success: '#22c55e',
        warning: '#f59e0b',
      },
      spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
      radii: { sm: 4, md: 8, lg: 12, xl: 16, full: 9999 },
      typography: {
        sizes: { xs: 11, sm: 13, md: 15, lg: 17, xl: 20, xxl: 24, xxxl: 30 },
        weights: { regular: '400', medium: '500', semibold: '600', bold: '700' },
        lineHeights: { tight: 1.2, normal: 1.5, relaxed: 1.75 },
      },
    },
    override: 'system',
    setOverride: jest.fn(),
  }),
}));

jest.mock('@/contexts/I18nContext', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      if (key === 'profile.bioCharCount' && params) {
        return `${params.count}/200`;
      }
      return key;
    },
    locale: 'en',
    setAppLocale: jest.fn(),
  }),
}));

jest.mock('@/contexts/AuthContext', () => {
  // Stable user reference — avoids triggering the useEffect([user]) sync on every render.
  const stableUser = {
    id: '1',
    handle: 'alice',
    email: 'a@a.com',
    displayName: 'Alice',
    bio: 'My bio',
    avatarUrl: null,
    profileVisibility: 'PRIVATE',
    defaultPokVisibility: 'PRIVATE',
  };
  return {
    useAuth: () => ({
      user: stableUser,
      updateUser: mockUpdateUser,
      logout: jest.fn(),
    }),
  };
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

import { updateUserSettings } from '@/lib/userApi';

const mockUpdateUserSettings = updateUserSettings as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ProfileScreen', () => {
  it('renders displayName field pre-filled with user.displayName', () => {
    const { getByTestId } = render(<ProfileScreen />);
    const input = getByTestId('display-name-input');
    expect(input.props.value).toBe('Alice');
  });

  it('calls updateUserSettings with correct payload on display name save', async () => {
    mockUpdateUserSettings.mockResolvedValueOnce(undefined);

    const { getByTestId } = render(<ProfileScreen />);

    await act(async () => {
      fireEvent.changeText(getByTestId('display-name-input'), 'Alice Updated');
    });

    fireEvent.press(getByTestId('display-name-save-button'));

    await waitFor(() => {
      expect(mockUpdateUserSettings).toHaveBeenCalledWith({ displayName: 'Alice Updated' });
    });
  });

  it('calls updateUser on display name save success', async () => {
    mockUpdateUserSettings.mockResolvedValueOnce(undefined);

    const { getByTestId } = render(<ProfileScreen />);

    await act(async () => {
      fireEvent.changeText(getByTestId('display-name-input'), 'Alice Updated');
    });

    fireEvent.press(getByTestId('display-name-save-button'));

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({ displayName: 'Alice Updated' });
    });
  });

  it('shows error alert and reverts field on display name save failure', async () => {
    mockUpdateUserSettings.mockRejectedValueOnce(new Error('Network error'));

    const alertSpy = jest.spyOn(Alert, 'alert');

    const { getByTestId } = render(<ProfileScreen />);

    const input = getByTestId('display-name-input');
    fireEvent.changeText(input, 'Bad Name');

    fireEvent.press(getByTestId('display-name-save-button'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('profile.saveError');
    });

    // Field should have reverted to previous value
    expect(input.props.value).toBe('Alice');
  });

  it('renders bio field pre-filled with user.bio and shows char counter', () => {
    const { getByTestId } = render(<ProfileScreen />);

    const bioInput = getByTestId('bio-input');
    expect(bioInput.props.value).toBe('My bio');

    const charCount = getByTestId('bio-char-count');
    // "My bio" is 6 characters → should show "6/200"
    expect(charCount.props.children).toBe('6/200');
  });

  it('calls updateUserSettings with { bio } on bio save', async () => {
    mockUpdateUserSettings.mockResolvedValueOnce(undefined);

    const { getByTestId } = render(<ProfileScreen />);

    await act(async () => {
      fireEvent.changeText(getByTestId('bio-input'), 'Updated bio');
    });

    fireEvent.press(getByTestId('bio-save-button'));

    await waitFor(() => {
      expect(mockUpdateUserSettings).toHaveBeenCalledWith({ bio: 'Updated bio' });
    });
  });

  it('disables the Save button while bio save is in flight', async () => {
    // Never resolves during the test — keeps saving=true
    mockUpdateUserSettings.mockImplementationOnce(
      () => new Promise(() => {})
    );

    const { getByTestId } = render(<ProfileScreen />);

    const saveButton = getByTestId('bio-save-button');
    expect(saveButton.props.disabled).toBeFalsy();

    await act(async () => {
      fireEvent.press(saveButton);
    });

    // After pressing, button should be disabled (in-flight)
    expect(saveButton.props.disabled).toBe(true);
  });
});
