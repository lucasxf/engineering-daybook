import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// vi.hoisted ensures these are available inside the vi.mock factory closures
const { mockPush, mockGetAll, mockUseAuth, mockUseSearchParams } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockGetAll: vi.fn(),
  mockUseAuth: vi.fn(),
  mockUseSearchParams: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' }),
  useRouter: () => ({ push: mockPush }),
  useSearchParams: mockUseSearchParams,
  usePathname: () => '/en/poks',
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: mockUseAuth,
}));

vi.mock('@/lib/pokApi', () => ({
  pokApi: { getAll: mockGetAll },
}));

vi.mock('@/lib/api', () => ({
  ApiRequestError: class ApiRequestError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.name = 'ApiRequestError';
      this.status = status;
    }
  },
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

import { usePoksData } from '@/hooks/usePoksData';
import type { Pok } from '@/lib/pokApi';

const MOCK_POK: Pok = {
  id: '1',
  userId: 'user-1',
  title: 'Test Learning',
  content: 'Some content',
  deletedAt: null,
  createdAt: '2026-02-01T10:00:00Z',
  updatedAt: '2026-02-01T10:00:00Z',
  tags: [],
  pendingSuggestions: [],
};

const EMPTY_PAGE = { content: [], totalElements: 0, totalPages: 0, page: 0, size: 20, number: 0 };

describe('usePoksData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    mockGetAll.mockResolvedValue(EMPTY_PAGE);
  });

  // ─── Auth state ────────────────────────────────────────────────────────────

  describe('auth state', () => {
    it('isReady is false when auth is loading', () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: true });
      const { result } = renderHook(() => usePoksData({ fetchSize: 20 }));
      expect(result.current.isReady).toBe(false);
    });

    it('isReady is false when not authenticated', () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
      const { result } = renderHook(() => usePoksData({ fetchSize: 20 }));
      expect(result.current.isReady).toBe(false);
    });

    it('isReady is true when authenticated', () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
      const { result } = renderHook(() => usePoksData({ fetchSize: 20 }));
      expect(result.current.isReady).toBe(true);
    });

    it('redirects to login when not authenticated', () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
      renderHook(() => usePoksData({ fetchSize: 20 }));
      expect(mockPush).toHaveBeenCalledWith('/en/login');
    });

    it('does not redirect while auth is loading', () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: true });
      renderHook(() => usePoksData({ fetchSize: 20 }));
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  // ─── URL state reading ─────────────────────────────────────────────────────

  describe('URL state', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    });

    it('default sort is createdAt DESC', () => {
      const { result } = renderHook(() => usePoksData({ fetchSize: 20 }));
      expect(result.current.sortOption).toEqual({ sortBy: 'createdAt', sortDirection: 'DESC' });
    });

    it('reads keyword from URL', () => {
      mockUseSearchParams.mockReturnValue(new URLSearchParams('keyword=react'));
      const { result } = renderHook(() => usePoksData({ fetchSize: 20 }));
      expect(result.current.keyword).toBe('react');
    });

    it('reads sortBy and sortDirection from URL', () => {
      mockUseSearchParams.mockReturnValue(new URLSearchParams('sortBy=updatedAt&sortDirection=ASC'));
      const { result } = renderHook(() => usePoksData({ fetchSize: 20 }));
      expect(result.current.sortOption).toEqual({ sortBy: 'updatedAt', sortDirection: 'ASC' });
    });

    it('reads page from URL', () => {
      mockUseSearchParams.mockReturnValue(new URLSearchParams('page=3'));
      const { result } = renderHook(() => usePoksData({ fetchSize: 20 }));
      expect(result.current.page).toBe(3);
    });

    it('defaults page to 0', () => {
      const { result } = renderHook(() => usePoksData({ fetchSize: 20 }));
      expect(result.current.page).toBe(0);
    });
  });

  // ─── Data loading ──────────────────────────────────────────────────────────

  describe('data loading', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    });

    it('loads poks and sets state on success', async () => {
      mockGetAll.mockResolvedValue({ ...EMPTY_PAGE, content: [MOCK_POK], totalElements: 1 });

      const { result } = renderHook(() => usePoksData({ fetchSize: 20 }));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.poks).toEqual([MOCK_POK]);
      expect(result.current.totalElements).toBe(1);
    });

    it('calls pokApi.getAll with the provided fetchSize', async () => {
      renderHook(() => usePoksData({ fetchSize: 1000 }));

      await waitFor(() => expect(mockGetAll).toHaveBeenCalled());

      expect(mockGetAll).toHaveBeenCalledWith(expect.objectContaining({ size: 1000 }));
    });

    it('passes keyword and sort to the API', async () => {
      mockUseSearchParams.mockReturnValue(
        new URLSearchParams('keyword=react&sortBy=updatedAt&sortDirection=ASC')
      );

      renderHook(() => usePoksData({ fetchSize: 20 }));

      await waitFor(() => expect(mockGetAll).toHaveBeenCalled());

      expect(mockGetAll).toHaveBeenCalledWith(
        expect.objectContaining({ keyword: 'react', sortBy: 'updatedAt', sortDirection: 'ASC' })
      );
    });

    it('sets loading to true while fetching', async () => {
      let settle!: () => void;
      mockGetAll.mockReturnValue(new Promise((resolve) => { settle = () => resolve(EMPTY_PAGE); }));

      const { result } = renderHook(() => usePoksData({ fetchSize: 20 }));
      expect(result.current.loading).toBe(true);

      act(() => settle());
      await waitFor(() => expect(result.current.loading).toBe(false));
    });

    it('sets error and clears loading on API failure', async () => {
      mockGetAll.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => usePoksData({ fetchSize: 20 }));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).not.toBeNull();
    });

    it('does not call pokApi.getAll when not authenticated', () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
      renderHook(() => usePoksData({ fetchSize: 20 }));
      expect(mockGetAll).not.toHaveBeenCalled();
    });
  });

  // ─── URL updates ───────────────────────────────────────────────────────────

  describe('URL updates', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    });

    it('handleSearch pushes URL with new keyword', async () => {
      const { result } = renderHook(() => usePoksData({ fetchSize: 20 }));
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => result.current.handleSearch('react'));

      const url = mockPush.mock.calls.at(-1)![0] as string;
      expect(url).toContain('keyword=react');
    });

    it('handleSortChange pushes URL with non-default sort params', async () => {
      const { result } = renderHook(() => usePoksData({ fetchSize: 20 }));
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => result.current.handleSortChange({ sortBy: 'createdAt', sortDirection: 'ASC' }));

      const url = mockPush.mock.calls.at(-1)![0] as string;
      expect(url).toContain('sortBy=createdAt');
      expect(url).toContain('sortDirection=ASC');
    });

    it('handleClearSearch pushes URL without keyword', async () => {
      mockUseSearchParams.mockReturnValue(new URLSearchParams('keyword=react'));
      const { result } = renderHook(() => usePoksData({ fetchSize: 20 }));
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => result.current.handleClearSearch());

      const url = mockPush.mock.calls.at(-1)![0] as string;
      expect(url).not.toContain('keyword=');
    });

    it('omits sort params from URL when using default (createdAt DESC)', async () => {
      const { result } = renderHook(() => usePoksData({ fetchSize: 20 }));
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => result.current.handleSortChange({ sortBy: 'createdAt', sortDirection: 'DESC' }));

      const url = mockPush.mock.calls.at(-1)![0] as string;
      expect(url).not.toContain('sortBy=');
      expect(url).not.toContain('sortDirection=');
    });

    it('preserves view param when updating URL', async () => {
      mockUseSearchParams.mockReturnValue(new URLSearchParams('view=tags'));
      const { result } = renderHook(() => usePoksData({ fetchSize: 20 }));
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => result.current.handleSearch('react'));

      const url = mockPush.mock.calls.at(-1)![0] as string;
      expect(url).toContain('view=tags');
    });
  });

  // ─── handleQuickSave ───────────────────────────────────────────────────────

  describe('handleQuickSave', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    });

    it('prepends new pok to the list', async () => {
      mockGetAll.mockResolvedValue({ ...EMPTY_PAGE, content: [MOCK_POK], totalElements: 1 });

      const { result } = renderHook(() => usePoksData({ fetchSize: 20 }));
      await waitFor(() => expect(result.current.loading).toBe(false));

      const newPok: Pok = { ...MOCK_POK, id: '2', title: 'New Learning' };
      act(() => result.current.handleQuickSave(newPok));

      expect(result.current.poks[0]).toEqual(newPok);
      expect(result.current.poks).toHaveLength(2);
    });

    it('increments totalElements', async () => {
      mockGetAll.mockResolvedValue({ ...EMPTY_PAGE, content: [MOCK_POK], totalElements: 5 });

      const { result } = renderHook(() => usePoksData({ fetchSize: 20 }));
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => result.current.handleQuickSave({ ...MOCK_POK, id: '2' }));

      expect(result.current.totalElements).toBe(6);
    });
  });
});
