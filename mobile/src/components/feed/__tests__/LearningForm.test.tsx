/**
 * LearningForm component tests.
 * Runs in the 'components' jest project (node environment).
 *
 * Strategy: call LearningForm(props) as a plain function to get the React element
 * tree, then traverse to find the content Controller and call its render prop
 * directly. This covers the auto-resize props without needing a React fiber.
 *
 * useState is mocked so the direct function call doesn't trigger "Invalid hook call".
 * react-hook-form is mocked to avoid its internal hook calls.
 *
 * Covers items #8 (auto-resize onContentSizeChange) and #9 (larger default size)
 * from closed-testing-triage-v1.0.19.
 */
import React from 'react';

// ---------------------------------------------------------------------------
// Module-scope mock state — mock prefix satisfies jest hoisting exception
// ---------------------------------------------------------------------------

let mockContentHeight = 200;
let mockSetContentHeight = jest.fn();

// ---------------------------------------------------------------------------
// Mocks (hoisted before imports by Jest's Babel transform)
// ---------------------------------------------------------------------------

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    // LearningForm has one useState call: contentHeight (initialized to 200).
    // Return controlled mock state so we can assert on setter calls.
    useState: (init: any) => {
      if (typeof init === 'number') {
        return [mockContentHeight, mockSetContentHeight];
      }
      return [init, jest.fn()];
    },
  };
});

jest.mock('@/contexts/ThemeContext', () => {
  const { lightTheme } = require('@/theme/tokens');
  return { useTheme: () => ({ theme: lightTheme }) };
});

jest.mock('@/contexts/I18nContext', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

jest.mock('react-hook-form', () => ({
  useForm: () => ({
    control: {},
    handleSubmit: (fn: any) => fn,
    watch: (name: string) => (name === 'content' ? 'some content' : ''),
    formState: { errors: {}, isSubmitting: false },
  }),
  // Controller is stored as a React element type — its function body is NOT called
  // during direct function invocation. We define it for completeness.
  Controller: ({ render }: any) =>
    render({ field: { onChange: jest.fn(), onBlur: jest.fn(), value: '' } }),
}));

jest.mock('@hookform/resolvers/zod', () => ({ zodResolver: () => ({}) }));

jest.mock('@/lib/validations', () => ({ pokSchema: {} }));

jest.mock('@/components/ui/Button', () => ({ Button: () => null }));

jest.mock('@/components/ui/ErrorMessage', () => ({ ErrorMessage: () => null }));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { LearningForm } from '../LearningForm';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Traverse the React element tree to find a Controller element by its name prop. */
function findControllerByName(tree: any, name: string): any {
  if (!tree || typeof tree !== 'object') return null;
  if (Array.isArray(tree)) {
    for (const child of tree) {
      const found = findControllerByName(child, name);
      if (found) return found;
    }
    return null;
  }
  if (tree.props?.name === name) return tree;
  return findControllerByName(tree.props?.children, name);
}

/**
 * Render LearningForm, locate the content Controller, invoke its render prop,
 * and return the TextInput element's props.
 */
function getContentInputProps(overrides: object = {}): any {
  const element = (LearningForm as any)({
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
    submitLabel: 'Save',
    ...overrides,
  });
  const contentController = findControllerByName(element, 'content');
  expect(contentController).not.toBeNull();
  const textInputEl = contentController.props.render({
    field: { onChange: jest.fn(), onBlur: jest.fn(), value: '' },
  });
  return textInputEl.props;
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  mockContentHeight = 200;
  mockSetContentHeight.mockClear();
});

// ---------------------------------------------------------------------------
// Helpers — title controller
// ---------------------------------------------------------------------------

/** Render LearningForm, locate the title Controller, invoke its render prop,
 *  and return the TextInput element produced. */
function getTitleInputEl(overrides: object = {}): any {
  const element = (LearningForm as any)({
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
    submitLabel: 'Save',
    ...overrides,
  });
  const titleController = findControllerByName(element, 'title');
  expect(titleController).not.toBeNull();
  return titleController.props.render({
    field: { onChange: jest.fn(), onBlur: jest.fn(), value: 'dummy' },
  });
}

// ---------------------------------------------------------------------------
// Tests — title input wiring
// ---------------------------------------------------------------------------

