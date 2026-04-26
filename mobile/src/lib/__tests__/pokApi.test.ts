/**
 * pokApi unit tests.
 * Runs in the 'lib' jest project (node environment).
 *
 * Asserts that pokApi.update serializes the payload correctly and delegates to
 * apiFetch with the right method, URL, and body. Parameterized over
 * specialTitles to catch character-encoding regressions.
 */

// ---------------------------------------------------------------------------
// Mocks (hoisted before imports)
// ---------------------------------------------------------------------------

const mockApiFetch = jest.fn();

jest.mock('../api', () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { pokApi } from '../pokApi';
import { specialTitles } from '../../__tests__/fixtures/specialTitles';

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  mockApiFetch.mockReset();
});

// ---------------------------------------------------------------------------
// pokApi.update
// ---------------------------------------------------------------------------

describe('pokApi.update', () => {
  const POK_ID = 'pok-abc-123';
  const baseDto = { content: 'Some content', visibility: 'PRIVATE' as const };

  it('calls apiFetch with PUT method and the correct URL', async () => {
    const resolvedPok = { id: POK_ID, title: 'New Title', content: 'Some content', visibility: 'PRIVATE' };
    mockApiFetch.mockResolvedValue(resolvedPok);

    await pokApi.update(POK_ID, { ...baseDto, title: 'New Title' });

    expect(mockApiFetch).toHaveBeenCalledTimes(1);
    const [path, options] = mockApiFetch.mock.calls[0] as [string, RequestInit];
    expect(path).toBe(`/poks/${POK_ID}`);
    expect(options.method).toBe('PUT');
  });

  it('serializes the payload as JSON', async () => {
    const dto = { title: 'New Title', content: 'Some content', visibility: 'PRIVATE' as const };
    mockApiFetch.mockResolvedValue({ ...dto, id: POK_ID });

    await pokApi.update(POK_ID, dto);

    const [, options] = mockApiFetch.mock.calls[0] as [string, RequestInit];
    expect(options.body).toBe(JSON.stringify(dto));
  });

  it('passes null title when title is null', async () => {
    const dto = { title: null, content: 'Some content', visibility: 'PRIVATE' as const };
    mockApiFetch.mockResolvedValue({ id: POK_ID, title: null, content: 'Some content', visibility: 'PRIVATE' });

    await pokApi.update(POK_ID, dto);

    const [, options] = mockApiFetch.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(options.body as string).title).toBeNull();
  });

  it('returns the pok from apiFetch', async () => {
    const expected = { id: POK_ID, title: 'Returned', content: 'c', visibility: 'PRIVATE' };
    mockApiFetch.mockResolvedValue(expected);

    const result = await pokApi.update(POK_ID, { ...baseDto, title: 'anything' });

    expect(result).toBe(expected);
  });

  // Parameterized over the canonical special-character fixture set.
  // Each title must round-trip through JSON.stringify unchanged.
  describe('special-character title round-trip (JSON serialization)', () => {
    it.each(specialTitles)('sends title=%p unchanged in JSON body', async (title) => {
      mockApiFetch.mockResolvedValue({ id: POK_ID, title, content: 'c', visibility: 'PRIVATE' });

      await pokApi.update(POK_ID, { ...baseDto, title });

      const [, options] = mockApiFetch.mock.calls[0] as [string, RequestInit];
      const parsed = JSON.parse(options.body as string);
      expect(parsed.title).toBe(title);
    });
  });

  describe('with AbortSignal', () => {
    it('forwards the signal to apiFetch', async () => {
      const controller = new AbortController();
      mockApiFetch.mockResolvedValue({ id: POK_ID, title: 'x', content: 'c', visibility: 'PRIVATE' });

      await pokApi.update(POK_ID, { ...baseDto, title: 'x' }, controller.signal);

      expect(mockApiFetch.mock.calls[0][2]).toBe(controller.signal);
    });
  });
});
