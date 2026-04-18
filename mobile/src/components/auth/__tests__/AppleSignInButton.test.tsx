/**
 * AppleSignInButton component tests.
 * Runs in the 'components' jest project (node environment).
 * Calls component as a plain function — no RTL render needed.
 */
import React from 'react';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('expo-apple-authentication', () => ({
  AppleAuthenticationButton: 'AppleAuthenticationButton',
  AppleAuthenticationButtonType: { SIGN_IN: 0 },
  AppleAuthenticationButtonStyle: { BLACK: 0 },
  AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 },
  AppleAuthenticationError: { CANCELED: 'ERR_REQUEST_CANCELED' },
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  StyleSheet: { create: (s: any) => s },
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { AppleSignInButton } from '../AppleSignInButton';

// ---------------------------------------------------------------------------
// Tree traversal helpers
// ---------------------------------------------------------------------------

function findAllByType(element: any, type: string): any[] {
  const results: any[] = [];
  function walk(el: any) {
    if (!el) return;
    if (Array.isArray(el)) { el.forEach(walk); return; }
    if (typeof el !== 'object') return;
    if (el.type === type || (el.type as any)?.name === type) results.push(el);
    [el.props?.children].flat().forEach(walk);
  }
  walk(element);
  return results;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AppleSignInButton', () => {
  describe('on iOS', () => {
    beforeEach(() => {
      // Ensure Platform.OS is 'ios' (default from mock)
      require('react-native').Platform.OS = 'ios';
    });

    it('renders the AppleAuthenticationButton on iOS', () => {
      const result = AppleSignInButton({ onPress: jest.fn() });
      expect(result).not.toBeNull();
      const buttons = findAllByType(result, 'AppleAuthenticationButton');
      expect(buttons).toHaveLength(1);
    });

    it('uses SIGN_IN button type', () => {
      const result = AppleSignInButton({ onPress: jest.fn() });
      const buttons = findAllByType(result, 'AppleAuthenticationButton');
      expect(buttons[0].props.buttonType).toBe(0); // AppleAuthenticationButtonType.SIGN_IN
    });

    it('uses BLACK button style (NFR3: App Store compliant)', () => {
      const result = AppleSignInButton({ onPress: jest.fn() });
      const buttons = findAllByType(result, 'AppleAuthenticationButton');
      expect(buttons[0].props.buttonStyle).toBe(0); // AppleAuthenticationButtonStyle.BLACK
    });

    it('passes onPress to the button when not loading', () => {
      const onPress = jest.fn();
      const result = AppleSignInButton({ onPress });
      const buttons = findAllByType(result, 'AppleAuthenticationButton');
      expect(buttons[0].props.onPress).toBe(onPress);
    });

    it('sets onPress to undefined when loading=true (prevent double-tap)', () => {
      const onPress = jest.fn();
      const result = AppleSignInButton({ onPress, loading: true });
      const buttons = findAllByType(result, 'AppleAuthenticationButton');
      expect(buttons[0].props.onPress).toBeUndefined();
    });

    it('loading defaults to false', () => {
      const onPress = jest.fn();
      const result = AppleSignInButton({ onPress });
      const buttons = findAllByType(result, 'AppleAuthenticationButton');
      // When loading=false, onPress should be passed through
      expect(buttons[0].props.onPress).toBe(onPress);
    });
  });

  describe('on Android', () => {
    let originalPlatform: any;

    beforeEach(() => {
      originalPlatform = require('react-native').Platform.OS;
      require('react-native').Platform.OS = 'android';
    });

    afterEach(() => {
      require('react-native').Platform.OS = originalPlatform;
    });

    it('returns null on Android (Apple Sign In not available)', () => {
      const result = AppleSignInButton({ onPress: jest.fn() });
      expect(result).toBeNull();
    });

    it('renders nothing on Android — no AppleAuthenticationButton', () => {
      const result = AppleSignInButton({ onPress: jest.fn() });
      expect(result).toBeNull();
    });
  });
});
