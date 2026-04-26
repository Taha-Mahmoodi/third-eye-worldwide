import { describe, expect, it } from 'vitest';
import { visibleSorted } from '@/lib/cms/db';

interface Item {
  id?: string;
  visible?: boolean;
  order?: number;
  label?: string;
}

describe('visibleSorted', () => {
  it('returns an empty array for non-array input', () => {
    expect(visibleSorted(null)).toEqual([]);
    expect(visibleSorted(undefined)).toEqual([]);
    expect(visibleSorted({})).toEqual([]);
    expect(visibleSorted('not an array' as unknown)).toEqual([]);
  });

  it('returns an empty array for an empty array', () => {
    expect(visibleSorted([])).toEqual([]);
  });

  it('filters out items with visible: false', () => {
    const items: Item[] = [
      { id: 'a', visible: true, order: 1 },
      { id: 'b', visible: false, order: 2 },
      { id: 'c', order: 3 }, // visible omitted = visible
    ];
    const out = visibleSorted<Item>(items);
    expect(out.map((i) => i.id)).toEqual(['a', 'c']);
  });

  it('sorts by `order` ascending', () => {
    const items: Item[] = [
      { id: 'c', order: 3 },
      { id: 'a', order: 1 },
      { id: 'b', order: 2 },
    ];
    expect(visibleSorted<Item>(items).map((i) => i.id)).toEqual(['a', 'b', 'c']);
  });

  it('treats missing `order` as 0 (so unordered items lead, stably)', () => {
    const items: Item[] = [
      { id: 'a' },
      { id: 'b', order: 5 },
      { id: 'c' },
    ];
    const out = visibleSorted<Item>(items).map((i) => i.id);
    expect(out[2]).toBe('b');
    expect(out.slice(0, 2).sort()).toEqual(['a', 'c']);
  });

  it('drops null and undefined entries defensively', () => {
    const items = [
      null,
      { id: 'a', order: 1 },
      undefined,
      { id: 'b', order: 2 },
    ] as Item[];
    expect(visibleSorted<Item>(items).map((i) => i.id)).toEqual(['a', 'b']);
  });

  it('does not mutate the input array', () => {
    const items: Item[] = [
      { id: 'b', order: 2 },
      { id: 'a', order: 1 },
    ];
    const before = items.map((i) => i.id);
    visibleSorted<Item>(items);
    expect(items.map((i) => i.id)).toEqual(before);
  });
});
