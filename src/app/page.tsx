import LastActivityThreadSkeletion from '@/components/Skeletion/LastActivityThreadSkeletion';
import LastestMangaSkeleton from '@/components/Skeletion/LastestMangaSkeleton';
import LeaderboardSkeletion from '@/components/Skeletion/LeaderboardSkeletion';
import NotableMangaSkeleton from '@/components/Skeletion/NotableMangaSkeleton';
import { db } from '@/lib/db';
import dynamic from 'next/dynamic';

const NotableManga = dynamic(() => import('@/components/Manga/NotableManga'), {
  ssr: false,
  loading: () => <NotableMangaSkeleton />,
});
const LastActivityThread = dynamic(
  () => import('@/components/Forum/LastActivityThread'),
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
      <section className="container mx-auto max-sm:px-3 h-screen pt-20">
        <NotableManga mangas={manga} />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_.5fr] gap-10 mt-20 pb-10">
          <section className="space-y-10">
            <div className="space-y-2">
              <h1 className="text-xl font-semibold">Bài viết gần đây</h1>
              <LastActivityThread />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-semibold">Dành cho bạn</h1>
              <Recommendation />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-semibold">Mới cập nhật</h1>
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
      </section>
    </>
  );
};

export default Home;
