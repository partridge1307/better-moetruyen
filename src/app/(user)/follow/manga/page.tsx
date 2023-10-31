import TeamFollowSkeleton from '@/components/Skeleton/Follow/Team';
import { getAuthSession } from '@/lib/auth';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';

const MangaFollow = dynamic(() => import('@/components/Follow/Manga'), {
  ssr: false,
  loading: () => <TeamFollowSkeleton />,
});

const page = async () => {
  const session = await getAuthSession();
  if (!session) return redirect(`/sign-in`);

  return (
    <main className="container max-sm:px-2 space-y-6 lg:space-y-10">
      <h1 className="text-xl font-semibold">Manga bạn đang theo dõi</h1>

      <MangaFollow />
    </main>
  );
};

export default page;
