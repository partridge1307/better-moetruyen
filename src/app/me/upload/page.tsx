import MangaUpload from '@/components/MangaUpload';
import UserAnalyticsCard from '@/components/UserAnalyticsCard';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import 'server-only';

const Page = async () => {
  const session = await getAuthSession();

  if (!session?.user) redirect('/sign-in');

  const manga = await db.manga.findMany({
    where: {
      creatorId: session.user.id,
    },
    include: {
      chapter: true,
    },
  });

  const tag = await db.tag.findMany();

  return (
    <div className="container mx-auto h-fit pt-14">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_.4fr] gap-y-4 md:gap-x-4 py-6">
        {/* TODO: manga uploaded info */}
        <MangaUpload manga={manga} tag={tag} />

        {/* Simple User analytics */}
        <UserAnalyticsCard user={session.user} manga={manga} />
      </div>
    </div>
  );
};

export default Page;
