import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Poppins } from 'next/font/google';
import { withBase } from '@/lib/base-path';
import { site, SITE_URL } from '@/lib/site';
import '@/styles/base.css';

// Self-hosted at build time by next/font. Same families and weights the reference loads from Google Fonts.
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-playfair',
});
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: site.name,
  authors: [{ name: site.legalName }],
  formatDetection: { telephone: false },
  icons: { icon: withBase('/favicon.ico') },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
};

/**
 * Bare document. Each page renders its own frame (RefShell: header, footer, mobile bar) inside the
 * wrapper that scopes its generated reference stylesheet — see components/ref/RefShell.tsx.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${playfair.variable} ${poppins.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
