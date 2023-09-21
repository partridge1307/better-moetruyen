import LastActivityThreadSkeletion from '@/components/Skeleton/LastActivityThreadSkeletion';
import LastestMangaSkeleton from '@/components/Skeleton/LastestMangaSkeleton';
import LeaderboardSkeletion from '@/components/Skeleton/LeaderboardSkeletion';
import NotableMangaSkeleton from '@/components/Skeleton/NotableMangaSkeleton';
import { db } from '@/lib/db';
import { ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const NotableManga = dynamic(() => import('@/components/Manga/NotableManga'), {
  ssr: false,
  loading: () => <NotableMangaSkeleton />,
});
const LastActivityPostForum = dynamic(
  () => import('@/components/LastActivityPostForum'),
  { loading: () => <LastActivityThreadSkeletion /> }
);
const Recommendation = dynamic(
  () => import('@/components/Manga/Recommendation'),
  { loading: () => <LastestMangaSkeleton /> }
);
const LatestManga = dynamic(() => import('@/components/Manga/LatestManga'), {
  loading: () => <LastestMangaSkeleton />,
});
const Leaderboard = dynamic(() => import('@/components/LeaderBoard'), {
  loading: () => <LeaderboardSkeletion />,
});

const Home = async () => {
  const manga = await db.manga.findMany({
    where: {
      isPublished: true,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      image: true,
      author: {
        select: {
          name: true,
        },
      },
      tags: {
        select: {
          name: true,
          description: true,
        },
      },
    },
    take: 10,
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: manga.map((m, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `${process.env.NEXTAUTH_URL}/manga/${m.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="container mx-auto max-sm:px-3">
        <NotableManga mangas={manga} />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_.5fr] gap-10 mt-20 pb-10">
          <section className="space-y-10">
            <div className="space-y-2">
              <h1 className="text-xl font-semibold">Bài viết gần đây</h1>
              <LastActivityPostForum />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-semibold">Dành cho bạn</h1>
              <Recommendation />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <h1 className="text-xl font-semibold">Mới cập nhật</h1>
                <Link
                  scroll={false}
                  href="/latest"
                  className="hover:underline underline-offset-2 inline-flex items-center gap-2"
                >
                  Xem thêm <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <LatestManga />
            </div>
          </section>

          <section className="space-y-10 h-fit">
            <div className="space-y-2">
              <h1 className="text-xl font-semibold">Bảng xếp hạng</h1>
              <Leaderboard />
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default Home;
