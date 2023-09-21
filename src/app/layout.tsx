import NavbarClient from '@/components/Navbar/NavbarClient';
import Providers from '@/components/Providers';
import { Toaster } from '@/components/ui/Toaster';
import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';

export const metadata: Metadata = {
  metadataBase: new URL(`${process.env.NEXTAUTH_URL}`),
  title: {
    default: 'Moetruyen',
    template: '%s | Moetruyen',
  },
  description:
    'Web đọc truyện tranh online tiện ích nhất được cập nhật liên tục mỗi ngày - Cùng tham gia đọc truyện và thảo luận tại Moetruyen',
  colorScheme: 'dark light',
  themeColor: 'dark light',
  referrer: 'origin-when-cross-origin',
  generator: 'Moetruyen',
  authors: [{ name: 'Moetruyen' }],
  keywords: ['Manga', 'Truyện tranh', 'Moetruyen'],
  openGraph: {
    title: 'Moetruyen',
    description:
      'Web đọc truyện tranh online tiện ích nhất được cập nhật liên tục mỗi ngày - Cùng tham gia đọc truyện và thảo luận tại Moetruyen',
    siteName: 'Moetruyen',
    url: `${process.env.NEXTAUTH_URL}`,
    locale: 'vi',
    type: 'website',
  },
  twitter: {
    site: 'Moetruyen',
    title: 'Moetruyen',
    description:
      'Web đọc truyện tranh online tiện ích nhất được cập nhật liên tục mỗi ngày - Cùng tham gia đọc truyện và thảo luận tại Moetruyen',
  },
  robots: {
    notranslate: true,
  },
};

const roboto = Roboto({
  subsets: ['vietnamese'],
  weight: '400',
  variable: '--font-roboto',
  preload: true,
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
