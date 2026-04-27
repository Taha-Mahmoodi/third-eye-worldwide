import { describe, expect, it } from 'vitest';
import { isSafeImageUrl } from '@/lib/utils';

describe('isSafeImageUrl', () => {
  it('accepts allowlisted external origins', () => {
    expect(isSafeImageUrl('https://images.unsplash.com/photo-123.jpg')).toBe(true);
    expect(isSafeImageUrl('https://www.thirdeyeworldwide.org/uploads/foo.png')).toBe(true);
    expect(isSafeImageUrl('https://thirdeyeworldwide.org/team/jane.jpg')).toBe(true);
  });

  it('accepts relative same-origin paths', () => {
    expect(isSafeImageUrl('/uploads/team/jane.jpg')).toBe(true);
    expect(isSafeImageUrl('/assets/hero.png')).toBe(true);
  });

  it('rejects empty / nullish values', () => {
    expect(isSafeImageUrl('')).toBe(false);
    expect(isSafeImageUrl(undefined)).toBe(false);
    expect(isSafeImageUrl(null)).toBe(false);
  });

  it('rejects non-allowlisted origins', () => {
    expect(isSafeImageUrl('https://evil.example/foo.png')).toBe(false);
    expect(isSafeImageUrl('https://attacker.com/track.gif')).toBe(false);
  });

  it('rejects javascript: and data: URIs', () => {
    expect(isSafeImageUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeImageUrl('data:image/png;base64,iVBOR')).toBe(false);
  });

  it('rejects protocol-relative URLs (no origin guarantee)', () => {
    expect(isSafeImageUrl('//images.unsplash.com/photo-1.jpg')).toBe(false);
  });

  it('rejects malformed URLs', () => {
    expect(isSafeImageUrl('not a url')).toBe(false);
    expect(isSafeImageUrl('https://')).toBe(false);
  });
});
