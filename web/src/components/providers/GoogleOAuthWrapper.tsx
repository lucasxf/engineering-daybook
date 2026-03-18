'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { type ReactNode } from 'react';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

interface GoogleOAuthWrapperProps {
  children: ReactNode;
}

/**
 * Wrapper for GoogleOAuthProvider that handles the GSI multiple initialization warning.
 * 
 * Note: The "[GSI_LOGGER]: google.accounts.id.initialize() is called multiple times" 
 * warning may appear in development due to React Strict Mode remounting components.
 * This is a known issue with @react-oauth/google and does not affect functionality.
 * The warning does not appear in production builds.
 * 
 * @see https://github.com/MomenSherif/react-oauth/issues/225
 */
export function GoogleOAuthWrapper({ children }: GoogleOAuthWrapperProps) {
  if (!GOOGLE_CLIENT_ID) {
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  );
}
