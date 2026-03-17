/**
 * ReLearningModal component tests.
 * Runs in the 'components' jest project (node environment).
 * Uses mocked useState to enable calling the component as a plain function.
 */

// ---------------------------------------------------------------------------
// Module-scope mock state (must be 'mock'-prefixed for Jest hoisting exception)
// ---------------------------------------------------------------------------

let mockStateCallCount = 0;
const mockSetNote = jest.fn();
const mockSetVisibility = jest.fn();
const mockSetSubmitting = jest.fn();
const mockSetError = jest.fn();

// ---------------------------------------------------------------------------
// Mocks (must appear before imports)
// ---------------------------------------------------------------------------

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useState: (init: any) => {
      mockStateCallCount++;
      // Map call order to state slots: 1=note, 2=visibility, 3=submitting, 4=error
      if (mockStateCallCount === 1) return [init, mockSetNote];       // note = ''
      if (mockStateCallCount === 2) return [init, mockSetVisibility]; // visibility = originalVisibility
      if (mockStateCallCount === 3) return [false, mockSetSubmitting]; // submitting = false
      if (mockStateCallCount === 4) return [null, mockSetError];       // error = null
      return [init, jest.fn()];
    },
  };
});

jest.mock('@/lib/learnerApi', () => ({
  shareLearning: jest.fn(),
  visibilityOptionsUpTo: jest.fn(),
}));

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        surface: '#fff',
        border: '#ccc',
        primary: '#000',
        textSecondary: '#666',
        background: '#f5f5f5',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
      radii: { md: 8, lg: 16, full: 999 },
      typography: {
        fontFamily: { body: 'DMSans', bodyMedium: 'DMSans_500Medium' },
        weights: { medium: '500', regular: '400' },
      },
    },
  }),
}));

jest.mock('@/contexts/I18nContext', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params ? `${key}:${JSON.stringify(params)}` : key,
  }),
}));

jest.mock('@/components/ui/Text', () => ({
  Text: (props: any) => ({ type: 'Text', props }),
}));

jest.mock('@/components/ui/Button', () => ({
  Button: (props: any) => ({ type: 'Button', props }),
}));

jest.mock('@/components/ui/TextInput', () => ({
  TextInput: (props: any) => ({ type: 'TextInput', props }),
}));

jest.mock('@/components/ui/ErrorMessage', () => ({
  ErrorMessage: (props: any) => ({ type: 'ErrorMessage', props }),
}));

jest.mock('@/components/ui/VisibilityPicker', () => ({
  VisibilityPicker: (props: any) => ({ type: 'VisibilityPicker', props }),
}));

