import { db } from '@/lib/db';
import type { Team } from '@prisma/client';
import { notFound } from 'next/navigation';
import { FC } from 'react';
import { TabsContent } from '../ui/Tabs';
import Link from 'next/link';
import UserBanner from '../User/UserBanner';
import UserAvatar from '../User/UserAvatar';
import Username from '../User/Username';

interface TeamMemberProps {
  team: Pick<Team, 'id'>;
}

const TeamMember: FC<TeamMemberProps> = async ({ team }) => {
  const members = await db.team
    .findUnique({
      where: {
        id: team.id,
      },
    })
    .member({
      select: {
        id: true,
        name: true,
        color: true,
        image: true,
        banner: true,
      },
    });
  if (!members) return notFound();

  return (
    <TabsContent
      value="member"
      className="data-[state=inactive]:hidden grid md:grid-cols-3 lg:grid-cols-4 gap-6 p-2 rounded-md dark:bg-zinc-900/60"
    >
      {members.map((user) => (
        <Link
          key={user.id}
          href={`/user/${user.name?.split(' ').join('-')}`}
          className="p-2 rounded-md transition-colors bg-background hover:bg-background/60"
        >
          <div className="relative">
            <UserBanner user={user} className="rounded-md" />
            <UserAvatar
              user={user}
              className="absolute bottom-0 translate-y-1/2 left-4 w-16 h-16 border-4 dark:border-zinc-900 dark:bg-zinc-900"
            />
          </div>

          <Username
            user={user}
            className="text-start font-semibold mt-12 pl-4"
          />
        </Link>
      ))}
    </TabsContent>
  );
};

export default TeamMember;
