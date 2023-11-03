import TeamFollowSkeleton from '@/components/Skeleton/Follow/Team';
import { getAuthSession } from '@/lib/auth';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';

const TeamFollow = dynamic(() => import('@/components/Follow/Team'), {
  ssr: false,
  loading: () => <TeamFollowSkeleton />,
});

const page = async () => {
  const session = await getAuthSession();
  if (!session) return redirect(`/sign-in`);

  return (
    <main className="container max-sm:px-2 space-y-4 mt-10">
      <h1 className="text-xl font-semibold">Team bạn đang theo dõi</h1>

      <TeamFollow />
    </main>
  );
};

export default page;
