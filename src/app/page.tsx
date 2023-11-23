import LastActivityPostSkeletion from '@/components/Skeleton/LastActivityPostSkeletion';
import MangaCardSkeleton from '@/components/Skeleton/MangaCardSkeleton';
import LeaderboardSkeletion from '@/components/Skeleton/LeaderboardSkeletion';
import NotableMangaSkeleton from '@/components/Skeleton/NotableMangaSkeleton';
import RecommendationSkeleton from '@/components/Skeleton/RecommendationSkeleton';
import '@mantine/core/styles.layer.css';
import { MoveRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const NotableManga = dynamic(() => import('@/components/Manga/NotableManga'), {
  loading: () => <NotableMangaSkeleton />,
});

const Recommendation = dynamic(
  () => import('@/components/Manga/Recommendation'),
  { loading: () => <RecommendationSkeleton /> }
);

const LatestManga = dynamic(() => import('@/components/Manga/LatestManga'), {
  loading: () => <MangaCardSkeleton />,
});

const Leaderboard = dynamic(() => import('@/components/LeaderBoard'), {
  loading: () => <LeaderboardSkeletion />,
});

const LastActivityPostForum = dynamic(
  () => import('@/components/PostForum/LastActivityPostForum'),
  { loading: () => <LastActivityPostSkeletion /> }
);

const page = () => {
  return (
    <main className="max-sm:px-2 pb-4 space-y-12 md:space-y-16">
      <NotableManga />

      <div className="grid grid-cols-1 md:grid-cols-[1fr_.4fr] gap-10">
        {/* Left section */}
        <section className="min-w-0 h-fit md:ml-6 p-2 space-y-10 rounded-lg bg-gradient-to-b from-background/40">
          {/* Recommendation */}
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold">Dành cho bạn</h1>
            <Recommendation />
          </div>

          {/* Latest */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold">Mới cập nhật</h1>
              <Link href="/latest" className="group flex items-center gap-1.5">
                <span className="transition-all duration-300 opacity-0 translate-x-1/2 group-hover:opacity-100 group-hover:translate-x-0">
                  Xem thêm
                </span>
                <MoveRight className="w-8 h-8" />
              </Link>
            </div>
            <LatestManga />
          </div>
        </section>

        {/* Right section */}
        <section className="min-w-0 h-fit p-2 space-y-10 rounded-lg md:rounded-l-lg md:rounded-r-none bg-gradient-to-b from-background/40">
          {/* Leaderboard */}
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold">Bảng xếp hạng</h1>
            <Leaderboard />
          </div>

          {/* Latest Post */}
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold">Bài viết mới nhất</h1>
            <LastActivityPostForum />
          </div>
        </section>
      </div>
    </main>
  );
};

export default page;
