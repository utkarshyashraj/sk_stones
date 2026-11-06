import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Poppins } from 'next/font/google';
import Image from 'next/image';
import marble from '@/content/generated/marble.json';
import { Footer } from '@/components/layout/Footer/Footer';
import { Header } from '@/components/layout/Header/Header';
import { GlobalOverlays } from '@/components/layout/GlobalOverlays';
import { jsonLdScript, localBusinessLd } from '@/lib/seo';
import { site, SITE_URL } from '@/lib/site';
import '@/styles/globals.css';

// Self-hosted at build time by next/font (no render-blocking request to Google Fonts).
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['600'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-playfair',
});
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: site.name,
  authors: [{ name: site.legalName }],
  formatDetection: { telephone: false },
  icons: { icon: '/favicon.ico' },
};

export const viewport: Viewport = {
  themeColor: '#0b0b0b',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${playfair.variable} ${poppins.variable}`}>
      <body>
        {/* One fixed marble layer for the whole site (sections only veil it). No parallax: static by design. */}
        <div className="marble-layer" aria-hidden="true">
          <Image
            src={marble.src}
            alt=""
            fill
            priority
            sizes="100vw"
            placeholder="blur"
            blurDataURL={marble.blurDataURL}
            style={{ objectFit: 'cover' }}
          />
        </div>
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <Header />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <GlobalOverlays />
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(localBusinessLd())} />
      </body>
    </html>
  );
}
