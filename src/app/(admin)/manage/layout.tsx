import { buttonVariants } from '@/components/ui/Button';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

const ManageLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getAuthSession();
  if (!session) return redirect('/sign-in');

  const user = await db.user.findFirst({
    where: {
      id: session.user.id,
    },
    select: {
      role: true,
    },
  });
  if (!user) return notFound();

  if (user.role !== ('ADMIN' || 'MOD')) return notFound();

  return (
    <section className="container mx-auto h-full max-sm:px-2 pt-20 gap-5 rounded-lg grid grid-cols-1 md:grid-cols-[.6fr_1fr] lg:grid-cols-[.4fr_1fr]">
      <div className="min-h-0 space-y-6 overflow-auto">
        <div className="flex flex-col gap-3 p-2 pb-4 rounded-lg dark:bg-zinc-900">
          <h1 className="text-lg font-semibold text-center">User</h1>
          <Link href="/manage/user/verify" className={cn(buttonVariants())}>
            Chờ Verify
          </Link>

          <Link href="/manage/user/mute" className={cn(buttonVariants())}>
            Mute
          </Link>
          {user.role === 'ADMIN' && (
            <>
              <Link href="/manage/user/badge" className={cn(buttonVariants())}>
                Badge
              </Link>
              <Link href="/manage/user/ban" className={cn(buttonVariants())}>
                Ban
              </Link>
              <Link href="/manage/user/log" className={cn(buttonVariants())}>
                Log
              </Link>
            </>
          )}
        </div>

        <div className="flex flex-col gap-3 p-2 pb-4 rounded-lg dark:bg-zinc-900">
          <h1 className="text-lg font-semibold text-center">Manga</h1>
          <Link href="/manage/manga/died" className={cn(buttonVariants())}>
            Manga Die
          </Link>
          <Link href="/manage/manga/deleted" className={cn(buttonVariants())}>
            Manga đã xóa
          </Link>
          <Link href="/manage/manga/tag" className={cn(buttonVariants())}>
            Tag Manga
          </Link>
          {user.role === 'ADMIN' && (
            <Link href="/manage/manga/team" className={cn(buttonVariants())}>
              Team
            </Link>
          )}
        </div>
      </div>
      {children}
    </section>
  );
};

export default ManageLayout;
