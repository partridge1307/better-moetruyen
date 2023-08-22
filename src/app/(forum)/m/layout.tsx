import { buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Home } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Forum',
  description: 'Forum | Moetruyen',
  keywords: ['forum', 'Moetruyen'],
  alternates: {
    canonical: `${process.env.NEXTAUTH_URL}/forum`,
  },
};

const ForumLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="container max-sm:px-2 pt-20">
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_.4fr] gap-6">
        <div>{children}</div>

        <div className="max-sm:order-first h-fit rounded-md dark:bg-zinc-900">
          <Link href="/m">
            <h1 className="text-lg font-semibold flex items-center gap-1 p-3 rounded-t-md dark:bg-zinc-700">
              <Home className="w-5 h-5" /> Trang chủ
            </h1>
          </Link>

          <div className="flex flex-col items-center p-2 py-4">
            <Link href="/m/create" className={cn(buttonVariants(), 'w-full')}>
              <span className="font-medium">Tạo cộng đồng</span>
            </Link>
          </div>
        </div>
      </section>
    </section>
  );
};

export default ForumLayout;
