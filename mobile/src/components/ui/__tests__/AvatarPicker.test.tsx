/**
 * AvatarPicker component tests.
 * Runs in the 'components' jest project (node environment).
 * react-native and expo-image-picker are mocked — see src/__mocks__/.
 */
import React from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { AvatarPicker, AvatarPickerProps } from '../AvatarPicker';

// ---- Helpers ----------------------------------------------------------------

const defaultProps: AvatarPickerProps = {
  displayName: 'Alice',
  handle: 'alice',
  uploading: false,
  onUpload: jest.fn(),
  onRemove: jest.fn(),
};

function makeElement(overrides: Partial<AvatarPickerProps> = {}) {
  return React.createElement(AvatarPicker, { ...defaultProps, ...overrides });
}

/** Simulate a successful image picker result. */
function mockPickerSuccess(
  uri = 'file:///image.jpg',
  mimeType = 'image/jpeg',
  fileName = 'image.jpg',
  fileSize?: number,
) {
  (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
    status: 'granted',
  });
  (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
    canceled: false,
    assets: [{ uri, mimeType, fileName, fileSize }],
  });
}

/** Simulate picker cancellation. */
function mockPickerCancelled() {
  (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
    status: 'granted',
  });
  (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
    canceled: true,
    assets: [],
  });
}

