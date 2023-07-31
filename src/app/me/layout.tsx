import UserAvatar from '@/components/User/UserAvatar';
import UserBanner from '@/components/User/UserBanner';
import Username from '@/components/User/Username';
import { buttonVariants } from '@/components/ui/Button';
import { getAuthSession } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getAuthSession();
  if (!session) redirect('/sign-in');

  return (
    <main className="container max-sm:px-2 h-full pt-20 md:pt-32">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[.5fr_1fr] lg:grid-cols-[.4fr_1fr]">
        <div className="h-fit rounded-lg space-y-2 dark:bg-zinc-900/75">
          <div className="relative p-2 pb-20 dark:hover:bg-zinc-700 rounded-md">
            <Link href="/me">
              <UserBanner user={session.user} />

              <div className="absolute inset-x-4 left-4 top-1/2 translate-y-[20%] flex items-center gap-4">
                <UserAvatar
                  user={session.user}
                  className="w-24 h-24 lg:w-28 lg:h-28 z-10 border-4"
                />
                <div className="relative max-w-[80%] max-h-10 overflow-auto md:scrollbar md:dark:scrollbar--dark">
                  <Username user={session.user} className="-pb-2 text-lg" />
                </div>
              </div>
            </Link>
          </div>

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
