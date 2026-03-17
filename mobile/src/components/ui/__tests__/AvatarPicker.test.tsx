/**
 * AvatarPicker component tests.
 * Runs in the 'components' jest project (node environment).
 * Calls component as a plain function to execute all branches.
 */
import React from 'react';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        primary: '#D4854A',
        error: '#C0392B',
        textInverse: '#F5F0E8',
      },
      spacing: { xs: 4, sm: 8, md: 16 },
    },
  }),
}));

jest.mock('@/contexts/I18nContext', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

jest.mock('@/components/ui/Avatar', () => ({
  Avatar: (props: Record<string, unknown>) =>
    require('react').createElement('Avatar', props),
}));

jest.mock('@/components/ui/Text', () => ({
  Text: (props: Record<string, unknown>) =>
    require('react').createElement('Text', props),
}));

// react-native is mapped to __mocks__/react-native.js in jest.config.js.
// Alert.alert is already a jest.fn() in that mock — we spy on it below after import.

// expo-image-picker mock
const mockRequestPermission = jest.fn();
const mockLaunchImageLibrary = jest.fn();
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: (...args: unknown[]) => mockRequestPermission(...args),
  launchImageLibraryAsync: (...args: unknown[]) => mockLaunchImageLibrary(...args),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { Alert } from 'react-native';
import { AvatarPicker } from '../AvatarPicker';

// Convenience alias for the jest.fn() that lives in the RN mock
const mockAlert = Alert.alert as jest.Mock;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type ReactEl = { type: unknown; props: Record<string, unknown> };

function findAllByType(element: unknown, type: string): ReactEl[] {
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

const baseProps = {
  displayName: 'Alice',
  handle: 'alice',
  uploading: false,
  onUpload: jest.fn(),
  onRemove: jest.fn(),
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AvatarPicker', () => {
  beforeEach(() => {
    // resetAllMocks clears both call history AND implementations, preventing bleed-through
    jest.resetAllMocks();
    mockRequestPermission.mockResolvedValue({ status: 'granted' });
  });

  it('renders Avatar with avatarUrl when provided', () => {
    const result = AvatarPicker({ ...baseProps, avatarUrl: 'https://example.com/pic.jpg' });
    const avatars = findAllByType(result, 'Avatar');
    expect(avatars.length).toBe(1);
    expect(avatars[0].props.avatarUrl).toBe('https://example.com/pic.jpg');
  });

  it('renders initials placeholder when no avatarUrl', () => {
    const result = AvatarPicker({ ...baseProps, avatarUrl: undefined });
    const avatars = findAllByType(result, 'Avatar');
    expect(avatars.length).toBe(1);
    expect(avatars[0].props.avatarUrl).toBeUndefined();
  });

  it('calls onUpload after valid image selection', async () => {
    mockLaunchImageLibrary.mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: 'file://avatar.jpg',
          mimeType: 'image/jpeg',
          fileName: 'avatar.jpg',
          fileSize: 500_000,
        },
      ],
    });

    const result = AvatarPicker({ ...baseProps });
    // Pressable elements are React elements with type=Pressable (function); access onPress prop directly
    const pressables = findAllByType(result, 'Pressable');
    const onPress = pressables[0]?.props?.onPress as (() => Promise<void>) | undefined;
    if (onPress) await onPress();

    expect(baseProps.onUpload).toHaveBeenCalledWith(
      'file://avatar.jpg',
      'image/jpeg',
      'avatar.jpg'
    );
  });

  it('does not call onUpload when picker is cancelled', async () => {
    mockLaunchImageLibrary.mockResolvedValue({ canceled: true, assets: [] });

    const result = AvatarPicker({ ...baseProps });
    const pressables = findAllByType(result, 'Pressable');
    const onPress = pressables[0]?.props?.onPress as (() => Promise<void>) | undefined;
    if (onPress) await onPress();

    expect(baseProps.onUpload).not.toHaveBeenCalled();
  });

  it('shows remove option only when avatarUrl is set', () => {
    const withAvatar = AvatarPicker({ ...baseProps, avatarUrl: 'https://example.com/pic.jpg' });
    const texts = findAllByType(withAvatar, 'Text');
    const removeTexts = texts.filter((t) => t.props.children === 'profile.removeAvatar');
    expect(removeTexts.length).toBe(1);

    const withoutAvatar = AvatarPicker({ ...baseProps, avatarUrl: undefined });
    const texts2 = findAllByType(withoutAvatar, 'Text');
    const removeTexts2 = texts2.filter((t) => t.props.children === 'profile.removeAvatar');
    expect(removeTexts2.length).toBe(0);
  });

  it('calls onRemove when confirm button pressed in Alert', async () => {
    mockAlert.mockImplementation((_title, _msg, buttons) => {
      // Simulate the "Remove" (destructive) button being pressed
      const destructiveBtn = buttons?.find((b: { style?: string; onPress?: () => void }) => b.style === 'destructive');
      destructiveBtn?.onPress?.();
    });

    const onRemove = jest.fn();
    const result = AvatarPicker({ ...baseProps, avatarUrl: 'https://example.com/pic.jpg', onRemove });
    // find the "Remove photo" Text and call its onPress
    const texts = findAllByType(result, 'Text');
    const removeText = texts.find((t) => t.props.children === 'profile.removeAvatar');
    const onPress = removeText?.props?.onPress as (() => void) | undefined;
    onPress?.();

    expect(mockAlert).toHaveBeenCalled();
    expect(onRemove).toHaveBeenCalled();
  });

  it('does not call onRemove when dialog cancelled', async () => {
    mockAlert.mockImplementation((_title, _msg, buttons) => {
      // Simulate cancel button
      const cancelBtn = buttons?.find((b: { style?: string }) => b.style === 'cancel');
      // cancel button has no onPress in our usage (no-op)
      expect(cancelBtn).toBeTruthy();
    });

    const onRemove = jest.fn();
    const result = AvatarPicker({ ...baseProps, avatarUrl: 'https://example.com/pic.jpg', onRemove });
    const texts = findAllByType(result, 'Text');
    const removeText = texts.find((t) => t.props.children === 'profile.removeAvatar');
    const onPress = removeText?.props?.onPress as (() => void) | undefined;
    onPress?.();

    expect(onRemove).not.toHaveBeenCalled();
  });

  it('shows loading indicator when uploading=true', () => {
    const result = AvatarPicker({ ...baseProps, uploading: true });
    // ActivityIndicator is a named function in the RN mock — find by type name
    const indicators = findAllByType(result, 'ActivityIndicator');
    expect(indicators.length).toBeGreaterThan(0);
  });

  it('shows error alert and does not call onUpload for unsupported file type (AC12)', async () => {
    mockLaunchImageLibrary.mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: 'file://avatar.gif',
          mimeType: 'image/gif',
          fileName: 'avatar.gif',
          fileSize: 100_000,
        },
      ],
    });

    const result = AvatarPicker({ ...baseProps });
    const pressables = findAllByType(result, 'Pressable');
    const onPress = pressables[0]?.props?.onPress as (() => Promise<void>) | undefined;
    if (onPress) await onPress();

    expect(mockAlert).toHaveBeenCalledWith('profile.avatarUnsupportedType');
    expect(baseProps.onUpload).not.toHaveBeenCalled();
  });

  it('shows error alert and does not call onUpload for oversized image (AC6)', async () => {
    mockLaunchImageLibrary.mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: 'file://big.jpg',
          mimeType: 'image/jpeg',
          fileName: 'big.jpg',
          fileSize: 3 * 1024 * 1024, // 3 MB
        },
      ],
    });

    const result = AvatarPicker({ ...baseProps });
    const pressables = findAllByType(result, 'Pressable');
    const onPress = pressables[0]?.props?.onPress as (() => Promise<void>) | undefined;
    if (onPress) await onPress();

    expect(mockAlert).toHaveBeenCalledWith('profile.avatarTooLarge');
    expect(baseProps.onUpload).not.toHaveBeenCalled();
  });
});
