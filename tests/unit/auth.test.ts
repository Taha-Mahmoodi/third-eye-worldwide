import { describe, expect, it } from 'vitest';
import { scryptSync, randomBytes } from 'node:crypto';
import { verifyPassword } from '@/lib/auth';

/**
 * verifyPassword is the only piece of the auth path that doesn't
 * touch a database, so it's the one piece we can test in isolation.
 * If this stops returning the right boolean, every login on the site
 * silently breaks — these tests are the safety net.
 */

function hash(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const h = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${h}`;
}

describe('verifyPassword', () => {
  it('returns true for the correct password', () => {
    const stored = hash('correct-horse-battery-staple');
    expect(verifyPassword('correct-horse-battery-staple', stored)).toBe(true);
  });

  it('returns false for the wrong password', () => {
    const stored = hash('correct-horse-battery-staple');
    expect(verifyPassword('correct-horse', stored)).toBe(false);
  });

  it('returns false for an empty password', () => {
    const stored = hash('whatever');
    expect(verifyPassword('', stored)).toBe(false);
  });

  it('returns false for a malformed stored hash (no colon)', () => {
    expect(verifyPassword('whatever', 'no-colon-in-this-string')).toBe(false);
  });

  it('returns false for a stored hash that is just a colon', () => {
    expect(verifyPassword('whatever', ':')).toBe(false);
  });

  it('returns false for null stored hash', () => {
    expect(verifyPassword('whatever', null)).toBe(false);
  });

  it('returns false for undefined stored hash', () => {
    expect(verifyPassword('whatever', undefined)).toBe(false);
  });

  it('returns false when the salt portion is non-hex (scrypt throws)', () => {
    // scryptSync requires a string salt — this should not throw, it
    // should return false via the catch.
    expect(verifyPassword('p', 'not-hex-but-valid-format:0123abcd')).toBe(false);
  });
});
