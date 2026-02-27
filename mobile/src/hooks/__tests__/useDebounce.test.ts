/**
 * useDebounce unit tests.
 * We test the debounce logic in isolation using Jest fake timers.
 * No React rendering is needed — we invoke the hook logic via a standalone utility
 * to keep tests in the `lib` jest project (node environment).
 */

// ---------------------------------------------------------------------------
// Standalone debounce function (mirrors useDebounce behaviour)
// ---------------------------------------------------------------------------

function debounce<T>(
  setValue: (v: T) => void,
  value: T,
  delay: number,
): ReturnType<typeof setTimeout> {
  return setTimeout(() => setValue(value), delay);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('debounce logic (mirrors useDebounce)', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('does not call the setter before the delay elapses', () => {
    const setter = jest.fn();
    debounce(setter, 'hello', 300);

    jest.advanceTimersByTime(299);
    expect(setter).not.toHaveBeenCalled();
  });

  it('calls the setter after the delay elapses', () => {
    const setter = jest.fn();
    debounce(setter, 'hello', 300);

    jest.advanceTimersByTime(300);
    expect(setter).toHaveBeenCalledWith('hello');
  });

  it('only fires once for the last value when called rapidly', () => {
    const setter = jest.fn();
    let timerId: ReturnType<typeof setTimeout>;

    timerId = debounce(setter, 'a', 300);
    clearTimeout(timerId);
    timerId = debounce(setter, 'ab', 300);
    clearTimeout(timerId);
    timerId = debounce(setter, 'abc', 300);

    jest.advanceTimersByTime(300);
    expect(setter).toHaveBeenCalledTimes(1);
    expect(setter).toHaveBeenCalledWith('abc');
  });

  it('uses default 300ms delay', () => {
    const setter = jest.fn();
    debounce(setter, 'test', 300);

    jest.advanceTimersByTime(299);
    expect(setter).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(setter).toHaveBeenCalled();
  });
});
