/**
 * i18n interpolation smoke tests.
 *
 * Verifies two categories of interpolated keys across both locales (en, pt-BR):
 *
 * A. %{...} keys — standard i18n-js interpolation syntax. These are resolved by
 *    i18n.t(). Tests assert the placeholder is expanded and no raw %{...} appears.
 *
 * B. {bare} keys — NOT processed by i18n-js (no % prefix). These are template
 *    strings where components perform manual .replace('{token}', value). Tests
 *    assert the key exists and the raw {token} pattern IS present (it is NOT
 *    expected to be resolved by i18n-js).
 *
 * C. Key parity — both locales must define the same set of interpolated keys.
 */

import { i18n, setLocale } from '../i18n';
import enLocale from '../locales/en';
import ptBRLocale from '../locales/pt-BR';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Collect all leaf values from a nested object, with dot-notation keys. */
function collectLeaves(obj: unknown, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  if (typeof obj !== 'object' || obj === null) return result;
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') {
      result[key] = v;
    } else {
      Object.assign(result, collectLeaves(v, key));
    }
  }
  return result;
}

/** Keys that use standard i18n-js interpolation: %{name} */
const PERCENT_INTERPOLATED_KEYS: Record<string, Record<string, string>> = {
  'learnings.detail.tagCreateNew': { name: 'react' },
  'learnings.detail.removeTagAccessibilityLabel': { tagName: 'javascript' },
  'learnings.detail.showAllTags': { count: '5' },
};

/** Keys that use bare {token} interpolation (manual replace in components, NOT i18n-js). */
const BARE_INTERPOLATED_KEYS: string[] = [
  'profile.bioCharCount',
  'relearnings.modal.charCounter',
  'relearnings.modal.charCounterLabel',
];

// ---------------------------------------------------------------------------
// A. %{...} interpolation — i18n-js resolves these
// ---------------------------------------------------------------------------

describe('i18n %{...} interpolation (en)', () => {
  beforeEach(() => setLocale('en'));
  afterAll(() => setLocale('en'));

  for (const [key, scope] of Object.entries(PERCENT_INTERPOLATED_KEYS)) {
    it(`${key} resolves placeholder with i18n.t()`, () => {
      const result = i18n.t(key, scope);
      expect(result).not.toMatch(/%\{/);
      // Each test value should appear in the output
      for (const value of Object.values(scope)) {
        expect(result).toContain(value);
      }
    });
  }
});

describe('i18n %{...} interpolation (pt-BR)', () => {
  beforeEach(() => setLocale('pt-BR'));
  afterAll(() => setLocale('en'));

  for (const [key, scope] of Object.entries(PERCENT_INTERPOLATED_KEYS)) {
    it(`${key} resolves placeholder with i18n.t()`, () => {
      const result = i18n.t(key, scope);
      expect(result).not.toMatch(/%\{/);
      for (const value of Object.values(scope)) {
        expect(result).toContain(value);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// B. {bare} interpolation — manual replace in components, NOT resolved by i18n-js
// ---------------------------------------------------------------------------

describe('bare {token} keys exist and contain placeholders', () => {
  const enLeaves = collectLeaves(enLocale);

  for (const key of BARE_INTERPOLATED_KEYS) {
    it(`${key} exists and contains a {token} placeholder`, () => {
      expect(enLeaves[key]).toBeDefined();
      expect(enLeaves[key]).toMatch(/\{[a-z]+\}/);
    });
  }
});

// ---------------------------------------------------------------------------
// C. Key parity between en and pt-BR
// ---------------------------------------------------------------------------

describe('interpolated key parity (en == pt-BR)', () => {
  const enLeaves = collectLeaves(enLocale);
  const ptBRLeaves = collectLeaves(ptBRLocale);

  const enPercentKeys = Object.keys(enLeaves).filter((k) => enLeaves[k].includes('%{'));
  const ptBRPercentKeys = Object.keys(ptBRLeaves).filter((k) => ptBRLeaves[k].includes('%{'));

  it('both locales have the same %{...} keys', () => {
    expect(enPercentKeys.sort()).toEqual(ptBRPercentKeys.sort());
  });

  const enBareKeys = Object.keys(enLeaves).filter(
    (k) => /\{[a-z]+\}/.test(enLeaves[k]) && !enLeaves[k].includes('%{')
  );
  const ptBRBareKeys = Object.keys(ptBRLeaves).filter(
    (k) => /\{[a-z]+\}/.test(ptBRLeaves[k]) && !ptBRLeaves[k].includes('%{')
  );

  it('both locales have the same bare {token} keys', () => {
    expect(enBareKeys.sort()).toEqual(ptBRBareKeys.sort());
  });
});
