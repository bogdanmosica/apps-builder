import { describe, expect, it } from 'vitest';
import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('formats a date string to human readable', () => {
    expect(formatDate('2024-01-02')).toBe('January 2, 2024');
  });
});
