import './globals.css';
import type { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ClientBootstrap from '@/components/ClientBootstrap';
import AudioTour from '@/components/AudioTour';
import VoiceAssistant from '@/components/VoiceAssistant';
import JsonLd from '@/components/JsonLd';
import { SITE, pageMetadata, organizationJsonLd } from '@/lib/seo';

// Root metadata — every route inherits these and overrides via
// its own generateMetadata() / pageMetadata() calls.
export const metadata: Metadata = {
  ...pageMetadata({
    title: SITE.defaultTitle,
    description: SITE.description,
    path: '/',
  }),
  title: {
    default: SITE.defaultTitle,
    template: SITE.titleTemplate,
  },
  applicationName: SITE.name,
  authors: [{ name: SITE.orgLegalName }],
  creator: SITE.orgLegalName,
  publisher: SITE.orgLegalName,
  keywords: [
    'accessibility', 'assistive technology', 'screen reader',
    'visual impairment', 'blind', 'low vision', 'NGO', 'open source',
  ],
  formatDetection: { email: false, address: false, telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f3ed' },
    { media: '(prefers-color-scheme: dark)',  color: '#121212' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="light" data-text-size="a" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css" />
        <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/fill/style.css" />
        <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/bold/style.css" />
        <JsonLd data={organizationJsonLd()} />
      </head>
      <body>
        <a href="#main" className="skip-link">Skip to main content</a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <ClientBootstrap />
        <AudioTour />
        <VoiceAssistant />
      </body>
    </html>
  );
}