describe('LearningForm — title input', () => {
  it('renders a title Controller with name="title"', () => {
    const element = (LearningForm as any)({
      onSubmit: jest.fn(),
      onCancel: jest.fn(),
      submitLabel: 'Save',
    });
    const titleController = findControllerByName(element, 'title');
    expect(titleController).not.toBeNull();
  });

  it('renders TextInput with the value from the field', () => {
    const element = (LearningForm as any)({
      onSubmit: jest.fn(),
      onCancel: jest.fn(),
      submitLabel: 'Save',
    });
    const titleController = findControllerByName(element, 'title');
    const testTitle = 'MAU: Monthly Active Users';
    const textInputEl = titleController.props.render({
      field: { onChange: jest.fn(), onBlur: jest.fn(), value: testTitle },
    });
    // value ?? '' — if value is a non-empty string, it is used as-is
    expect(textInputEl.props.value).toBe(testTitle);
  });

  it('uses empty string when field value is undefined (value ?? "" guard)', () => {
    const element = (LearningForm as any)({
      onSubmit: jest.fn(),
      onCancel: jest.fn(),
      submitLabel: 'Save',
    });
    const titleController = findControllerByName(element, 'title');
    const textInputEl = titleController.props.render({
      field: { onChange: jest.fn(), onBlur: jest.fn(), value: undefined },
    });
    expect(textInputEl.props.value).toBe('');
  });

  it('wires onChangeText to field.onChange', () => {
    const mockOnChange = jest.fn();
    const element = (LearningForm as any)({
      onSubmit: jest.fn(),
      onCancel: jest.fn(),
      submitLabel: 'Save',
    });
    const titleController = findControllerByName(element, 'title');
    const textInputEl = titleController.props.render({
      field: { onChange: mockOnChange, onBlur: jest.fn(), value: '' },
    });
    textInputEl.props.onChangeText('MAU: Monthly Active Users');
    expect(mockOnChange).toHaveBeenCalledWith('MAU: Monthly Active Users');
  });

  it('wires onChangeText for titles containing special characters', () => {
    const specialCases = ['MAU: Monthly Active Users', 'Q&A', '🎯 Goal', 'שלום'];
    for (const title of specialCases) {
      const mockOnChange = jest.fn();
      const element = (LearningForm as any)({
        onSubmit: jest.fn(),
        onCancel: jest.fn(),
        submitLabel: 'Save',
      });
      const titleController = findControllerByName(element, 'title');
      const textInputEl = titleController.props.render({
        field: { onChange: mockOnChange, onBlur: jest.fn(), value: '' },
      });
      textInputEl.props.onChangeText(title);
      expect(mockOnChange).toHaveBeenCalledWith(title);
    }
  });
});

// ---------------------------------------------------------------------------
// Tests — submit wiring (handleSubmit mock returns fn directly)
// ---------------------------------------------------------------------------

describe('LearningForm — submit button calls onSubmit', () => {
  it('passes onSubmit directly to the submit Button onPress (via handleSubmit mock)', () => {
    const mockOnSubmit = jest.fn();
    const element = (LearningForm as any)({
      onSubmit: mockOnSubmit,
      onCancel: jest.fn(),
      submitLabel: 'Save',
    });

    // With handleSubmit: (fn) => fn, onPress IS the onSubmit function.
    // We find the Button elements and assert the primary submit button has onPress = onSubmit.
    function findAllButtons(el: any): any[] {
      const results: any[] = [];
      function walk(node: any) {
        if (!node || typeof node !== 'object') return;
        if (Array.isArray(node)) { node.forEach(walk); return; }
        if (node.type === 'Button' || node.type?.name === 'Button') results.push(node);
        const children = node.props?.children;
        if (Array.isArray(children)) children.forEach(walk);
        else if (children) walk(children);
      }
      walk(el);
      return results;
    }

    const buttons = findAllButtons(element);
    // Submit button has label = submitLabel ('Save') and its onPress is the onSubmit fn.
    const submitBtn = buttons.find((b: any) => b.props.label === 'Save');
    expect(submitBtn).toBeDefined();
    expect(submitBtn.props.onPress).toBe(mockOnSubmit);
  });
});

// ---------------------------------------------------------------------------
// Tests — larger default size (#9)
// ---------------------------------------------------------------------------

describe('LearningForm — content textarea default size (#9)', () => {
  it('has minHeight 200 (up from 160)', () => {
    const props = getContentInputProps();
    expect(props.style.minHeight).toBe(200);
  });

  it('has numberOfLines 10 (up from 8)', () => {
    const props = getContentInputProps();
    expect(props.numberOfLines).toBe(10);
  });

  it('applies initial contentHeight 200 as height style', () => {
    const props = getContentInputProps();
    expect(props.style.height).toBe(200);
  });

  it('has maxHeight 400 to prevent full-screen takeover', () => {
    const props = getContentInputProps();
    expect(props.style.maxHeight).toBe(400);
  });

  it('has multiline enabled', () => {
    const props = getContentInputProps();
    expect(props.multiline).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tests — auto-resize behavior (#8)
// ---------------------------------------------------------------------------

describe('LearningForm — auto-resize onContentSizeChange (#8)', () => {
  it('grows when content size exceeds the current height', () => {
    const props = getContentInputProps();
    props.onContentSizeChange({ nativeEvent: { contentSize: { height: 320 } } });
    expect(mockSetContentHeight).toHaveBeenCalledWith(320);
  });

  it('floors at 200 when content size is smaller than minHeight', () => {
    const props = getContentInputProps();
    props.onContentSizeChange({ nativeEvent: { contentSize: { height: 80 } } });
    expect(mockSetContentHeight).toHaveBeenCalledWith(200);
  });

  it('stays at 200 when content size equals minHeight exactly', () => {
    const props = getContentInputProps();
    props.onContentSizeChange({ nativeEvent: { contentSize: { height: 200 } } });
    expect(mockSetContentHeight).toHaveBeenCalledWith(200);
  });

  it('wires onContentSizeChange to the content TextInput (not the title input)', () => {
    const props = getContentInputProps();
    expect(typeof props.onContentSizeChange).toBe('function');
  });

  it('maxHeight 400 caps visual height when state exceeds it (React Native constraint)', () => {
    // Simulate state where content grew beyond 400
    mockContentHeight = 500;
    const props = getContentInputProps();
    expect(props.style.height).toBe(500);   // state reflects actual content size
    expect(props.style.maxHeight).toBe(400); // RN uses maxHeight to cap the rendered height
  });
});
