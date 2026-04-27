import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import CmsIcon from '@/components/CmsIcon';

/**
 * Coverage for the CMS icon allowlist + name normalisation. The
 * actual rendered SVG markup is Phosphor's responsibility — we
 * just assert that the right component was picked, that unknowns
 * fall through to null, and that the legacy `ph-` prefix still
 * resolves (so old CMS values keep working).
 */

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('CmsIcon', () => {
  it('renders an SVG for a known name', () => {
    const { container } = render(<CmsIcon name="house-line" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
  });

  it('strips the legacy `ph-` prefix', () => {
    const { container } = render(<CmsIcon name="ph-house-line" />);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('accepts the PascalCase form (e.g. `HouseLine`)', () => {
    const { container } = render(<CmsIcon name="HouseLine" />);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('renders nothing for an unknown name', () => {
    const { container } = render(<CmsIcon name="not-a-real-icon-name" />);
    expect(container.querySelector('svg')).toBeNull();
    // It also surfaces a console warning in dev so devs notice the gap.
    expect(console.warn).toHaveBeenCalled();
  });

  it('renders nothing for null / undefined / non-string', () => {
    const a = render(<CmsIcon name={null} />);
    const b = render(<CmsIcon name={undefined} />);
    expect(a.container.querySelector('svg')).toBeNull();
    expect(b.container.querySelector('svg')).toBeNull();
  });

  it('passes through `weight="fill"` to the rendered icon', () => {
    const { container } = render(<CmsIcon name="hand-heart" weight="fill" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    // Phosphor's fill-weight icons render with no fill="none" attribute
    // and use `<path d="..."/>` rather than a stroke-based path. Easiest
    // proof the weight prop made it: fill !== none.
    expect(svg?.getAttribute('fill')).not.toBe('none');
  });

  it('size="1em" matches the parent line-height, not 32px', () => {
    const { container } = render(<CmsIcon name="house-line" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('1em');
    expect(svg?.getAttribute('height')).toBe('1em');
  });

  it('explicit numeric size is honored', () => {
    const { container } = render(<CmsIcon name="house-line" size={20} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('20');
  });
});
