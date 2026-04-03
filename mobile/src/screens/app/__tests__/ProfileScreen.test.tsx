/**
 * ProfileScreen tests — profile editing behaviour.
 * Runs in the 'screens' jest project (node environment).
 * Uses function-call style with fully mocked hooks and dependencies.
 */
import React from 'react';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useState: (init: unknown) => [init, jest.fn()],
    useEffect: jest.fn(),
    useCallback: (fn: unknown) => fn,
    useMemo: (fn: () => unknown) => fn(),
    useRef: (init: unknown) => ({ current: init }),
  };
});

const mockSetOverride = jest.fn();
const mockSetAppLocale = jest.fn();

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: require('../../../theme/tokens').lightTheme,
    override: 'system',
    setOverride: mockSetOverride,
  }),
}));

jest.mock('@/contexts/I18nContext', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: 'en',
    setAppLocale: mockSetAppLocale,
  }),
}));

const mockUpdateUser = jest.fn();
const mockLogout = jest.fn();
const mockUser = {
  handle: 'alice',
  email: 'alice@example.com',
  displayName: 'Alice',
  bio: 'Learning is fun',
  avatarUrl: null,
  profileVisibility: 'PRIVATE' as const,
  defaultPokVisibility: 'PRIVATE' as const,
};

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser, logout: mockLogout, updateUser: mockUpdateUser }),
}));

const mockUpdateUserSettings = jest.fn();
const mockUploadAvatar = jest.fn();
const mockDeleteAvatar = jest.fn();
jest.mock('@/lib/userApi', () => ({
  updateUserSettings: (...args: unknown[]) => mockUpdateUserSettings(...args),
  uploadAvatar: (...args: unknown[]) => mockUploadAvatar(...args),
  deleteAvatar: (...args: unknown[]) => mockDeleteAvatar(...args),
}));

jest.mock('@/components/ui/Button', () => ({
  Button: (props: Record<string, unknown>) => require('react').createElement('Button', props),
}));

jest.mock('@/components/ui/Card', () => ({
  Card: ({ children, ...rest }: Record<string, unknown>) =>
    require('react').createElement('Card', rest, children),
}));

jest.mock('@/components/ui/Text', () => ({
  Text: (props: Record<string, unknown>) => require('react').createElement('Text', props),
}));

jest.mock('@/components/ui/TextInput', () => ({
  TextInput: (props: Record<string, unknown>) => require('react').createElement('TextInput', props),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: (props: Record<string, unknown>) => require('react').createElement('Ionicons', props),
}));

jest.mock('@/components/ui/AvatarPicker', () => ({
  AvatarPicker: (props: Record<string, unknown>) => require('react').createElement('AvatarPicker', props),
}));

jest.mock('@react-navigation/native-stack', () => ({}));

// ---------------------------------------------------------------------------
// Import under test (after mocks)
// ---------------------------------------------------------------------------

import { Alert } from 'react-native';
import { ProfileScreen } from '../ProfileScreen';

const mockAlert = Alert.alert as jest.Mock;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type ReactEl = { type: unknown; props: Record<string, unknown> };

function findAllByType(element: unknown, type: string): ReactEl[] {
  const results: ReactEl[] = [];
  function walk(node: unknown) {
    if (!node) return;
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (typeof node !== 'object') return;
    const el = node as ReactEl;
    if (el.type === type || (el.type as { name?: string })?.name === type) results.push(el);
    const children = (el.props as Record<string, unknown>)?.children;
    if (Array.isArray(children)) children.forEach(walk);
    else if (children) walk(children);
  }
  walk(element);
  return results;
}

function findButton(result: unknown, label: string): ReactEl | undefined {
  return findAllByType(result, 'Button').find((b) => b.props.label === label);
}

