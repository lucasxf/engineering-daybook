/**
 * Canonical special-character title fixture.
 *
 * Import this in every test that asserts a string field round-trips through an
 * API call or validation. Using bland ASCII-only strings in title assertions
 * masks character-encoding or transformation bugs — the colon bug (#mobile-title)
 * was invisible until a colon-containing title was used in a test.
 *
 * Each entry must round-trip unchanged through:
 *   mobile → JSON.stringify → network → backend → JSON → mobile
 *
 * If you add a layer that processes the title field, add a test parameterized
 * over this set to prove that layer is character-agnostic.
 */
export const specialTitles = [
  'MAU: Monthly Active Users',       // colon — the originally reported bug
  'Hello, world',                     // comma
  'A; B; C',                          // semicolon
  'Q&A session',                      // ampersand
  '🎯 Goal',                          // emoji (multi-byte / surrogate pair)
  'שלום עולם',                        // RTL (Hebrew)
  '   leading-and-trailing-ws   ',    // whitespace (documents trim behaviour)
  'tab\there',                        // horizontal tab
  'quote "embedded"',                 // double-quote
  "apostrophe's",                     // single-quote
  'a'.repeat(200),                    // boundary at backend max (200)
] as const;
