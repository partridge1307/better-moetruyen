import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import TeamFollowSkeleton from '@/components/Skeleton/Follow/Team';

const MangaFollow = dynamic(() => import('@/components/Follow/Manga'), {
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
      mangaFollowing: {
        select: {
          id: true,
          slug: true,
          name: true,
          image: true,
          _count: {
            select: {
              chapter: {
                where: {
                  isPublished: true,
                },
              },
              followedBy: true,
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
      <h1 className="text-xl font-semibold">Manga bạn đang theo dõi</h1>

      <MangaFollow
        initialData={{
          follows: user.mangaFollowing,
          lastCursor:
            user.mangaFollowing.length === INFINITE_SCROLL_PAGINATION_RESULTS
              ? user.mangaFollowing[user.mangaFollowing.length - 1].id
              : undefined,
        }}
      />
    </main>
  );
};

export default page;
