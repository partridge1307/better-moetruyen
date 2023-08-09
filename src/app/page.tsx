import { db } from '@/lib/db';
import { ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
const NotableManga = dynamic(() => import('@/components/Manga/NotableManga'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 max-sm:grid-rows-[1fr_.3fr] md:grid-cols-[1fr_.1fr] gap-2 w-full h-72">
      <div className="animate-pulse dark:bg-zinc-900 rounded-lg" />
      <div className="animate-pulse dark:bg-zinc-900 rounded-lg" />
    </div>
  ),
});
const Recommendation = dynamic(
  () => import('@/components/Manga/Recommendation')
);
const LatestManga = dynamic(() => import('@/components/Manga/LatestManga'));
const Leaderboard = dynamic(() => import('@/components/Leaderboard'));
const LastestComment = dynamic(
  () => import('@/components/Comment/LatestComment'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-40 p-2 rounded-lg animate-pulse dark:bg-zinc-900" />
    ),
  }
);

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
        content: true,
        mangaId: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            image: true,
            name: true,
            color: true,
          },
        },
      },
    }),
  ]);

  return (
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
  );
};

export default Home;
