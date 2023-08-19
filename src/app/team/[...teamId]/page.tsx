import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { FC } from 'react';
import dynamic from 'next/dynamic';
const TabInfo = dynamic(() => import('@/components/Team/TabInfo'));

interface pageProps {
  params: {
    teamId: string | string[];
  };
}

const page: FC<pageProps> = async ({ params }) => {
  let teamId;

  if (typeof params.teamId === 'string') teamId = params.teamId;
  else teamId = params.teamId[0];

  const session = await getAuthSession();
  if (!session) return redirect('/sign-in');

  const team = await db.team.findFirst({
    where: {
      id: +teamId,
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
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });
  if (!team) return notFound();

  return (
    <section className="container max-sm:px-2 pt-20">
      <div className="relative p-4 rounded-md dark:bg-zinc-900">
        <TabInfo team={team} session={session} />
      </div>
    </section>
  );
};

export default page;
