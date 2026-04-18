import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AppleSignInButtonProps {
  onPress: () => Promise<void>;
  loading?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AppleSignInButton({
  onPress,
  loading = false,
}: AppleSignInButtonProps): React.ReactElement | null {
  // NFR3: Apple Sign In button is only available on iOS
  if (Platform.OS !== 'ios') return null;

  const styles = StyleSheet.create({
    button: {
      height: 44,
      marginTop: 16,
    },
  });

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={5}
      style={styles.button}
      onPress={loading ? undefined : onPress}
    />
  );
}