function findTextInput(result: unknown, accessibilityLabel: string): ReactEl | undefined {
  return findAllByType(result, 'TextInput').find(
    (ti) => ti.props.accessibilityLabel === accessibilityLabel
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ProfileScreen — profile editing', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // Re-mock useEffect and useCallback since resetAllMocks clears them
    (require('react') as Record<string, unknown>).useEffect = jest.fn();
    (require('react') as Record<string, unknown>).useCallback = (fn: unknown) => fn;
    (require('react') as Record<string, unknown>).useMemo = (fn: () => unknown) => fn();
    (require('react') as Record<string, unknown>).useState = (init: unknown) => [init, jest.fn()];
  });

  it('renders displayName TextInput pre-filled with user.displayName', () => {
    const result = ProfileScreen({} as never);
    const input = findTextInput(result, 'profile.displayNamePlaceholder');
    expect(input).toBeDefined();
    expect(input?.props.value).toBe('Alice');
  });

  it('calls updateUserSettings on display name Save', async () => {
    mockUpdateUserSettings.mockResolvedValue(undefined);
    const result = ProfileScreen({} as never);
    const saveBtn = findButton(result, 'profile.displayNameSave');
    await (saveBtn?.props.onPress as () => Promise<void>)();
    expect(mockUpdateUserSettings).toHaveBeenCalledWith({ displayName: 'Alice' });
  });

  it('calls updateUser after successful display name save', async () => {
    mockUpdateUserSettings.mockResolvedValue(undefined);
    const result = ProfileScreen({} as never);
    const saveBtn = findButton(result, 'profile.displayNameSave');
    await (saveBtn?.props.onPress as () => Promise<void>)();
    expect(mockUpdateUser).toHaveBeenCalledWith({ displayName: 'Alice' });
  });

  it('shows error alert and reverts when display name save fails', async () => {
    mockUpdateUserSettings.mockRejectedValue(new Error('Network error'));
    const result = ProfileScreen({} as never);
    const saveBtn = findButton(result, 'profile.displayNameSave');
    await (saveBtn?.props.onPress as () => Promise<void>)();
    expect(mockAlert).toHaveBeenCalledWith('profile.saveError');
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it('renders bio TextInput pre-filled and shows char counter', () => {
    const result = ProfileScreen({} as never);
    const input = findTextInput(result, 'profile.bioPlaceholder');
    expect(input).toBeDefined();
    expect(input?.props.value).toBe('Learning is fun');
    // char counter text element — t() returns the key, so children is 'profile.bioCharCount'
    const texts = findAllByType(result, 'Text');
    const counter = texts.find((t) => t.props.children === 'profile.bioCharCount');
    expect(counter).toBeDefined();
  });

  it('calls updateUserSettings with bio on bio Save', async () => {
    mockUpdateUserSettings.mockResolvedValue(undefined);
    const result = ProfileScreen({} as never);
    const saveBtn = findButton(result, 'profile.bioSave');
    await (saveBtn?.props.onPress as () => Promise<void>)();
    expect(mockUpdateUserSettings).toHaveBeenCalledWith({ bio: 'Learning is fun' });
  });

  it('Save button has disabled=false when not saving (default state)', () => {
    const result = ProfileScreen({} as never);
    // With useState returning [init, jest.fn()], displayNameSaving = false
    const saveBtn = findButton(result, 'profile.displayNameSave');
    expect(saveBtn?.props.disabled).toBe(false);
  });

  it('calls uploadAvatar and updateUser on avatar upload success', async () => {
    mockUploadAvatar.mockResolvedValue({ avatarUrl: 'https://example.com/new.jpg' });
    const result = ProfileScreen({} as never);
    const avatarPicker = findAllByType(result, 'AvatarPicker')[0];
    const onUpload = avatarPicker?.props?.onUpload as (uri: string, type: string, name: string) => Promise<void>;
    await onUpload('file://photo.jpg', 'image/jpeg', 'photo.jpg');
    expect(mockUploadAvatar).toHaveBeenCalledWith('file://photo.jpg', 'image/jpeg', 'photo.jpg');
    expect(mockUpdateUser).toHaveBeenCalledWith({ avatarUrl: 'https://example.com/new.jpg' });
  });

  it('shows error alert when avatar upload fails', async () => {
    mockUploadAvatar.mockRejectedValue(new Error('Network error'));
    const result = ProfileScreen({} as never);
    const avatarPicker = findAllByType(result, 'AvatarPicker')[0];
    const onUpload = avatarPicker?.props?.onUpload as (uri: string, type: string, name: string) => Promise<void>;
    await onUpload('file://photo.jpg', 'image/jpeg', 'photo.jpg');
    expect(mockAlert).toHaveBeenCalledWith('profile.saveError');
  });

  it('calls deleteAvatar and updateUser on avatar remove', async () => {
    mockDeleteAvatar.mockResolvedValue(undefined);
    const result = ProfileScreen({} as never);
    const avatarPicker = findAllByType(result, 'AvatarPicker')[0];
    const onRemove = avatarPicker?.props?.onRemove as () => Promise<void>;
    await onRemove();
    expect(mockDeleteAvatar).toHaveBeenCalled();
    expect(mockUpdateUser).toHaveBeenCalledWith({ avatarUrl: undefined });
  });

  it('calls updateUserSettings on profile visibility change', async () => {
    mockUpdateUserSettings.mockResolvedValue(undefined);
    const result = ProfileScreen({} as never);
    // Privacy visibility buttons have label 'profile.privacy.public' or 'profile.privacy.private'
    const publicBtn = findButton(result, 'profile.privacy.public');
    await (publicBtn?.props.onPress as () => Promise<void>)();
    expect(mockUpdateUserSettings).toHaveBeenCalledWith({ profileVisibility: 'PUBLIC' });
  });

  it('shows Alert on profile visibility change failure', async () => {
    mockUpdateUserSettings.mockRejectedValue(new Error('Network error'));
    const result = ProfileScreen({} as never);
    const publicBtn = findButton(result, 'profile.privacy.public');
    await (publicBtn?.props.onPress as () => Promise<void>)();
    expect(mockAlert).toHaveBeenCalledWith('profile.privacy.saveError');
  });

  it('calls Alert.alert on logout button press', () => {
    const result = ProfileScreen({} as never);
    const logoutBtn = findButton(result, 'profile.logoutButton');
    (logoutBtn?.props.onPress as () => void)();
    expect(mockAlert).toHaveBeenCalledWith(
      'profile.logoutConfirmTitle',
      '',
      expect.any(Array)
    );
  });
});

