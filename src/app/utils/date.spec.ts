import { formatDateTime, formatMonth } from './date';

describe('date utils', () => {
  it('formats a calendar month without shifting it to the local zone', () => {
    expect(formatMonth('2020-09-01', 'it')).toBe('set 2020');
    expect(formatMonth('2020-09-01', 'en')).toBe('Sep 2020');
  });

  it('reads a zoneless BE timestamp as UTC', () => {
    expect(formatDateTime('2026-11-20T15:04:05', 'it')).toBe(formatDateTime('2026-11-20T15:04:05Z', 'it'));
    expect(formatDateTime('2026-11-20T15:04:05', 'it')).toContain('2026');
  });
});
