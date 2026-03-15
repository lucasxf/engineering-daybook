/**
 * ForgotPasswordScreen tests.
 * Runs in the 'screens' jest project (node environment).
 * Uses function-call style with fully mocked hooks and dependencies.
 */
import React from 'react';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Module-scope state mirrors — mock-prefixed so they're accessible inside jest.mock() factories
let mockStateCallCount = 0;
let mockServerError: string | null = null;
let mockSuccessMessage: string | null = null;
const mockSetServerError = jest.fn((v: string | null) => { mockServerError = v; });
const mockSetSuccessMessage = jest.fn((v: string | null) => { mockSuccessMessage = v; });

// Mock useState: intercept in order — 1st call = serverError, 2nd call = successMessage
jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useState: (init) => {
      mockStateCallCount++;
      if (mockStateCallCount === 1) return [mockServerError, mockSetServerError];
      if (mockStateCallCount === 2) return [mockSuccessMessage, mockSetSuccessMessage];
      return [init, jest.fn()];
    },
  };
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

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('@react-navigation/native-stack', () => ({}));

const mockRequestPasswordResetApi = jest.fn();
jest.mock('@/lib/auth', () => ({
  requestPasswordResetApi: (...args: unknown[]) => mockRequestPasswordResetApi(...args),
}));

jest.mock('@/lib/validations', () => ({
  forgotPasswordSchema: {},
  ForgotPasswordFormData: {},
}));

jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => () => ({ values: {}, errors: {} }),
}));

const mockHandleSubmit = jest.fn((onSubmit) =>
  jest.fn(() => onSubmit({ email: 'user@example.com' }))
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

import { ForgotPasswordScreen } from '../ForgotPasswordScreen';

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

describe('ForgotPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStateCallCount = 0;
    mockServerError = null;
    mockSuccessMessage = null;
    mockHandleSubmit.mockImplementation((onSubmit) =>
      jest.fn(() => onSubmit({ email: 'user@example.com' }))
    );
  });

  it('returns a valid React element', () => {
    const result = ForgotPasswordScreen({} as never);
    expect(React.isValidElement(result)).toBe(true);
  });

  it('renders a submit Button with fullWidth', () => {
    const result = ForgotPasswordScreen({} as never);
    const buttons = findAllByType(result, 'Button');
    const submitBtn = buttons.find((b) => b.props.fullWidth === true);
    expect(submitBtn).toBeDefined();
  });

  it('submit Button has an onPress handler', () => {
    const result = ForgotPasswordScreen({} as never);
    const buttons = findAllByType(result, 'Button');
    const submitBtn = buttons.find((b) => b.props.fullWidth === true);
    expect(typeof submitBtn?.props.onPress).toBe('function');
  });

  it('calls requestPasswordResetApi with email on submit', async () => {
    mockRequestPasswordResetApi.mockResolvedValue(undefined);

    const result = ForgotPasswordScreen({} as never);
    const buttons = findAllByType(result, 'Button');
    const submitBtn = buttons.find((b) => b.props.fullWidth === true);

    await (submitBtn?.props.onPress as () => Promise<void>)();

    expect(mockRequestPasswordResetApi).toHaveBeenCalledWith('user@example.com');
  });

  it('sets success message after successful request', async () => {
    mockRequestPasswordResetApi.mockResolvedValue(undefined);

    const result = ForgotPasswordScreen({} as never);
    const buttons = findAllByType(result, 'Button');
    const submitBtn = buttons.find((b) => b.props.fullWidth === true);

    await (submitBtn?.props.onPress as () => Promise<void>)();

    expect(mockSetSuccessMessage).toHaveBeenCalledWith('auth.forgotPassword.successMessage');
  });

  it('renders ErrorMessage component', () => {
    const result = ForgotPasswordScreen({} as never);
    const errors = findAllByType(result, 'ErrorMessage');
    expect(errors.length).toBe(1);
  });

  it('renders a "Back to login" ghost button', () => {
    const result = ForgotPasswordScreen({} as never);
    const buttons = findAllByType(result, 'Button');
    const ghostBtn = buttons.find((b) => b.props.variant === 'ghost');
    expect(ghostBtn).toBeDefined();
  });

  it('back button navigates to Login', () => {
    const result = ForgotPasswordScreen({} as never);
    const buttons = findAllByType(result, 'Button');
    const ghostBtn = buttons.find((b) => b.props.variant === 'ghost');
    (ghostBtn?.props.onPress as () => void)();
    expect(mockNavigate).toHaveBeenCalledWith('Login');
  });

  it('renders success container with success border when successMessage is set', () => {
    mockSuccessMessage = 'auth.forgotPassword.successMessage';

    const result = ForgotPasswordScreen({} as never);
    // Success container is a View with borderColor: theme.colors.success (#27AE60)
    function findSuccessContainer(node: unknown): boolean {
      if (!node || typeof node !== 'object') return false;
      const el = node as ReactEl;
      const style = el.props?.style as Record<string, unknown> | undefined;
      if (style && style.borderColor === '#27AE60') return true;
      const children = el.props?.children;
      if (Array.isArray(children)) return children.some(findSuccessContainer);
      if (children) return findSuccessContainer(children);
      return false;
    }
    expect(findSuccessContainer(result)).toBe(true);
  });

  it('sets server error when requestPasswordResetApi throws', async () => {
    mockRequestPasswordResetApi.mockRejectedValue(new Error('Network error'));

    const result = ForgotPasswordScreen({} as never);
    const buttons = findAllByType(result, 'Button');
    const submitBtn = buttons.find((b) => b.props.fullWidth === true);

    await (submitBtn?.props.onPress as () => Promise<void>)();

    expect(mockSetServerError).toHaveBeenCalledWith('common.error');
  });

  it('clears errors before each submit attempt', async () => {
    mockRequestPasswordResetApi.mockResolvedValue(undefined);

    const result = ForgotPasswordScreen({} as never);
    const buttons = findAllByType(result, 'Button');
    const submitBtn = buttons.find((b) => b.props.fullWidth === true);

    await (submitBtn?.props.onPress as () => Promise<void>)();

    expect(mockSetServerError).toHaveBeenCalledWith(null);
    expect(mockSetSuccessMessage).toHaveBeenCalledWith(null);
  });
});