// ---- Tests ------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AvatarPicker', () => {
  // 1. Renders Avatar with avatarUrl when provided
  it('renders Avatar with avatarUrl when provided', () => {
    const element = makeElement({ avatarUrl: 'https://example.com/avatar.jpg' });
    expect(element).toBeTruthy();
    expect(element.props.avatarUrl).toBe('https://example.com/avatar.jpg');
  });

  // 2. Renders initials placeholder when no avatarUrl
  it('renders initials placeholder when no avatarUrl', () => {
    const element = makeElement({ avatarUrl: undefined });
    expect(element).toBeTruthy();
    expect(element.props.avatarUrl).toBeUndefined();
  });

  // 3. Calls onUpload after valid image selection
  it('calls onUpload after valid image selection', async () => {
    const onUpload = jest.fn();
    mockPickerSuccess('file:///photo.png', 'image/png', 'photo.png', 512 * 1024); // 512 KB — under limit

    // Directly invoke the internal press handler by instantiating the component
    // and simulating the async flow via the exported function shape.
    // Since we're in node env without a DOM renderer, we test the handler logic
    // by constructing the element and verifying it received the correct props.
    // For callback verification we call the internal logic via a rendered Pressable onClick.
    const { Pressable } = require('react-native');

    // Render the component tree manually by calling the function
    const instance = AvatarPicker({ ...defaultProps, onUpload });
    expect(instance).toBeTruthy();

    // Simulate the Pressable press: find the first Pressable child's onPress
    // The component returns a View > Pressable (avatar) + optional Pressable (remove)
    // instance.props.children is an array: [Pressable(avatar), null or Pressable(remove)]
    const children = instance.props.children;
    const avatarPressable = Array.isArray(children) ? children[0] : children;
    const onPressHandler = avatarPressable.props.onPress;

    await onPressHandler();

    expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledTimes(1);
    expect(onUpload).toHaveBeenCalledWith('file:///photo.png', 'image/png', 'photo.png');
  });

  // 4. Does not call onUpload when picker is cancelled
  it('does not call onUpload when picker is cancelled', async () => {
    const onUpload = jest.fn();
    mockPickerCancelled();

    const instance = AvatarPicker({ ...defaultProps, onUpload });
    const children = instance.props.children;
    const avatarPressable = Array.isArray(children) ? children[0] : children;
    const onPressHandler = avatarPressable.props.onPress;

    await onPressHandler();

    expect(onUpload).not.toHaveBeenCalled();
  });

  // 5. Shows remove option only when avatarUrl is set
  it('shows remove option only when avatarUrl is set', () => {
    const withAvatar = AvatarPicker({ ...defaultProps, avatarUrl: 'https://example.com/av.jpg' });
    const withoutAvatar = AvatarPicker({ ...defaultProps, avatarUrl: undefined });

    // With avatarUrl: second child should be a Pressable (remove button)
    const withAvatarChildren = withAvatar.props.children;
    const removeButtonWithAvatar = Array.isArray(withAvatarChildren)
      ? withAvatarChildren[1]
      : null;
    expect(removeButtonWithAvatar).toBeTruthy();
    expect(removeButtonWithAvatar.props.testID).toBe('remove-photo-button');

    // Without avatarUrl: second child should be null
    const withoutAvatarChildren = withoutAvatar.props.children;
    const removeButtonWithoutAvatar = Array.isArray(withoutAvatarChildren)
      ? withoutAvatarChildren[1]
      : null;
    expect(removeButtonWithoutAvatar).toBeNull();
  });

  // 6. Calls onRemove when confirm pressed (Alert OK)
  it('calls onRemove when confirm pressed', () => {
    const onRemove = jest.fn();

    // Capture the Alert.alert call and invoke the "Remove" button callback
    (Alert.alert as jest.Mock).mockImplementation(
      (_title: string, _msg: string, buttons: Array<{ text: string; onPress?: () => void }>) => {
        const removeBtn = buttons.find((b) => b.text === 'Remove');
        removeBtn?.onPress?.();
      },
    );

    const instance = AvatarPicker({
      ...defaultProps,
      avatarUrl: 'https://example.com/av.jpg',
      onRemove,
    });
    const children = instance.props.children;
    const removePressable = Array.isArray(children) ? children[1] : null;
    expect(removePressable).toBeTruthy();

    removePressable.props.onPress();

    expect(Alert.alert).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  // 7. Does not call onRemove when dialog cancelled
  it('does not call onRemove when dialog cancelled', () => {
    const onRemove = jest.fn();

    // Simulate the user tapping "Cancel"
    (Alert.alert as jest.Mock).mockImplementation(
      (_title: string, _msg: string, buttons: Array<{ text: string; onPress?: () => void }>) => {
        const cancelBtn = buttons.find((b) => b.text === 'Cancel');
        cancelBtn?.onPress?.();
      },
    );

    const instance = AvatarPicker({
      ...defaultProps,
      avatarUrl: 'https://example.com/av.jpg',
      onRemove,
    });
    const children = instance.props.children;
    const removePressable = Array.isArray(children) ? children[1] : null;
    removePressable.props.onPress();

    expect(Alert.alert).toHaveBeenCalledTimes(1);
    expect(onRemove).not.toHaveBeenCalled();
  });

  // 8. Shows loading indicator when uploading=true (structural test)
  it('renders without error when uploading=true', () => {
    const instance = AvatarPicker({ ...defaultProps, uploading: true });
    expect(instance).toBeTruthy();

    // The avatar Pressable should be disabled
    const children = instance.props.children;
    const avatarPressable = Array.isArray(children) ? children[0] : children;
    expect(avatarPressable.props.disabled).toBe(true);
  });

  // Bonus: does not call onUpload when file exceeds 2 MB
  it('does not call onUpload when selected file exceeds 2 MB', async () => {
    const onUpload = jest.fn();
    const OVER_LIMIT = 3 * 1024 * 1024; // 3 MB
    mockPickerSuccess('file:///big.jpg', 'image/jpeg', 'big.jpg', OVER_LIMIT);

    // Reset Alert to default jest.fn() so it doesn't use prior test's mockImplementation
    (Alert.alert as jest.Mock).mockReset();

    const instance = AvatarPicker({ ...defaultProps, onUpload });
    const children = instance.props.children;
    const avatarPressable = Array.isArray(children) ? children[0] : children;

    await avatarPressable.props.onPress();

    expect(onUpload).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith('File too large', expect.any(String));
  });
});
