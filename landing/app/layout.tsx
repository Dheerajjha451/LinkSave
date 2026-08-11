import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'LinkSave — Save less. Remember more.',
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
    title: 'LinkSave — Save less. Remember more.',
    description: 'A Chrome extension for saving, organizing, and finding the web pages that matter to you.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LinkSave — Save less. Remember more.',
    description: 'A Chrome extension for saving, organizing, and finding the web pages that matter to you.',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
