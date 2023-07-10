import { buttonVariants } from '@/components/ui/Button';
import { getAuthSession } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getAuthSession();
  if (!session?.user) redirect('/sign-in');

  return (
    <div className="container h-full pt-20 md:pt-32">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[.4fr_1fr]">
        <div className="h-fit rounded-lg space-y-2 dark:bg-zinc-900/75">
          <div className="relative p-2 dark:hover:bg-zinc-700 rounded-md">
            <Link href="/me">
              {session.user.image && (
                <div className="absolute z-10 top-1/2 left-4">
                  <div className="relative h-20 w-20 border-4 rounded-full">
                    <Image
                      fill
                      sizes="0%"
                      src={session.user.image}
                      alt="Profile Avatar"
                      className="rounded-full"
                    />
                  </div>
                </div>
              )}

              {session.user.banner && (
                <div className="relative w-full h-32">
                  <Image
                    fill
                    sizes="0%"
                    src={session.user.banner}
                    alt="Profile Banner"
                    className="rounded-md"
                  />
                </div>
              )}
              <p
                className="px-4 pt-2 pb-4 text-lg ml-20 lg:ml-24 font-semibold"
                style={{ color: session.user.color ? session.user.color : '' }}
              >
                {session.user.name}
              </p>
            </Link>
          </div>

          <div className="space-y-4 p-4">
            <Link
              href="/me/manga/upload"
              className={cn(buttonVariants(), 'w-full p-6 text-lg font-medium')}
            >
              Đăng truyện
            </Link>
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
          </div>
        </div>

        <div className="min-h-[400px] rounded-lg p-2 dark:bg-zinc-900/75 md:min-h-[500px]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
