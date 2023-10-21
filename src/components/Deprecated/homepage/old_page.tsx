import LastActivityThreadSkeletion from '@/components/Skeleton/LastActivityThreadSkeletion';
import LastestMangaSkeleton from '@/components/Skeleton/LastestMangaSkeleton';
import LatestCommentSkeleton from '@/components/Skeleton/LatestCommentSkeleton';
import LeaderboardSkeletion from '@/components/Skeleton/LeaderboardSkeletion';
import NotableMangaSkeleton from '@/components/Skeleton/NotableMangaSkeleton';
import RecommendationSkeleton from '@/components/Skeleton/RecommendationSkeleton';
import { ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const NotableManga = dynamic(() => import('@/components/Manga/NotableManga'), {
  loading: () => <NotableMangaSkeleton />,
});

const LastActivityPostForum = dynamic(
  () => import('@/components/LastActivityPostForum'),
  { loading: () => <LastActivityThreadSkeletion /> }
);

const Recommendation = dynamic(
  () => import('@/components/Manga/Recommendation'),
  { loading: () => <RecommendationSkeleton /> }
);

const LatestManga = dynamic(() => import('@/components/Manga/LatestManga'), {
  loading: () => <LastestMangaSkeleton />,
});

const Leaderboard = dynamic(() => import('@/components/LeaderBoard'), {
  loading: () => <LeaderboardSkeletion />,
});

const LatestComment = dynamic(
  () => import('@/components/Comment/LatestComment'),
  { loading: () => <LatestCommentSkeleton /> }
);

const Home = () => {
  return (
    <main className="container mx-auto max-sm:px-3">
      <NotableManga />

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

          <div className="space-y-2">
            <h1 className="text-xl font-semibold">Bình luận</h1>
            <LatestComment />
          </div>
        </section>
      </div>
    </main>
  );
};

export default Home;
