// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, expect, it, vi } from 'vitest';

import { useDebouncedValue } from './useDebouncedValue';
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
it('keeps only the final value after rapid changes, including under StrictMode', () => {
  vi.useFakeTimers();
  const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value), {
    initialProps: { value: '' },
    wrapper: StrictMode,
  });
  rerender({ value: 'E' });
  act(() => vi.advanceTimersByTime(200));
  rerender({ value: 'ETH' });
  act(() => vi.advanceTimersByTime(249));
  expect(result.current).toBe('');
  act(() => vi.advanceTimersByTime(1));
  expect(result.current).toBe('ETH');
});
it('cleans up its timer on unmount', () => {
  vi.useFakeTimers();
  const { rerender, unmount } = renderHook(({ value }) => useDebouncedValue(value), {
    initialProps: { value: '' },
  });
  rerender({ value: 'USDC' });
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});
