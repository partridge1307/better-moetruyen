import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { FC } from 'react';

const TabInfo = dynamic(() => import('@/components/Team/TabInfo'));

interface pageProps {
  params: {
    teamId: string;
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const [session, team] = await Promise.all([
    getAuthSession(),
    db.team.findFirst({
      where: {
        id: +params.teamId,
      },
      select: {
        id: true,
        name: true,
        image: true,
        description: true,
        createdAt: true,
        member: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                banner: true,
                color: true,
              },
            },
          },
        },
        owner: {
          select: {
            id: true,
            image: true,
            name: true,
            color: true,
          },
        },
        chapter: {
          select: {
            id: true,
            name: true,
            volume: true,
            chapterIndex: true,
            createdAt: true,
            manga: {
              select: {
                slug: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    }),
  ]);

  if (!team) return notFound();

  return (
    <section className="container max-sm:px-2">
      <div className="relative p-4 rounded-md dark:bg-zinc-900">
        <TabInfo team={team} session={session} />
      </div>
    </section>
  );
};

export default page;
