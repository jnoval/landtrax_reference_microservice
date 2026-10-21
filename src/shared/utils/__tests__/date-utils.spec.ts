import { formatToUserDate, isIsoDateWithTime } from '../date-utils';

describe('date-utils', () => {
  describe('formatToUserDate', () => {
    it('returns empty string for null, undefined, or empty date', () => {
      expect(formatToUserDate(null)).toBe('');
      expect(formatToUserDate(undefined)).toBe('');
      expect(formatToUserDate('')).toBe('');
      expect(formatToUserDate('invalid-date')).toBe('');
    });

    it('formats date object correctly', () => {
      const d = new Date(2026, 4, 15, 14, 30); // May 15, 2026 2:30 PM
      const formatted = formatToUserDate(d);
      expect(formatted).toContain('05/15/2026 02:30 PM');
    });

    it('formats AM hours correctly', () => {
      const d = new Date(2026, 0, 5, 9, 5); // Jan 5, 2026 9:05 AM
      const formatted = formatToUserDate(d);
      expect(formatted).toContain('01/05/2026 09:05 AM');
    });
  });

  describe('isIsoDateWithTime', () => {
    it('returns true for ISO timestamp', () => {
      expect(isIsoDateWithTime('2026-05-15T14:30:00.000Z')).toBe(true);
    });

    it('returns false for date-only or non-ISO strings', () => {
      expect(isIsoDateWithTime('2026-05-15')).toBe(false);
      expect(isIsoDateWithTime('')).toBe(false);
    });
  });
});
