/**
 * Validation schema tests (pokSchema).
 * Runs in the 'lib' jest project (node environment).
 *
 * Verifies that the mobile pokSchema accepts the same title/content limits
 * as the backend (@Size(max=200) / @Size(max=50000)) and passes all
 * special-character cases without rejection or transformation.
 */

import { pokSchema } from '../validations';
import { specialTitles } from '../../__tests__/fixtures/specialTitles';

const validContent = 'Some content';

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
