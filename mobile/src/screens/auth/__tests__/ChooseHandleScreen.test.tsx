/**
 * ChooseHandleScreen tests.
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

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useRoute: () => ({ params: { tempToken: 'google-temp-token-abc' } }),
}));

jest.mock('@react-navigation/native-stack', () => ({}));

const mockCompleteGoogleSignupApi = jest.fn();
jest.mock('@/lib/auth', () => ({
  completeGoogleSignupApi: (...args: unknown[]) => mockCompleteGoogleSignupApi(...args),
}));

jest.mock('@/lib/api', () => ({
  ApiRequestError: class ApiRequestError extends Error {
    constructor(message: string) { super(message); }
  },
}));

jest.mock('@/lib/validations', () => ({
  chooseHandleSchema: {},
  ChooseHandleFormData: {},
}));

jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => () => ({ values: {}, errors: {} }),
}));

const mockHandleSubmit = jest.fn((onSubmit) =>
  jest.fn(() => onSubmit({ handle: 'johndoe', displayName: 'John Doe' }))
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

import { ChooseHandleScreen } from '../ChooseHandleScreen';

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

describe('ChooseHandleScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHandleSubmit.mockImplementation((onSubmit) =>
      jest.fn(() => onSubmit({ handle: 'johndoe', displayName: 'John Doe' }))
    );
  });

  it('returns a valid React element', () => {
    const result = ChooseHandleScreen({} as never);
    expect(React.isValidElement(result)).toBe(true);
  });

  it('renders a submit Button with fullWidth', () => {
    const result = ChooseHandleScreen({} as never);
    const buttons = findAllByType(result, 'Button');
    const submitBtn = buttons.find((b) => b.props.fullWidth === true);
    expect(submitBtn).toBeDefined();
  });

  it('submit Button has an onPress handler', () => {
    const result = ChooseHandleScreen({} as never);
    const buttons = findAllByType(result, 'Button');
    const submitBtn = buttons.find((b) => b.props.fullWidth === true);
    expect(typeof submitBtn?.props.onPress).toBe('function');
  });

  it('calls completeGoogleSignupApi with tempToken, handle, and displayName', async () => {
    const user = { id: '3', email: 'google@example.com' };
    mockCompleteGoogleSignupApi.mockResolvedValue(user);

    const result = ChooseHandleScreen({} as never);
    const buttons = findAllByType(result, 'Button');
    const submitBtn = buttons.find((b) => b.props.fullWidth === true);

    await (submitBtn?.props.onPress as () => Promise<void>)();

    expect(mockCompleteGoogleSignupApi).toHaveBeenCalledWith({
      tempToken: 'google-temp-token-abc',
      handle: 'johndoe',
      displayName: 'John Doe',
    });
  });

  it('calls setUser after successful signup completion', async () => {
    const user = { id: '3', email: 'google@example.com' };
    mockCompleteGoogleSignupApi.mockResolvedValue(user);

    const result = ChooseHandleScreen({} as never);
    const buttons = findAllByType(result, 'Button');
    const submitBtn = buttons.find((b) => b.props.fullWidth === true);

    await (submitBtn?.props.onPress as () => Promise<void>)();

    expect(mockSetUser).toHaveBeenCalledWith(user);
  });

  it('renders an ErrorMessage component', () => {
    const result = ChooseHandleScreen({} as never);
    const errors = findAllByType(result, 'ErrorMessage');
    expect(errors.length).toBe(1);
  });

  it('renders title and subtitle Text variants', () => {
    const result = ChooseHandleScreen({} as never);
    const texts = findAllByType(result, 'Text');
    const title = texts.find((t) => t.props.variant === 'title');
    const subtitle = texts.find((t) => t.props.variant === 'bodySm');
    expect(title).toBeDefined();
    expect(subtitle).toBeDefined();
  });

  it('does not call setUser when API throws ApiRequestError', async () => {
    const { ApiRequestError } = jest.requireMock('@/lib/api') as {
      ApiRequestError: new (msg: string) => Error;
    };
    mockCompleteGoogleSignupApi.mockRejectedValue(new ApiRequestError('Handle taken'));

    const result = ChooseHandleScreen({} as never);
    const buttons = findAllByType(result, 'Button');
    const submitBtn = buttons.find((b) => b.props.fullWidth === true);

    await (submitBtn?.props.onPress as () => Promise<void>)();

    expect(mockSetUser).not.toHaveBeenCalled();
  });

  it('renders exactly one primary submit button (no navigation buttons)', () => {
    const result = ChooseHandleScreen({} as never);
    const buttons = findAllByType(result, 'Button');
    // ChooseHandle has only one button (submit) — no back/ghost button
    expect(buttons.length).toBe(1);
    expect(buttons[0].props.fullWidth).toBe(true);
  });
});
