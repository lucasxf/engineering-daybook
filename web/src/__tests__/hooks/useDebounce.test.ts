import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';

// Mock timers
vi.useFakeTimers();

describe('useDebounce', () => {
  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));

    expect(result.current).toBe('initial');
  });

  it('should debounce value changes by 300ms', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'updated' });

    // Value should not update immediately
    expect(result.current).toBe('initial');

    // Fast-forward 299ms
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe('initial');

    // Fast-forward 1ms more (total 300ms)
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('updated');
  });

  it('should reset timer on rapid value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } }
    );

    // Rapid changes (within 300ms)
    rerender({ value: 'ab' });
    act(() => { vi.advanceTimersByTime(100); });

    rerender({ value: 'abc' });
    act(() => { vi.advanceTimersByTime(100); });

    rerender({ value: 'abcd' });
    act(() => { vi.advanceTimersByTime(100); });

    // Only 300ms total, but timer was reset each time
    expect(result.current).toBe('a');

    // Fast-forward remaining time
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('abcd');
  });

  it('should cleanup timer on unmount', () => {
    const { unmount } = renderHook(() => useDebounce('test', 300));

    const timeoutCount = vi.getTimerCount();
    expect(timeoutCount).toBeGreaterThan(0);

    unmount();

    // Timer should be cleared on unmount
    expect(vi.getTimerCount()).toBe(0);
  });

  it('should support custom delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    // Should not update after 300ms (custom delay is 500ms)
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('initial');

    // Should update after 500ms
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('updated');
  });
});
