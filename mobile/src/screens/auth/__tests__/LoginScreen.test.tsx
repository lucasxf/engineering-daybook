/**
 * LoginScreen tests.
 * Runs in the 'screens' jest project (node environment).
 * Uses function-call style with fully mocked hooks and dependencies.
 *
 * useState is mocked so it returns the initial value and a jest.fn() setter,
 * allowing the screen to be called as a plain function without a React fiber.
 */
import React from 'react';

// ---------------------------------------------------------------------------
// Mocks — declared before any imports that trigger the module system
// ---------------------------------------------------------------------------

// Mock useState so screens can be called as plain functions (no React fiber needed)
jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return { ...actual, useState: (init) => [init, jest.fn()] };
});

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({ theme: require('./test-utils').mockTheme }),
}));

jest.mock('@/contexts/I18nContext', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const mockSetUser = jest.fn();
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ setUser: mockSetUser }),
}));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('@react-navigation/native-stack', () => ({}));

const mockLoginApi = jest.fn();
jest.mock('@/lib/auth', () => ({
  loginApi: (...args: unknown[]) => mockLoginApi(...args),
}));

jest.mock('@/lib/api', () => ({
  ApiRequestError: class ApiRequestError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  },
}));

jest.mock('@/lib/validations', () => ({
  loginSchema: {},
  LoginFormData: {},
}));

jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => () => ({ values: {}, errors: {} }),
}));

const mockHandleSubmit = jest.fn((onSubmit) =>
  jest.fn(() => onSubmit({ email: 'test@example.com', password: 'mock-p4ssword' }))
);
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    control: {},
    handleSubmit: mockHandleSubmit,
    formState: { errors: {}, isSubmitting: false },
  }),
  Controller: ({ render: r }: { render: Function }) =>
    r({ field: { onChange: jest.fn(), onBlur: jest.fn(), value: '' } }),
}));

jest.mock('@/components/ui/Button', () => ({
  Button: (props: Record<string, unknown>) => require('react').createElement('Button', props),
}));
jest.mock('@/components/ui/TextInput', () => ({
  TextInput: (props: Record<string, unknown>) => require('react').createElement('TextInput', props),
}));
jest.mock('@/components/ui/Text', () => ({
  Text: (props: Record<string, unknown>) => require('react').createElement('Text', props),
}));
jest.mock('@/components/ui/ErrorMessage', () => ({
  ErrorMessage: (props: Record<string, unknown>) => require('react').createElement('ErrorMessage', props),
}));

const mockHandlePress = jest.fn();
const mockUseGoogleAuth = jest.fn(() => ({ loading: false, handlePress: mockHandlePress, disabled: false }));
jest.mock('@/hooks/useGoogleAuth', () => ({
  useGoogleAuth: (...args: unknown[]) => mockUseGoogleAuth(...args),
}));

jest.mock('@/components/auth/GoogleSignInButton', () => ({
  GoogleSignInButton: (props: Record<string, unknown>) => require('react').createElement('GoogleSignInButton', props),
}));

// ---------------------------------------------------------------------------
// Import under test (after mocks)
// ---------------------------------------------------------------------------

