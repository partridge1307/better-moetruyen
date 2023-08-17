import NavbarClient from '@/components/Navbar/NavbarClient';
import Providers from '@/components/Providers';
import { Toaster } from '@/components/ui/Toaster';
import { cn } from '@/lib/utils';
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

const roboto = Roboto({ subsets: ['vietnamese'], weight: '400' });

export default function RootLayout({
  children,
  authModal,
}: {
  children: React.ReactNode;
  authModal: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <body
        className={cn(
          'h-screen antialiased dark:bg-zinc-800 dark:text-slate-50 md:scrollbar md:scrollbar--dark',
          roboto.className
        )}
      >
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
