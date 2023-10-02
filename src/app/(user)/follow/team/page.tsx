import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import TeamFollowSkeleton from '@/components/Skeleton/Follow/Team';

const TeamFollow = dynamic(() => import('@/components/Follow/Team'), {
  ssr: false,
  loading: () => <TeamFollowSkeleton />,
});

const page = async () => {
  const session = await getAuthSession();
  if (!session) return redirect(`/sign-in`);

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      teamFollowing: {
        select: {
          id: true,
          image: true,
          name: true,
          _count: {
            select: {
              member: true,
              follows: true,
            },
          },
        },
        take: INFINITE_SCROLL_PAGINATION_RESULTS,
      },
    },
  });
  if (!user) return notFound();

  return (
    <main className="container max-sm:px-2 space-y-6 lg:space-y-10">
      <h1 className="text-xl font-semibold">Team bạn đang theo dõi</h1>

      <TeamFollow
        initialData={{
          follows: user.teamFollowing,
          lastCursor:
            user.teamFollowing.length === INFINITE_SCROLL_PAGINATION_RESULTS
              ? user.teamFollowing[user.teamFollowing.length - 1].id
              : undefined,
        }}
      />
    </main>
  );
};

export default page;
