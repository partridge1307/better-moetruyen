import TeamInfo from '@/components/Team/Info';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { FC } from 'react';

const TeamMember = dynamic(() => import('@/components/Team/Member'));
const TeamManga = dynamic(() => import('@/components/Team/Manga'));
const TeamChapter = dynamic(() => import('@/components/Team/Chapter'));

interface pageProps {
  params: {
    teamId: string;
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const session = await getAuthSession();

  const [team, user] = await db.$transaction([
    db.team.findUnique({
      where: {
        id: +params.teamId,
      },
      select: {
        id: true,
        image: true,
        name: true,
        description: true,
        createdAt: true,
        _count: {
          select: {
            member: true,
            chapter: {
              where: {
                isPublished: true,
              },
            },
            follows: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
            color: true,
          },
        },
        follows: {
          where: {
            id: session?.user.id,
          },
          select: {
            id: true,
          },
        },
        member: {
          where: {
            id: session?.user.id,
          },
          select: {
            id: true,
          },
        },
      },
    }),
    db.user.findUnique({
      where: {
        id: session?.user.id,
        teamId: {
          not: +params.teamId,
        },
      },
      select: {
        id: true,
      },
    }),
  ]);
  if (!team) return notFound();

  return (
    <main className="container max-sm:px-2 mb-4">
      <Tabs defaultValue="info">
        <TabsList className="justify-start max-w-full overflow-auto dark:bg-zinc-900/60">
          <TabsTrigger value="info">Thông tin</TabsTrigger>
          <TabsTrigger value="member">Thành viên</TabsTrigger>
          <TabsTrigger value="manga">Manga</TabsTrigger>
          <TabsTrigger value="chapter">Chapter</TabsTrigger>
        </TabsList>

        <TeamInfo
          team={team}
          sessionUserId={session?.user.id}
          isMember={!user}
        />
        <TeamMember team={team} />
        <TeamManga team={team} />
        <TeamChapter team={team} />
      </Tabs>
    </main>
  );
};

export default page;
