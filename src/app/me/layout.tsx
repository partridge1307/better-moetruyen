import { buttonVariants } from '@/components/ui/Button';
import { getAuthSession } from '@/lib/auth';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getAuthSession();
  if (!session?.user) redirect('/sign-in');

  return (
    <div className="container h-full pt-20 md:pt-32">
      <div className="grid grid-cols-1 md:grid-cols-[.4fr_1fr] gap-4">
        <div className="dark:bg-zinc-900/75 rounded-lg h-fit">
          <p className="text-center font-semibold p-4">{session.user.name}</p>
          <Link
            href="/me/manga/upload"
            className={cn(buttonVariants({ variant: 'ghost' }), 'w-full')}
          >
            Đăng truyện
          </Link>
        </div>
        <div className="dark:bg-zinc-900/75 rounded-lg min-h-[400px] md:min-h-[500px] p-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
