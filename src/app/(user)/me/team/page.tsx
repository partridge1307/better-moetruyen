import { buttonVariants } from '@/components/ui/Button';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const TabInfo = dynamic(() => import('@/components/Team/TabInfo'));

const page = async () => {
  const session = await getAuthSession();
  if (!session) return redirect('/sign-in');

  const team = await db.team.findFirst({
    where: {
      member: {
        some: {
          userId: session.user.id,
        },
      },
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
  });

  return (
    <>
      {!team ? (
        <div className="h-full flex flex-col justify-center items-center space-y-2">
          <p>Bạn chưa có team nào</p>
          <Link href="/me/team/create" className={cn(buttonVariants())}>
            Tạo Team
          </Link>
        </div>
      ) : (
        <TabInfo team={team} session={session} />
      )}
    </>
  );
};

export default page;
