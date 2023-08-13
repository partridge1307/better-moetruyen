import SignIn from '@/components/Auth/SignIn';
import { Button } from '@/components/ui/Button';
import { ChevronLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Đăng nhập',
  description: 'Đăng nhập | Moetruyen',
  keywords: ['Đăng nhập', 'Manga', 'Moetruyen'],
  openGraph: {
    title: 'Đăng nhập',
    description: 'Đăng nhập | Moetruyen',
  },
  twitter: {
    title: 'Đăng nhập',
    description: 'Đăng nhập | Moetruyen',
  },
};

const Page = () => {
  return (
    <div className="container flex h-full items-center max-sm:px-0">
      <div className="relative flex h-4/5 w-full items-center justify-center rounded-lg p-5 dark:bg-zinc-900/50">
        <div className="w-full md:w-3/4">
          <Button
            variant="link"
            className="absolute left-0 top-4 flex items-center md:left-4"
          >
            <ChevronLeft />
            <Link href="/">Trang chủ</Link>
          </Button>
          <SignIn />
        </div>
      </div>
    </div>
  );
};

export default Page;
