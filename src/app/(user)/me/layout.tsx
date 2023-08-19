import UserAvatar from '@/components/User/UserAvatar';
import UserBanner from '@/components/User/UserBanner';
import Username from '@/components/User/Username';
import { buttonVariants } from '@/components/ui/Button';
import { getAuthSession } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Quản lý',
  keywords: ['Quản lý', 'Moetruyen'],
  openGraph: {
    title: 'Quản lý',
    description: 'Quản lý | Moetruyen',
  },
  twitter: {
    title: 'Quản lý',
    description: 'Quản lý | Moetruyen',
  },
};

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getAuthSession();
  if (!session) redirect('/sign-in');

  return (
    <main className="container max-sm:px-2 h-full pt-20">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[.6fr_1fr] lg:grid-cols-[.4fr_1fr]">
        <div className="h-fit rounded-lg space-y-2 dark:bg-zinc-900/75">
          <Link href="/me">
            <div className="relative p-2 dark:hover:bg-zinc-700 rounded-md">
              <div className="relative">
                <UserBanner user={session.user} className="rounded-md" />

                <UserAvatar
                  user={session.user}
                  className="w-24 h-24 lg:w-28 lg:h-28 absolute left-2 bottom-0 translate-y-1/2 border-4"
                />
              </div>
              <Username
                user={session.user}
                className="text-start text-lg font-semibold pl-3 mt-16 lg:mt-20"
              />
            </div>
          </Link>

          <div className="space-y-4 p-4">
            <Link
              href="/me/manga/upload"
              className={cn(buttonVariants(), 'w-full p-6 text-lg font-medium')}
            >
              Đăng truyện
            </Link>
            <div className="space-y-2">
              <Link
                href="/me/manga"
                className={cn(
                  buttonVariants({ variant: 'ghost' }),
                  'w-full py-6 pl-6 flex items-center gap-1'
                )}
              >
                Quản lý truyện
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link
                href="/me/team"
                className={cn(
                  buttonVariants({ variant: 'ghost' }),
                  'w-full py-6 pl-6 flex items-center gap-1'
                )}
              >
                Quản lý team
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-lg p-2 dark:bg-zinc-900/75 ">{children}</div>
      </div>
    </main>
  );
};

export default Layout;
