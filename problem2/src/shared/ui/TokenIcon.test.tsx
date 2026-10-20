// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { TokenIcon } from './TokenIcon';
afterEach(cleanup);
it('falls back on image failure and attempts an image for a newly selected symbol', () => {
  const { container, rerender } = render(<TokenIcon symbol="ETH" />);
  const image = container.querySelector('img');
  expect(image).not.toBeNull();
  if (!image) throw new Error('Expected token image');
  fireEvent.error(image);
  expect(container.textContent).toBe('E');
  expect(container.querySelector('img')).toBeNull();
  rerender(<TokenIcon symbol="USDC" />);
  expect(container.querySelector('img')?.getAttribute('src')).toContain('/USDC.svg');
});
