import PaginationControll from '@/components/PaginationControll';
import UserAvatar from '@/components/User/UserAvatar';
import UserBanner from '@/components/User/UserBanner';
import Username from '@/components/User/Username';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

const page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const page = searchParams['page'] ?? '1';
  const limit = searchParams['limit'] ?? '20';

  const session = await getAuthSession();
  if (!session) return redirect(`/sign-in`);

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      following: {
        select: {
          name: true,
          color: true,
          image: true,
          banner: true,
        },
        take: Number(limit),
        skip: (Number(page) - 1) * Number(limit),
      },
      _count: {
        select: {
          following: true,
        },
      },
    },
  });
  if (!user) return notFound();

  return (
    <main className="container max-sm:px-2 space-y-4 mt-10">
      <h1 className="text-xl font-semibold">Người dùng bạn đang theo dõi</h1>

      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 p-2 rounded-md dark:bg-zinc-900/60">
        {!!user.following.length ? (
          user.following.map((usr, idx) => (
            <Link
              key={idx}
              href={`/user/${usr.name?.split(' ').join('-')}`}
              className="p-2 rounded-md transition-colors bg-background hover:bg-background/70"
            >
              <div className="relative">
                <UserBanner user={usr} />

                <UserAvatar
                  user={usr}
                  className="absolute bottom-0 left-4 translate-y-1/2 w-20 h-20 border-4 dark:border-zinc-800 dark:bg-zinc-900"
                />
              </div>

              <Username
                user={usr}
                className="text-lg text-start font-semibold mt-14 pl-5"
              />
            </Link>
          ))
        ) : (
          <p>Bạn chưa theo dõi người dùng nào</p>
        )}
      </section>

      <PaginationControll total={user._count.following} route="/follow/user?" />
    </main>
  );
};

export default page;
