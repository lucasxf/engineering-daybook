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
  useTheme: () => ({
    theme: {
      colors: {
        background: '#F5F0E8',
        primary: '#D4854A',
        textPrimary: '#1A1A2E',
        textSecondary: '#6B7280',
        surface: '#FFFFFF',
        surfaceAlt: '#EDE8E0',
        border: '#E8E4DF',
        inputBg: '#FDFCFA',
        inputBorder: '#D1CBC0',
        inputPlaceholder: '#9CA3AF',
        error: '#C0392B',
        errorBackground: '#FFF0F0',
        success: '#27AE60',
        textInverse: '#FFFFFF',
        disabledBg: '#E5E7EB',
        disabledText: '#9CA3AF',
      },
      spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
      radii: { sm: 4, md: 8, lg: 12, full: 9999 },
      typography: {
        sizes: { xs: 11, sm: 13, md: 15, lg: 17, xl: 20, xxl: 24, xxxl: 30 },
        weights: { regular: '400', medium: '500', semibold: '600', bold: '700' },
        fontFamily: { body: 'DMSans_400Regular', bodyMedium: 'DMSans_500Medium', heading: 'Sora_600SemiBold' },
      },
    },
  }),
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
      password: 'Pass123!',
      confirmPassword: 'Pass123!',
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

// ---------------------------------------------------------------------------
// Import under test (after mocks)
// ---------------------------------------------------------------------------

import { RegisterScreen } from '../RegisterScreen';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type ReactEl = React.ReactElement & { props: Record<string, unknown> };

function findAllByType(element: unknown, type: string): ReactEl[] {
  const results: ReactEl[] = [];
  function walk(node: unknown) {
    if (!node || typeof node !== 'object') return;
    const el = node as ReactEl;
    if (el.type === type || (el.type as { name?: string })?.name === type) results.push(el);
    const children = el.props?.children;
    if (Array.isArray(children)) children.forEach(walk);
    else if (children) walk(children);
  }
  walk(element);
  return results;
}

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
          password: 'Pass123!',
          confirmPassword: 'Pass123!',
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
      password: 'Pass123!',
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
    const result = RegisterScreen({} as never);
    const texts = findAllByType(result, 'Text');
    const primaryText = texts.find((t) => (t.props.color as string)?.includes('#D4854A'));
    expect(primaryText).toBeDefined();
  });

  it('sign-in link navigates to Login', () => {
    const result = RegisterScreen({} as never);
    const texts = findAllByType(result, 'Text');
    const signInLink = texts.find((t) => (t.props.color as string)?.includes('#D4854A'));
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
});
