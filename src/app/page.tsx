import { db } from '@/lib/db';
import { ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const Recommendation = dynamic(
  () => import('@/components/Manga/Recommendation'),
  {
    loading: () => (
      <div className="w-full h-60 animate-pulse dark:bg-zinc-900" />
    ),
  }
);
const LatestManga = dynamic(() => import('@/components/Manga/LatestManga'), {
  loading: () => (
    <div className="w-full h-[400px] rounded-lg animate-pulse dark:bg-zinc-900" />
  ),
});
const Leaderboard = dynamic(() => import('@/components/Leaderboard'), {
  loading: () => (
    <div className="w-full h-[400px] rounded-lg animate-pulse dark:bg-zinc-900" />
  ),
});
const LastestComment = dynamic(
  () => import('@/components/Comment/LatestComment'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 p-2 rounded-lg animate-pulse dark:bg-zinc-900" />
    ),
  }
);
const NotableManga = dynamic(() => import('@/components/Manga/NotableManga'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 md:h-64 rounded-lg animate-pulse dark:bg-zinc-900" />
  ),
});

const Home = async () => {
  const [manga, lastestComment] = await db.$transaction([
    db.manga.findMany({
      where: {
        isPublished: true,
      },
      select: {
        id: true,
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
    }),
    db.comment.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      where: {
        replyToId: null,
      },
      select: {
        id: true,
        content: true,
        mangaId: true,
        createdAt: true,
        author: {
          select: {
            image: true,
            name: true,
            color: true,
          },
        },
      },
    }),
  ]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: manga.map((m, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `${process.env.NEXTAUTH_URL}/manga/${m.id}`,
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
        <div className="flex max-sm:flex-col gap-4 mt-20">
          <section className="w-2/3 max-sm:w-full space-y-20 pb-10">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Dành cho bạn</h2>
              <Recommendation />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Mới cập nhật</h2>
                <Link
                  href="/latest"
                  className="flex items-center gap-1 hover:underline hover:underline-offset-2"
                >
                  Xem thêm <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <LatestManga />
            </div>
          </section>
          <section className="w-1/3 max-sm:w-full space-y-10">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Bảng xếp hạng</h2>
              <Leaderboard />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Bình luận</h2>
              <LastestComment comments={lastestComment} />
            </div>
          </section>
        </div>
      </section>
    </>
  );
};

export default Home;
