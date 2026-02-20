import { vi } from 'vitest';
import type { AuthContextValue } from '@/contexts/AuthContext';

/**
 * Creates a mock AuthContextValue for page-level tests.
 * Defaults to unauthenticated, not loading state.
 */
export function createMockAuth(overrides?: Partial<AuthContextValue>): AuthContextValue {
  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    googleLogin: vi.fn(),
    completeGoogleSignup: vi.fn(),
    ...overrides,
  };
}

/**
 * Creates a mock Next.js router for page-level tests.
 */
export function createMockRouter(overrides?: Record<string, unknown>) {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
    ...overrides,
  };
}

/** Minimal i18n messages for home page tests */
export const homeMessages = {
  home: {
    welcome: 'Welcome to learnimo',
    description: 'Your knowledge journal.',
    getStarted: 'Get Started',
    viewLearnings: 'View my learnings',
  },
};

/** Minimal i18n messages for auth page tests */
export const authMessages = {
  auth: {
    loginTitle: 'Welcome back',
    loginSubtitle: 'Sign in to your learnimo',
    registerTitle: 'Create your account',
    registerSubtitle: 'Capture what you learn',
    orContinueWith: 'or continue with',
    noAccount: "Don't have an account?",
    signUpLink: 'Sign up',
    hasAccount: 'Already have an account?',
    logInLink: 'Log in',
    chooseHandleTitle: 'Choose your handle',
    chooseHandleSubtitle: 'Pick a unique handle to complete your registration',
    errors: {
      sessionExpired: 'Session expired. Please try again.',
    },
  },
};

/** Minimal i18n messages for poks page tests */
export const poksMessages = {
  poks: {
    create: { title: 'New Learning' },
    list: {
      title: 'My Learnings',
      createButton: 'New Learning',
      resultsCount: '{count} learnings found',
    },
    view: {
      backButton: 'Back to list',
      editButton: 'Edit',
      created: 'Created',
      updated: 'Updated',
    },
    edit: {
      title: 'Edit Learning',
      cancelButton: 'Cancel',
    },
    emptyState: {
      message: 'No learnings yet. Start capturing what you learn!',
      cta: 'Create your first learning',
    },
    errors: {
      notFound: 'Learning not found',
      unexpected: 'Something went wrong. Please try again.',
    },
    search: {
      placeholder: 'Search your learnings...',
      button: 'Search',
      noResults: 'No learnings found',
      noResultsHint: 'Try adjusting your search terms',
      clearButton: 'Clear search',
      error: 'Failed to search learnings.',
    },
    sort: {
      label: 'Sort by',
      newestFirst: 'Newest first',
      oldestFirst: 'Oldest first',
      recentlyCreated: 'Recently created',
      firstCreated: 'First created',
    },
    form: {
      titleLabel: 'Title',
      titlePlaceholder: 'Optional',
      contentLabel: 'Content',
      contentPlaceholder: 'What did you learn today?',
      createButton: 'Save Learning',
      updateButton: 'Save Changes',
      submitting: 'Saving...',
    },
    delete: {
      button: 'Delete',
      confirmTitle: 'Delete learning?',
      confirmMessage: 'This action cannot be undone.',
      confirmButton: 'Delete',
      cancelButton: 'Cancel',
      deleting: 'Deleting...',
    },
    success: {
      created: 'Learning saved successfully',
      updated: 'Learning updated successfully',
      deleted: 'Learning deleted successfully',
    },
    filter: {
      label: 'Filter',
      createdFrom: 'Created from',
      createdTo: 'Created to',
      updatedFrom: 'Updated from',
      updatedTo: 'Updated to',
      applyButton: 'Apply filters',
      clearButton: 'Clear filters',
    },
  },
};