describe('ProfileScreen — theme/locale auto-save', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (require('react') as Record<string, unknown>).useEffect = jest.fn();
    (require('react') as Record<string, unknown>).useCallback = (fn: unknown) => fn;
    (require('react') as Record<string, unknown>).useMemo = (fn: () => unknown) => fn();
    (require('react') as Record<string, unknown>).useState = (init: unknown) => [init, jest.fn()];
  });

  it('calls updateUserSettings with theme on theme button press', async () => {
    mockUpdateUserSettings.mockResolvedValue(undefined);
    const result = ProfileScreen({} as never);
    const lightBtn = findButton(result, 'profile.themeOptions.light');
    await (lightBtn?.props.onPress as () => Promise<void>)();
    expect(mockUpdateUserSettings).toHaveBeenCalledWith({ theme: 'light' });
  });

  it('calls setOverride optimistically on theme change', async () => {
    mockUpdateUserSettings.mockResolvedValue(undefined);
    const result = ProfileScreen({} as never);
    const darkBtn = findButton(result, 'profile.themeOptions.dark');
    await (darkBtn?.props.onPress as () => Promise<void>)();
    expect(mockSetOverride).toHaveBeenCalledWith('dark');
  });

  it('reverts setOverride on theme save failure', async () => {
    mockUpdateUserSettings.mockRejectedValue(new Error('Network error'));
    const result = ProfileScreen({} as never);
    const lightBtn = findButton(result, 'profile.themeOptions.light');
    await (lightBtn?.props.onPress as () => Promise<void>)();
    // First call: optimistic apply 'light'; second call: rollback to prev ('system')
    expect(mockSetOverride).toHaveBeenCalledTimes(2);
    expect(mockSetOverride).toHaveBeenNthCalledWith(1, 'light');
    expect(mockSetOverride).toHaveBeenNthCalledWith(2, 'system');
  });

  it('calls updateUserSettings with locale on locale button press', async () => {
    mockUpdateUserSettings.mockResolvedValue(undefined);
    const result = ProfileScreen({} as never);
    const ptBtn = findButton(result, 'profile.languageOptions.ptBR');
    await (ptBtn?.props.onPress as () => Promise<void>)();
    expect(mockUpdateUserSettings).toHaveBeenCalledWith({ locale: 'pt-BR' });
  });

  it('calls setAppLocale optimistically on locale change', async () => {
    mockUpdateUserSettings.mockResolvedValue(undefined);
    const result = ProfileScreen({} as never);
    const ptBtn = findButton(result, 'profile.languageOptions.ptBR');
    await (ptBtn?.props.onPress as () => Promise<void>)();
    expect(mockSetAppLocale).toHaveBeenCalledWith('pt-BR');
  });

  it('reverts setAppLocale on locale save failure', async () => {
    mockUpdateUserSettings.mockRejectedValue(new Error('Network error'));
    const result = ProfileScreen({} as never);
    const ptBtn = findButton(result, 'profile.languageOptions.ptBR');
    await (ptBtn?.props.onPress as () => Promise<void>)();
    // First call: optimistic 'pt-BR'; second call: rollback to prev ('en')
    expect(mockSetAppLocale).toHaveBeenCalledTimes(2);
    expect(mockSetAppLocale).toHaveBeenNthCalledWith(1, 'pt-BR');
    expect(mockSetAppLocale).toHaveBeenNthCalledWith(2, 'en');
  });

  it('theme button has disabled prop reflecting isSavingSettings (false when idle)', () => {
    const result = ProfileScreen({} as never);
    const systemBtn = findButton(result, 'profile.themeOptions.system');
    // isSavingSettings starts false (both isSavingTheme and isSavingLocale are false)
    expect(systemBtn?.props.disabled).toBe(false);
  });
});
