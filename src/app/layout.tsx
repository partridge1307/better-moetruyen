import NavbarClient from '@/components/Navbar/NavbarClient';
import Providers from '@/components/Providers';
import { Toaster } from '@/components/ui/Toaster';
import { cn } from '@/lib/utils';
import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';

export const metadata: Metadata = {
  title: 'Moetruyen',
  description: 'Powered by Yuri',
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
          'h-screen antialiased dark:bg-zinc-800 dark:text-slate-50',
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
