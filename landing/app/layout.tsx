import type { Metadata } from 'next';
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  weight: '400',
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://linksave.app'),
  title: {
    default: 'LinkSave — Save less, Remember more.',
    template: '%s | LinkSave',
  },
  description: 'LinkSave is a Chrome extension for saving, organizing, and finding the web pages that matter to you.',
  applicationName: 'LinkSave',
  keywords: ['LinkSave', 'Chrome extension', 'save links', 'bookmark manager', 'organize bookmarks', 'link organizer'],
  category: 'Productivity',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'LinkSave',
    locale: 'en_US',
    title: 'LinkSave — Save less, Remember more.',
    description: 'A Chrome extension for saving, organizing, and finding the web pages that matter to you.',
    images: [
      {
        url: '/image1.png',
        width: 1200,
        height: 630,
        alt: 'LinkSave Chrome Extension Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LinkSave — Save less, Remember more.',
    description: 'A Chrome extension for saving, organizing, and finding the web pages that matter to you.',
    images: ['/image1.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
