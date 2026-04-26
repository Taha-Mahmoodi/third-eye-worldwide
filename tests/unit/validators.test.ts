import { describe, expect, it } from 'vitest';
import { isValidEmail, EMAIL_RE } from '@/lib/validators';

describe('isValidEmail', () => {
  it('accepts well-formed addresses', () => {
    expect(isValidEmail('a@b.co')).toBe(true);
    expect(isValidEmail('jane.doe@example.org')).toBe(true);
    expect(isValidEmail('first+tag@sub.domain.com')).toBe(true);
  });

  it('trims surrounding whitespace before checking', () => {
    expect(isValidEmail('  ok@example.com  ')).toBe(true);
  });

  it('rejects single-letter TLDs', () => {
    // The previous loose client regex accepted this — the new one
    // requires 2+ chars after the final dot.
    expect(isValidEmail('a@b.c')).toBe(false);
  });

  it('rejects missing @', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
  });

  it('rejects empty local part', () => {
    expect(isValidEmail('@example.com')).toBe(false);
  });

  it('rejects empty domain', () => {
    expect(isValidEmail('jane@')).toBe(false);
  });

  it('rejects whitespace inside the address', () => {
    expect(isValidEmail('jane doe@example.com')).toBe(false);
  });

  it('rejects non-string input', () => {
    expect(isValidEmail(123 as unknown)).toBe(false);
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
    expect(isValidEmail({} as unknown)).toBe(false);
  });

  it('exposes the underlying regex for any other consumer that needs it', () => {
    expect(EMAIL_RE.test('jane@example.com')).toBe(true);
    expect(EMAIL_RE.test('bad')).toBe(false);
  });
});
