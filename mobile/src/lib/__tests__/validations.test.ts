/**
 * Validation schema tests (pokSchema).
 * Runs in the 'lib' jest project (node environment).
 *
 * Verifies that the mobile pokSchema accepts the same title/content limits
 * as the backend (@Size(max=200) / @Size(max=50000)) and passes all
 * special-character cases without rejection or transformation.
 */

import { pokSchema, registerSchema, loginSchema, forgotPasswordSchema, getPasswordStrength } from '../validations';
import { specialTitles } from '../../__tests__/fixtures/specialTitles';

const validContent = 'Some content';

// ---------------------------------------------------------------------------
// loginSchema
// ---------------------------------------------------------------------------

describe('loginSchema', () => {
  it('accepts valid email and password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'secret' });
    expect(result.success).toBe(true);
  });

  it('rejects empty email', () => {
    const result = loginSchema.safeParse({ email: '', password: 'secret' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email format', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'secret' });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: '' });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// registerSchema — password strength refinements
// ---------------------------------------------------------------------------

describe('registerSchema — password refinements', () => {
  const base = {
    email: 'user@example.com',
    password: 'ValidPass1',
    confirmPassword: 'ValidPass1',
    displayName: 'Alice',
    handle: 'alice123',
  };

  it('accepts a fully valid registration payload', () => {
    const result = registerSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it('rejects a password without an uppercase letter', () => {
    const result = registerSchema.safeParse({ ...base, password: 'nouppercase1', confirmPassword: 'nouppercase1' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msgs = result.error.errors.map((e) => e.message);
      expect(msgs).toContain('auth.errors.passwordUppercase');
    }
  });

  it('rejects a password without a lowercase letter', () => {
    const result = registerSchema.safeParse({ ...base, password: 'NOLOWERCASE1', confirmPassword: 'NOLOWERCASE1' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msgs = result.error.errors.map((e) => e.message);
      expect(msgs).toContain('auth.errors.passwordLowercase');
    }
  });

  it('rejects a password without a number', () => {
    const result = registerSchema.safeParse({ ...base, password: 'NoNumbers!!', confirmPassword: 'NoNumbers!!' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msgs = result.error.errors.map((e) => e.message);
      expect(msgs).toContain('auth.errors.passwordNumber');
    }
  });

  it('rejects when passwords do not match', () => {
    const result = registerSchema.safeParse({ ...base, confirmPassword: 'Different1' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msgs = result.error.errors.map((e) => e.message);
      expect(msgs).toContain('auth.errors.passwordsMismatch');
    }
  });

  it('rejects a password shorter than 8 characters', () => {
    const result = registerSchema.safeParse({ ...base, password: 'Sh0rt', confirmPassword: 'Sh0rt' });
    expect(result.success).toBe(false);
  });

  it('rejects a password longer than 128 characters', () => {
    const long = 'Aa1' + 'x'.repeat(126);
    const result = registerSchema.safeParse({ ...base, password: long, confirmPassword: long });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// forgotPasswordSchema
// ---------------------------------------------------------------------------

describe('forgotPasswordSchema', () => {
  it('accepts a valid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'user@example.com' });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'bad' });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getPasswordStrength
// ---------------------------------------------------------------------------

describe('getPasswordStrength', () => {
  it('returns weak for an empty string', () => {
    expect(getPasswordStrength('')).toBe('weak');
  });

  it('returns weak for a short all-lowercase password', () => {
    expect(getPasswordStrength('abc')).toBe('weak');
  });

  it('returns medium for a password meeting some criteria', () => {
    // length≥8 (+1), length<12 (0), uppercase (+1), lowercase (+1), number (+1) = 4 → medium
    expect(getPasswordStrength('Password1')).toBe('medium');
  });

  it('returns strong for a password meeting all criteria', () => {
    // length≥8, length≥12, uppercase, lowercase, number, special char = 6 → strong
    expect(getPasswordStrength('SecurePass1!')).toBe('strong');
  });

  it('returns strong for a very long mixed password', () => {
    expect(getPasswordStrength('VeryLongPassword123!')).toBe('strong');
  });
});

// ---------------------------------------------------------------------------
// Title field — length boundaries
// ---------------------------------------------------------------------------

describe('pokSchema — title length boundary', () => {
  it('accepts a title of exactly 200 characters', () => {
    const result = pokSchema.safeParse({ title: 'a'.repeat(200), content: validContent });
    expect(result.success).toBe(true);
  });

  it('rejects a title of 201 characters', () => {
    const result = pokSchema.safeParse({ title: 'a'.repeat(201), content: validContent });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('poks.errors.titleMaxLength');
    }
  });

  it('accepts an undefined title (optional)', () => {
    const result = pokSchema.safeParse({ content: validContent });
    expect(result.success).toBe(true);
  });

  it('accepts an empty string title', () => {
    // Empty string passes max(200) — the || null coercion in handleUpdate
    // converts '' to null before sending to the backend.
    const result = pokSchema.safeParse({ title: '', content: validContent });
    expect(result.success).toBe(true);
  });

  it('title max is 200 (mobile matches backend @Size(max=200) and web max(200))', () => {
    // Regression: mobile used max(255) while backend capped at 200.
    // A 201-char title must fail on mobile — not be accepted and then
    // rejected by the backend with a confusing 400 error.
    const result = pokSchema.safeParse({ title: 'a'.repeat(201), content: validContent });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Title field — special characters pass through unchanged
// ---------------------------------------------------------------------------

describe('pokSchema — special-character titles pass validation without transformation', () => {
  it.each(specialTitles)('accepts title=%p', (title) => {
    const result = pokSchema.safeParse({ title, content: validContent });
    expect(result.success).toBe(true);
    if (result.success) {
      // Zod must NOT transform the title — no trim, no normalisation
      expect(result.data.title).toBe(title);
    }
  });
});

// ---------------------------------------------------------------------------
// Content field — boundaries
// ---------------------------------------------------------------------------

describe('pokSchema — content boundaries', () => {
  it('accepts content of exactly 1 character', () => {
    const result = pokSchema.safeParse({ content: 'x' });
    expect(result.success).toBe(true);
  });

  it('rejects empty content', () => {
    const result = pokSchema.safeParse({ content: '' });
    expect(result.success).toBe(false);
  });

  it('rejects whitespace-only content (trim().min(1))', () => {
    const result = pokSchema.safeParse({ content: '   ' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('poks.errors.contentRequired');
    }
  });

  it('rejects content exceeding 50000 characters', () => {
    const result = pokSchema.safeParse({ content: 'a'.repeat(50001) });
    expect(result.success).toBe(false);
  });

  it('accepts content of exactly 50000 characters', () => {
    const result = pokSchema.safeParse({ content: 'a'.repeat(50000) });
    expect(result.success).toBe(true);
  });
});
