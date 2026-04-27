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
// pokApi.create
// ---------------------------------------------------------------------------

describe('pokApi.create', () => {
  it('calls apiFetch with POST method and /poks URL', async () => {
    const dto = { content: 'My first learning', visibility: 'PRIVATE' as const };
    const resolved = { id: 'new-id', title: null, content: dto.content, visibility: 'PRIVATE' };
    mockApiFetch.mockResolvedValue(resolved);

    await pokApi.create(dto);

    expect(mockApiFetch).toHaveBeenCalledTimes(1);
    const [path, options] = mockApiFetch.mock.calls[0] as [string, RequestInit];
    expect(path).toBe('/poks');
    expect(options.method).toBe('POST');
  });

  it('serializes the create payload as JSON', async () => {
    const dto = { title: 'Title', content: 'Body', visibility: 'PUBLIC' as const, tagIds: ['t1', 't2'] };
    mockApiFetch.mockResolvedValue({ id: 'x', ...dto });

    await pokApi.create(dto);

    const [, options] = mockApiFetch.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(options.body as string)).toEqual(dto);
  });

  it('forwards the AbortSignal', async () => {
    const controller = new AbortController();
    mockApiFetch.mockResolvedValue({ id: 'y', content: 'c', visibility: 'PRIVATE' });

    await pokApi.create({ content: 'c' }, controller.signal);

    expect(mockApiFetch.mock.calls[0][2]).toBe(controller.signal);
  });

  it('returns the pok from apiFetch', async () => {
    const expected = { id: 'z', title: 'T', content: 'c', visibility: 'PUBLIC' };
    mockApiFetch.mockResolvedValue(expected);

    const result = await pokApi.create({ content: 'c' });

    expect(result).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// pokApi.getAll
// ---------------------------------------------------------------------------

describe('pokApi.getAll', () => {
  it('calls apiFetch with default page=0 and size=20 when no params supplied', async () => {
    mockApiFetch.mockResolvedValue({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0, number: 0 });

    await pokApi.getAll();

    const [path] = mockApiFetch.mock.calls[0] as [string];
    expect(path).toContain('page=0');
    expect(path).toContain('size=20');
  });

  it('includes keyword in query string when provided', async () => {
    mockApiFetch.mockResolvedValue({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0, number: 0 });

    await pokApi.getAll({ keyword: 'react' });

    const [path] = mockApiFetch.mock.calls[0] as [string];
    expect(path).toContain('keyword=react');
  });

  it('includes searchMode, tagId, sortBy, sortDirection when provided', async () => {
    mockApiFetch.mockResolvedValue({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0, number: 0 });

    await pokApi.getAll({
      searchMode: 'semantic',
      tagId: 'tag-1',
      sortBy: 'updatedAt',
      sortDirection: 'ASC',
    });

    const [path] = mockApiFetch.mock.calls[0] as [string];
    expect(path).toContain('searchMode=semantic');
    expect(path).toContain('tagId=tag-1');
    expect(path).toContain('sortBy=updatedAt');
    expect(path).toContain('sortDirection=ASC');
  });

  it('includes date filter params when provided', async () => {
    mockApiFetch.mockResolvedValue({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0, number: 0 });

    await pokApi.getAll({
      createdFrom: '2024-01-01',
      createdTo: '2024-12-31',
      updatedFrom: '2024-06-01',
      updatedTo: '2024-06-30',
    });

    const [path] = mockApiFetch.mock.calls[0] as [string];
    expect(path).toContain('createdFrom=2024-01-01');
    expect(path).toContain('createdTo=2024-12-31');
    expect(path).toContain('updatedFrom=2024-06-01');
    expect(path).toContain('updatedTo=2024-06-30');
  });

  it('uses custom page and size values', async () => {
    mockApiFetch.mockResolvedValue({ content: [], page: 2, size: 10, totalElements: 25, totalPages: 3, number: 2 });

    await pokApi.getAll({ page: 2, size: 10 });

    const [path] = mockApiFetch.mock.calls[0] as [string];
    expect(path).toContain('page=2');
    expect(path).toContain('size=10');
  });

  it('forwards the AbortSignal', async () => {
    const controller = new AbortController();
    mockApiFetch.mockResolvedValue({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0, number: 0 });

    await pokApi.getAll({}, controller.signal);

    expect(mockApiFetch.mock.calls[0][2]).toBe(controller.signal);
  });

  it('returns the page from apiFetch', async () => {
    const expected = { content: [{ id: 'p1' }], page: 0, size: 20, totalElements: 1, totalPages: 1, number: 0 };
    mockApiFetch.mockResolvedValue(expected);

    const result = await pokApi.getAll();

    expect(result).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// pokApi.getById
// ---------------------------------------------------------------------------

describe('pokApi.getById', () => {
  const POK_ID = 'pok-get-001';

  it('calls apiFetch with the correct URL (no method override — default GET)', async () => {
    const pok = { id: POK_ID, title: 'T', content: 'C', visibility: 'PRIVATE' };
    mockApiFetch.mockResolvedValue(pok);

    await pokApi.getById(POK_ID);

    const [path] = mockApiFetch.mock.calls[0] as [string];
    expect(path).toBe(`/poks/${POK_ID}`);
  });

  it('forwards the AbortSignal', async () => {
    const controller = new AbortController();
    mockApiFetch.mockResolvedValue({ id: POK_ID, content: 'c', visibility: 'PRIVATE' });

    await pokApi.getById(POK_ID, controller.signal);

    expect(mockApiFetch.mock.calls[0][2]).toBe(controller.signal);
  });

  it('returns the pok from apiFetch', async () => {
    const expected = { id: POK_ID, title: 'T', content: 'C', visibility: 'PUBLIC' };
    mockApiFetch.mockResolvedValue(expected);

    const result = await pokApi.getById(POK_ID);

    expect(result).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// pokApi.delete
// ---------------------------------------------------------------------------

describe('pokApi.delete', () => {
  const POK_ID = 'pok-del-999';

  it('calls apiFetch with DELETE method and the correct URL', async () => {
    mockApiFetch.mockResolvedValue(undefined);

    await pokApi.delete(POK_ID);

    const [path, options] = mockApiFetch.mock.calls[0] as [string, RequestInit];
    expect(path).toBe(`/poks/${POK_ID}`);
    expect(options.method).toBe('DELETE');
  });
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
