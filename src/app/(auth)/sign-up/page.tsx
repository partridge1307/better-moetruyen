import SignUp from '@/components/Auth/SignUp';
import { buttonVariants } from '@/components/ui/Button';
import { getAuthSession } from '@/lib/auth';
import { ChevronLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Đăng ký',
  description: 'Đăng ký Moetruyen',
  keywords: ['Đăng ký', 'Manga', 'Moetruyen'],
};

const Page = async () => {
  const session = await getAuthSession();
  if (session) return redirect('/');

  return (
    <main className="mx-auto md:w-3/4 lg:w-2/3 p-2 space-y-10 mb-6 rounded-md dark:bg-zinc-900/60">
      <Link
        href="/"
        className={buttonVariants({
          variant: 'ghost',
          className: 'max-sm:pl-2 space-x-0.5',
        })}
      >
        <ChevronLeft />
        <span>Trang chủ</span>
      </Link>

      <SignUp className="max-sm:px-2" bypassRouteInterception />
    </main>
  );
};

export default Page;
