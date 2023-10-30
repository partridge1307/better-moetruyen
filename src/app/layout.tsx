import NavbarClient from '@/components/Navbar/NavbarClient';
import Providers from '@/components/Providers';
import { Toaster } from '@/components/ui/Toaster';
import '@/styles/globals.css';
import type { Metadata, Viewport } from 'next';
import { Roboto } from 'next/font/google';

export const viewport: Viewport = {
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F1F5F9' },
    { media: '(prefers-color-scheme: dark)', color: '#09090B' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(`${process.env.NEXTAUTH_URL}`),
  applicationName: 'Moetruyen',
  title: {
    default: 'Moetruyen',
    template: '%s | Moetruyen',
  },
  description:
    'Web đọc truyện tranh online tiện ích nhất được cập nhật liên tục mỗi ngày - Cùng tham gia đọc truyện và thảo luận tại Moetruyen',
  referrer: 'strict-origin-when-cross-origin',
  generator: 'Moetruyen',
  authors: [{ name: 'Moetruyen' }],
  keywords: ['Manga', 'Truyện tranh', 'Moetruyen'],
  openGraph: {
    title: 'Moetruyen',
    description:
      'Web đọc truyện tranh online tiện ích nhất được cập nhật liên tục mỗi ngày - Cùng tham gia đọc truyện và thảo luận tại Moetruyen',
    siteName: 'Moetruyen',
    url: `${process.env.NEXTAUTH_URL}`,
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    site: 'Moetruyen',
    title: 'Moetruyen',
    description:
      'Web đọc truyện tranh online tiện ích nhất được cập nhật liên tục mỗi ngày - Cùng tham gia đọc truyện và thảo luận tại Moetruyen',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Moetruyen',
  },
  formatDetection: {
    telephone: false,
  },
  robots: {
    notranslate: true,
  },
};

function breadcrumbJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Trang chủ',
        item: `${process.env.NEXTAUTH_URL}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Website đọc truyện chính thức',
        item: `${process.env.NEXTAUTH_URL}/search`,
      },
    ],
  };
}

function searchActionJsonLd() {
  return {
    '@context': 'http://schema.org',
    '@type': 'WebSite',
    url: process.env.NEXTAUTH_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${process.env.NEXTAUTH_URL}/search?q={query_string}`,
      'query-input': 'required name=q',
    },
  };
}

const roboto = Roboto({
  subsets: ['vietnamese'],
  weight: '400',
  variable: '--font-roboto',
  preload: true,
  display: 'swap',
  adjustFontFallback: true,
});

export default function RootLayout({
  children,
  authModal,
}: {
  children: React.ReactNode;
  authModal: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`dark ${roboto.variable} font-sans`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbJsonLd()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(searchActionJsonLd()),
          }}
        />
      </head>
      <body className="antialiased dark:bg-zinc-800 md:scrollbar md:scrollbar--dark">
        <Providers>
          {authModal}

          <NavbarClient />
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
