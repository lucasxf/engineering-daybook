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
  useTheme: () => ({ theme: require('./test-utils').mockTheme }),
}));

jest.mock('@/contexts/I18nContext', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const mockSetUser = jest.fn();
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ setUser: mockSetUser }),
}));

let mockRouteParams: Record<string, unknown> = { tempToken: 'google-temp-token-abc' };
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useRoute: () => ({ params: mockRouteParams }),
}));

jest.mock('@react-navigation/native-stack', () => ({}));

const mockCompleteGoogleSignupApi = jest.fn();
const mockCompleteAppleSignupApi = jest.fn();
jest.mock('@/lib/auth', () => ({
  completeGoogleSignupApi: (...args: unknown[]) => mockCompleteGoogleSignupApi(...args),
  completeAppleSignupApi: (...args: unknown[]) => mockCompleteAppleSignupApi(...args),
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
import { findAllByType } from './test-utils';
import type { ReactEl } from './test-utils';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ChooseHandleScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteParams = { tempToken: 'google-temp-token-abc' };
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

  // ---------------------------------------------------------------------------
  // Provider routing tests
  // ---------------------------------------------------------------------------

  it('calls completeGoogleSignupApi when provider is "google"', async () => {
    mockRouteParams = { tempToken: 'google-temp-token-abc', provider: 'google' };
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
    expect(mockCompleteAppleSignupApi).not.toHaveBeenCalled();
  });

  it('calls completeAppleSignupApi when provider is "apple"', async () => {
    mockRouteParams = { tempToken: 'apple-temp-token-xyz', provider: 'apple' };
    const user = { id: '4', email: 'apple@privaterelay.apple.com' };
    mockCompleteAppleSignupApi.mockResolvedValue(user);

    const result = ChooseHandleScreen({} as never);
    const buttons = findAllByType(result, 'Button');
    const submitBtn = buttons.find((b) => b.props.fullWidth === true);

    await (submitBtn?.props.onPress as () => Promise<void>)();

    expect(mockCompleteAppleSignupApi).toHaveBeenCalledWith({
      tempToken: 'apple-temp-token-xyz',
      handle: 'johndoe',
      displayName: 'John Doe',
    });
    expect(mockCompleteGoogleSignupApi).not.toHaveBeenCalled();
  });

  it('defaults to completeGoogleSignupApi when provider is absent (backwards compat)', async () => {
    mockRouteParams = { tempToken: 'google-temp-token-abc' };
    const user = { id: '3', email: 'google@example.com' };
    mockCompleteGoogleSignupApi.mockResolvedValue(user);

    const result = ChooseHandleScreen({} as never);
    const buttons = findAllByType(result, 'Button');
    const submitBtn = buttons.find((b) => b.props.fullWidth === true);

    await (submitBtn?.props.onPress as () => Promise<void>)();

    expect(mockCompleteGoogleSignupApi).toHaveBeenCalled();
    expect(mockCompleteAppleSignupApi).not.toHaveBeenCalled();
  });

  it('calls setUser after successful Apple signup completion', async () => {
    mockRouteParams = { tempToken: 'apple-temp-token-xyz', provider: 'apple' };
    const user = { id: '4', email: 'apple@privaterelay.apple.com' };
    mockCompleteAppleSignupApi.mockResolvedValue(user);

    const result = ChooseHandleScreen({} as never);
    const buttons = findAllByType(result, 'Button');
    const submitBtn = buttons.find((b) => b.props.fullWidth === true);

    await (submitBtn?.props.onPress as () => Promise<void>)();

    expect(mockSetUser).toHaveBeenCalledWith(user);
  });
});