jest.mock('react-native', () => ({
  Modal: ({ children, visible }: any) =>
    visible ? { type: 'Modal', props: { children } } : null,
  TouchableOpacity: (props: any) => ({ type: 'TouchableOpacity', props }),
  ScrollView: ({ children }: any) => ({ type: 'ScrollView', props: { children } }),
  View: ({ children, ...props }: any) => ({ type: 'View', props: { children, ...props } }),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { ReLearningModal } from '../ReLearningModal';
import { shareLearning } from '@/lib/learnerApi';
import type { PokVisibility } from '@/lib/pokApi';

const mockShareLearning = shareLearning as jest.MockedFunction<typeof shareLearning>;

// ---------------------------------------------------------------------------
// Tree traversal helpers
// ---------------------------------------------------------------------------

function findAllByType(element: any, type: string): any[] {
  const results: any[] = [];
  function walk(el: any) {
    if (!el || typeof el !== 'object') return;
    if (el.type === type || (el.type as any)?.name === type) results.push(el);
    [el.props?.children].flat().forEach(walk);
  }
  walk(element);
  return results;
}

// ---------------------------------------------------------------------------
// Test setup
// ---------------------------------------------------------------------------

const BASE_PROPS = {
  visible: true,
  originalPokId: 'pok-123',
  originalTitle: 'Rust Lifetimes',
  originalContentPreview: 'Rust lifetimes are a way to tell the compiler...',
  originalVisibility: 'PUBLIC' as PokVisibility,
  onSuccess: jest.fn(),
  onDismiss: jest.fn(),
};

beforeEach(() => {
  mockStateCallCount = 0;
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ReLearningModal', () => {
  it('renders with correct initial state — title and original content visible', () => {
    const result = ReLearningModal(BASE_PROPS);

    expect(result).toBeTruthy();

    // Modal should be visible (non-null)
    const modals = findAllByType(result, 'Modal');
    expect(modals.length).toBeGreaterThan(0);

    // Should contain the modal title i18n key
    const allTexts = findAllByType(result, 'Text');
    const textContents = allTexts.map((t: any) => t.props?.children).filter(Boolean);
    expect(textContents).toContain('relearnings.modal.title');

    // Should show originalTitle as preview content
    expect(textContents).toContain('Rust Lifetimes');

    // VisibilityPicker should be rendered with value = originalVisibility
    const pickers = findAllByType(result, 'VisibilityPicker');
    expect(pickers).toHaveLength(1);
    expect(pickers[0].props.value).toBe('PUBLIC');
  });

  it('visibility capped to original tier — disabledValues includes tiers above FOLLOWERS_ONLY', () => {
    const result = ReLearningModal({
      ...BASE_PROPS,
      originalVisibility: 'FOLLOWERS_ONLY',
    });

    const pickers = findAllByType(result, 'VisibilityPicker');
    expect(pickers).toHaveLength(1);
    expect(pickers[0].props.disabledValues).toContain('PUBLIC');
    // FOLLOWERS_ONLY and below should NOT be disabled
    expect(pickers[0].props.disabledValues).not.toContain('FOLLOWERS_ONLY');
    expect(pickers[0].props.disabledValues).not.toContain('PRIVATE');
  });

  it('Cancel button calls onDismiss and does not call shareLearning', () => {
    const onDismiss = jest.fn();
    const result = ReLearningModal({ ...BASE_PROPS, onDismiss });

    const buttons = findAllByType(result, 'Button');
    const cancelButton = buttons.find(
      (b: any) => b.props?.label === 'relearnings.modal.cancel'
    );
    expect(cancelButton).toBeDefined();

    cancelButton.props.onPress();

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(mockShareLearning).not.toHaveBeenCalled();
  });

  it('Submit calls shareLearning with correct payload', async () => {
    const mockShare = { id: 'share-1', type: 'shared' };
    mockShareLearning.mockResolvedValueOnce(mockShare as any);

    const result = ReLearningModal(BASE_PROPS);

    const buttons = findAllByType(result, 'Button');
    const submitButton = buttons.find(
      (b: any) => b.props?.label === 'relearnings.modal.confirm'
    );
    expect(submitButton).toBeDefined();

    // The note state was initialized with '' (first useState call)
    // The visibility state was initialized with originalVisibility = 'PUBLIC'
    await submitButton.props.onPress();

    expect(mockShareLearning).toHaveBeenCalledWith('pok-123', {
      note: null, // empty string becomes null
      visibility: 'PUBLIC',
    });
  });

  it('409 response shows duplicate error via mockSetError', async () => {
    const conflictError = { status: 409, message: 'Already shared' };
    mockShareLearning.mockRejectedValueOnce(conflictError);

    const result = ReLearningModal(BASE_PROPS);

    const buttons = findAllByType(result, 'Button');
    const submitButton = buttons.find(
      (b: any) => b.props?.label === 'relearnings.modal.confirm'
    );
    expect(submitButton).toBeDefined();

    await submitButton.props.onPress();

    expect(mockSetError).toHaveBeenCalledWith('relearnings.modal.errorDuplicate');
  });

  it('5xx response shows generic error via mockSetError', async () => {
    const serverError = { status: 500, message: 'Internal Server Error' };
    mockShareLearning.mockRejectedValueOnce(serverError);

    const result = ReLearningModal(BASE_PROPS);

    const buttons = findAllByType(result, 'Button');
    const submitButton = buttons.find(
      (b: any) => b.props?.label === 'relearnings.modal.confirm'
    );
    expect(submitButton).toBeDefined();

    await submitButton.props.onPress();

    expect(mockSetError).toHaveBeenCalledWith('relearnings.modal.errorGeneric');
  });

  it('passes visible=false to Modal when not visible', () => {
    const result = ReLearningModal({ ...BASE_PROPS, visible: false });
    // Component returns a React element; visible prop is forwarded to the Modal
    expect(result).toBeTruthy();
    const modals = findAllByType(result, 'Modal');
    expect(modals.length).toBeGreaterThan(0);
    expect(modals[0].props?.visible).toBe(false);
  });

  it('uses content preview when originalTitle is null (first 120 chars)', () => {
    const longContent = 'A'.repeat(200);
    const result = ReLearningModal({
      ...BASE_PROPS,
      originalTitle: null,
      originalContentPreview: longContent,
    });

    const allTexts = findAllByType(result, 'Text');
    const textContents = allTexts.map((t: any) => t.props?.children).filter(Boolean);
    expect(textContents).toContain('A'.repeat(120));
  });

  it('disabledValues is empty array when originalVisibility is PUBLIC', () => {
    const result = ReLearningModal({
      ...BASE_PROPS,
      originalVisibility: 'PUBLIC',
    });

    const pickers = findAllByType(result, 'VisibilityPicker');
    expect(pickers[0].props.disabledValues).toEqual([]);
  });

  it('disabledValues contains all tiers above PRIVATE when originalVisibility is PRIVATE', () => {
    const result = ReLearningModal({
      ...BASE_PROPS,
      originalVisibility: 'PRIVATE',
    });

    const pickers = findAllByType(result, 'VisibilityPicker');
    expect(pickers[0].props.disabledValues).toEqual([
      'COLLEAGUES_ONLY',
      'FOLLOWERS_ONLY',
      'PUBLIC',
    ]);
  });
});
