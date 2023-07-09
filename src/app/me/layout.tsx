import { buttonVariants } from '@/components/ui/Button';
import { getAuthSession } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getAuthSession();
  if (!session?.user) redirect('/sign-in');

  return (
    <div className="container h-full pt-20 md:pt-32">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[.4fr_1fr]">
        <div className="h-fit rounded-lg space-y-2 dark:bg-zinc-900/75">
          <p className="p-4 text-center font-semibold">{session.user.name}</p>

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
                'w-full py-6 ml-2 flex items-center gap-1'
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
