/**
 * RegisterScreen tests.
 * Runs in the 'screens' jest project (node environment).
 * Uses function-call style with fully mocked hooks and dependencies.
 */
import React from 'react';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

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

const mockRegisterApi = jest.fn();
jest.mock('@/lib/auth', () => ({
  registerApi: (...args: unknown[]) => mockRegisterApi(...args),
}));

jest.mock('@/lib/api', () => ({
  ApiRequestError: class ApiRequestError extends Error {
    constructor(message: string) { super(message); }
  },
}));

jest.mock('@/lib/validations', () => ({
  registerSchema: {},
  RegisterFormData: {},
}));

jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => () => ({ values: {}, errors: {} }),
}));

const mockHandleSubmit = jest.fn((onSubmit) =>
  jest.fn(() =>
    onSubmit({
      email: 'new@example.com',
      password: 'mock-p4ssword',
      confirmPassword: 'mock-p4ssword',
      displayName: 'New User',
      handle: 'newuser',
    })
  )
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

import { RegisterScreen } from '../RegisterScreen';
import { findAllByType } from './test-utils';
import type { ReactEl } from './test-utils';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('RegisterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHandleSubmit.mockImplementation((onSubmit) =>
      jest.fn(() =>
        onSubmit({
          email: 'new@example.com',
          password: 'mock-p4ssword',
          confirmPassword: 'mock-p4ssword',
          displayName: 'New User',
          handle: 'newuser',
        })
      )
    );
  });

  it('returns a valid React element', () => {
    const result = RegisterScreen({} as never);
    expect(React.isValidElement(result)).toBe(true);
  });

  it('renders a submit Button with fullWidth', () => {
    const result = RegisterScreen({} as never);
    const buttons = findAllByType(result, 'Button');
    const submitBtn = buttons.find((b) => b.props.fullWidth === true);
    expect(submitBtn).toBeDefined();
  });

  it('pressing submit calls registerApi with form data', async () => {
    const user = { id: '2', email: 'new@example.com' };
    mockRegisterApi.mockResolvedValue(user);

    const result = RegisterScreen({} as never);
    const buttons = findAllByType(result, 'Button');
    const submitBtn = buttons.find((b) => b.props.fullWidth === true);

    await (submitBtn?.props.onPress as () => Promise<void>)();

    expect(mockRegisterApi).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'mock-p4ssword',
      displayName: 'New User',
      handle: 'newuser',
    });
  });

  it('calls setUser after successful registration', async () => {
    const user = { id: '2', email: 'new@example.com' };
    mockRegisterApi.mockResolvedValue(user);

    const result = RegisterScreen({} as never);
    const buttons = findAllByType(result, 'Button');
    const submitBtn = buttons.find((b) => b.props.fullWidth === true);

    await (submitBtn?.props.onPress as () => Promise<void>)();

    expect(mockSetUser).toHaveBeenCalledWith(user);
  });

  it('renders an ErrorMessage component', () => {
    const result = RegisterScreen({} as never);
    const errors = findAllByType(result, 'ErrorMessage');
    expect(errors.length).toBe(1);
  });

  it('renders title Text variants', () => {
    const result = RegisterScreen({} as never);
    const texts = findAllByType(result, 'Text');
    const title = texts.find((t) => t.props.variant === 'title');
    expect(title).toBeDefined();
  });

  it('renders a sign-in link Text with primary color', () => {
    const { mockTheme } = require('./test-utils');
    const result = RegisterScreen({} as never);
    const texts = findAllByType(result, 'Text');
    const primaryText = texts.find((t) => (t.props.color as string)?.includes(mockTheme.colors.primary));
    expect(primaryText).toBeDefined();
  });

  it('sign-in link navigates to Login', () => {
    const { mockTheme } = require('./test-utils');
    const result = RegisterScreen({} as never);
    const texts = findAllByType(result, 'Text');
    const signInLink = texts.find((t) => (t.props.color as string)?.includes(mockTheme.colors.primary));
    (signInLink?.props.onPress as () => void)();
    expect(mockNavigate).toHaveBeenCalledWith('Login');
  });

  it('does not call setUser when registerApi throws', async () => {
    const { ApiRequestError } = jest.requireMock('@/lib/api') as {
      ApiRequestError: new (msg: string) => Error;
    };
    mockRegisterApi.mockRejectedValue(new ApiRequestError('Handle already taken'));

    const result = RegisterScreen({} as never);
    const buttons = findAllByType(result, 'Button');
    const submitBtn = buttons.find((b) => b.props.fullWidth === true);

    await (submitBtn?.props.onPress as () => Promise<void>)();

    expect(mockSetUser).not.toHaveBeenCalled();
  });

  it('confirmPassword field is not submitted to registerApi (excluded)', async () => {
    const user = { id: '2', email: 'new@example.com' };
    mockRegisterApi.mockResolvedValue(user);

    const result = RegisterScreen({} as never);
    const buttons = findAllByType(result, 'Button');
    const submitBtn = buttons.find((b) => b.props.fullWidth === true);
    await (submitBtn?.props.onPress as () => Promise<void>)();

    const callArg = mockRegisterApi.mock.calls[0][0] as Record<string, unknown>;
    expect(callArg).not.toHaveProperty('confirmPassword');
  });

  // ---------------------------------------------------------------------------
  // Google Sign-In tests
  // ---------------------------------------------------------------------------

  it('renders GoogleSignInButton', () => {
    const result = RegisterScreen({} as never);
    const googleBtns = findAllByType(result, 'GoogleSignInButton');
    expect(googleBtns.length).toBeGreaterThan(0);
  });

  it('passes loading=false to GoogleSignInButton by default', () => {
    mockUseGoogleAuth.mockReturnValue({ loading: false, handlePress: mockHandlePress, disabled: false });
    const result = RegisterScreen({} as never);
    const googleBtns = findAllByType(result, 'GoogleSignInButton');
    expect(googleBtns[0].props.loading).toBe(false);
  });

  it('passes disabled from useGoogleAuth to GoogleSignInButton', () => {
    mockUseGoogleAuth.mockReturnValue({ loading: false, handlePress: mockHandlePress, disabled: true });
    const result = RegisterScreen({} as never);
    const googleBtns = findAllByType(result, 'GoogleSignInButton');
    expect(googleBtns[0].props.disabled).toBe(true);
  });

  it('tapping GoogleSignInButton calls handlePress from useGoogleAuth', async () => {
    mockHandlePress.mockResolvedValue(undefined);
    const result = RegisterScreen({} as never);
    const googleBtns = findAllByType(result, 'GoogleSignInButton');
    await (googleBtns[0].props.onPress as () => Promise<void>)();
    expect(mockHandlePress).toHaveBeenCalled();
  });
});
