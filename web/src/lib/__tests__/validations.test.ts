import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  getPasswordStrength,
  HANDLE_PATTERN,
} from '../validations';

describe('loginSchema', () => {
  it('validates a correct login', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'password',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty email', () => {
    const result = loginSchema.safeParse({ email: '', password: 'password' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'notanemail',
      password: 'password',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const validData = {
    email: 'user@example.com',
    password: 'SecurePass1',
    confirmPassword: 'SecurePass1',
    displayName: 'John Doe',
    handle: 'johndoe',
  };

  it('validates correct registration data', () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects password shorter than 8 chars', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'Short1',
      confirmPassword: 'Short1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without uppercase', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'lowercase1',
      confirmPassword: 'lowercase1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without lowercase', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'UPPERCASE1',
      confirmPassword: 'UPPERCASE1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without number', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'NoNumberHere',
      confirmPassword: 'NoNumberHere',
    });
    expect(result.success).toBe(false);
  });

  it('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({
      ...validData,
      confirmPassword: 'DifferentPass1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects handle shorter than 3 chars', () => {
    const result = registerSchema.safeParse({ ...validData, handle: 'ab' });
    expect(result.success).toBe(false);
  });

  it('rejects handle with uppercase', () => {
    const result = registerSchema.safeParse({
      ...validData,
      handle: 'JohnDoe',
    });
    expect(result.success).toBe(false);
  });

  it('rejects handle starting with hyphen', () => {
    const result = registerSchema.safeParse({
      ...validData,
      handle: '-johndoe',
    });
    expect(result.success).toBe(false);
  });

  it('accepts handle with hyphens', () => {
    const result = registerSchema.safeParse({
      ...validData,
      handle: 'john-doe',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty display name', () => {
    const result = registerSchema.safeParse({
      ...validData,
      displayName: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('HANDLE_PATTERN', () => {
  it.each([
    ['lucasxf', true],
    ['lucas-xf', true],
    ['a1b', true],
    ['john-doe-123', true],
    ['ab', false],
    ['-john', false],
    ['john-', false],
    ['John', false],
    ['john doe', false],
    ['john--doe', false],
  ])('"%s" → %s', (handle, expected) => {
    expect(HANDLE_PATTERN.test(handle)).toBe(expected);
  });
});

describe('getPasswordStrength', () => {
  it('returns weak for empty string', () => {
    expect(getPasswordStrength('')).toBe('weak');
  });

  it('returns weak for short simple password', () => {
    expect(getPasswordStrength('abc')).toBe('weak');
  });

  it('returns medium for decent password', () => {
    expect(getPasswordStrength('Password1')).toBe('medium');
  });

  it('returns strong for complex password', () => {
    expect(getPasswordStrength('MyP@ssw0rd123')).toBe('strong');
  });
});
