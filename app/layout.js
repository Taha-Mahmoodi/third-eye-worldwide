import './globals.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ClientBootstrap from '@/components/ClientBootstrap';
import AudioTour from '@/components/AudioTour';

export const metadata = {
  title: 'Third Eye Worldwide — Technology that opens new worlds',
  description:
    'Third Eye Worldwide builds free, open-source assistive technology for people with visual impairment — screen readers, magnifiers, navigation aids, and community projects in 47 countries.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light" data-text-size="a" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css" />
        <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/fill/style.css" />
        <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/bold/style.css" />
      </head>
      <body>
        <a href="#main" className="skip-link">Skip to main content</a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <ClientBootstrap />
        <AudioTour />
      </body>
    </html>
  );
}
