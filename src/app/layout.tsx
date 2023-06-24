import Navbar from '@/components/Navbar';
import Providers from '@/components/Providers';
import { Toaster } from '@/components/ui/Toaster';
import { cn } from '@/lib/utils';
import '@/styles/globals.css';
import { type Metadata } from 'next';
import { Inter } from 'next/font/google';

export const metadata: Metadata = {
  title: 'Moetruyen',
  description: 'Powered by Yuri',
};

const inter = Inter({ subsets: ['vietnamese'] });

export default function RootLayout({
  children,
  authModal,
}: {
  children: React.ReactNode;
  authModal: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body
        className={cn(
          'bg-zinc-800 text-slate-50 antialiased min-h-screen relative',
          inter.className
        )}
      >
        <Providers>
          <Navbar />

          {authModal}

          <div className="absolute container mx-auto h-full">{children}</div>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
