import { ImageResponse } from 'next/og';
import { SITE } from '@/lib/seo';

/*
 * Default OpenGraph / Twitter card image: 1200 × 630. Generated at
 * request time via Next's ImageResponse; no PNG binary committed.
 *
 * Routes that want a page-specific card can drop their own
 * opengraph-image.js next to their page.js and Next will prefer it.
 */

export const runtime = 'edge';
export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          background: 'linear-gradient(135deg, #1a0f14 0%, #4a1030 45%, #d63384 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Brand wordmark + eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: '#ffffff',
              color: '#d63384',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: -1,
            }}
          >
            TE
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: 4,
              textTransform: 'uppercase',
              opacity: 0.85,
            }}
          >
            Third Eye Worldwide
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            maxWidth: 900,
          }}
        >
          <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05 }}>
            {SITE.tagline}.
          </div>
          <div style={{ fontSize: 28, lineHeight: 1.4, opacity: 0.9 }}>
            Free, open-source assistive technology for people with visual impairment.
          </div>
        </div>

        {/* Footer meta */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 20,
            opacity: 0.75,
            borderTop: '1px solid rgba(255,255,255,0.3)',
            paddingTop: 24,
          }}
        >
          <div>Voice-first · Open source · MIT-licensed forever</div>
          <div style={{ fontWeight: 600 }}>{SITE.baseUrl.replace(/^https?:\/\//, '')}</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