import { LoginScreen } from '../LoginScreen';
import { findAllByType } from './test-utils';
import type { ReactEl } from './test-utils';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHandleSubmit.mockImplementation((onSubmit) =>
      jest.fn(() => onSubmit({ email: 'test@example.com', password: 'mock-p4ssword' }))
    );
  });

  it('returns a valid React element', () => {
    const result = LoginScreen({} as never);
    expect(React.isValidElement(result)).toBe(true);
  });

  it('renders a submit Button', () => {
    const result = LoginScreen({} as never);
    const buttons = findAllByType(result, 'Button');
    expect(buttons.length).toBeGreaterThan(0);
    const submitBtn = buttons.find((b) => b.props.fullWidth === true);
    expect(submitBtn).toBeDefined();
  });

  it('submit Button has an onPress handler', () => {
    const result = LoginScreen({} as never);
    const buttons = findAllByType(result, 'Button');
    const submitBtn = buttons.find((b) => b.props.fullWidth === true);
    expect(typeof submitBtn?.props.onPress).toBe('function');
  });

  it('pressing submit calls loginApi with form data', async () => {
    const user = { id: '1', email: 'test@example.com' };
    mockLoginApi.mockResolvedValue(user);

    const result = LoginScreen({} as never);
    const buttons = findAllByType(result, 'Button');
    const submitBtn = buttons.find((b) => b.props.fullWidth === true);

    await (submitBtn?.props.onPress as () => Promise<void>)();

    expect(mockLoginApi).toHaveBeenCalledWith({ email: 'test@example.com', password: 'mock-p4ssword' });
  });

  it('calls setUser after successful login', async () => {
    const user = { id: '1', email: 'test@example.com' };
    mockLoginApi.mockResolvedValue(user);

    const result = LoginScreen({} as never);
    const buttons = findAllByType(result, 'Button');
    const submitBtn = buttons.find((b) => b.props.fullWidth === true);

    await (submitBtn?.props.onPress as () => Promise<void>)();

    expect(mockSetUser).toHaveBeenCalledWith(user);
  });

  it('renders an ErrorMessage component', () => {
    const result = LoginScreen({} as never);
    const errors = findAllByType(result, 'ErrorMessage');
    expect(errors.length).toBe(1);
  });

  it('renders a "Forgot password" ghost button', () => {
    const result = LoginScreen({} as never);
    const buttons = findAllByType(result, 'Button');
    const ghostBtn = buttons.find((b) => b.props.variant === 'ghost');
    expect(ghostBtn).toBeDefined();
  });

  it('forgot password button navigates to ForgotPassword', () => {
    const result = LoginScreen({} as never);
    const buttons = findAllByType(result, 'Button');
    const ghostBtn = buttons.find((b) => b.props.variant === 'ghost');
    (ghostBtn?.props.onPress as () => void)();
    expect(mockNavigate).toHaveBeenCalledWith('ForgotPassword');
  });

  it('renders two Text elements for the title block', () => {
    const result = LoginScreen({} as never);
    const texts = findAllByType(result, 'Text');
    expect(texts.length).toBeGreaterThanOrEqual(2);
  });

  it('renders a sign-up link Text with primary color', () => {
    const { mockTheme } = require('./test-utils');
    const result = LoginScreen({} as never);
    const texts = findAllByType(result, 'Text');
    const primaryText = texts.find(
      (t) => (t.props.color as string)?.includes(mockTheme.colors.primary)
    );
    expect(primaryText).toBeDefined();
  });

  it('sign-up link navigates to Register', () => {
    const { mockTheme } = require('./test-utils');
    const result = LoginScreen({} as never);
    const texts = findAllByType(result, 'Text');
    const signUpLink = texts.find((t) => (t.props.color as string)?.includes(mockTheme.colors.primary));
    (signUpLink?.props.onPress as () => void)();
    expect(mockNavigate).toHaveBeenCalledWith('Register');
  });

  it('does not call setUser when loginApi returns 401', async () => {
    const { ApiRequestError } = jest.requireMock('@/lib/api') as {
      ApiRequestError: new (msg: string, status: number) => Error & { status: number };
    };
    mockLoginApi.mockRejectedValue(new ApiRequestError('Unauthorized', 401));

    const result = LoginScreen({} as never);
    const buttons = findAllByType(result, 'Button');
    const submitBtn = buttons.find((b) => b.props.fullWidth === true);

    // Should not throw
    await (submitBtn?.props.onPress as () => Promise<void>)();
    // setUser should not have been called
    expect(mockSetUser).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // Google Sign-In tests
  // ---------------------------------------------------------------------------

  it('renders GoogleSignInButton', () => {
    const result = LoginScreen({} as never);
    const googleBtns = findAllByType(result, 'GoogleSignInButton');
    expect(googleBtns.length).toBeGreaterThan(0);
  });

  it('passes loading=false to GoogleSignInButton by default', () => {
    mockUseGoogleAuth.mockReturnValue({ loading: false, handlePress: mockHandlePress, disabled: false });
    const result = LoginScreen({} as never);
    const googleBtns = findAllByType(result, 'GoogleSignInButton');
    expect(googleBtns[0].props.loading).toBe(false);
  });

  it('passes disabled from useGoogleAuth to GoogleSignInButton', () => {
    mockUseGoogleAuth.mockReturnValue({ loading: false, handlePress: mockHandlePress, disabled: true });
    const result = LoginScreen({} as never);
    const googleBtns = findAllByType(result, 'GoogleSignInButton');
    expect(googleBtns[0].props.disabled).toBe(true);
  });

  it('tapping GoogleSignInButton calls handlePress from useGoogleAuth', async () => {
    mockHandlePress.mockResolvedValue(undefined);
    const result = LoginScreen({} as never);
    const googleBtns = findAllByType(result, 'GoogleSignInButton');
    await (googleBtns[0].props.onPress as () => Promise<void>)();
    expect(mockHandlePress).toHaveBeenCalled();
  });
});
