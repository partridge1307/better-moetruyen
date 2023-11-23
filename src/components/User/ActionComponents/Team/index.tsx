import TeamCover from '@/components/Team/TeamCover';
import TeamImage from '@/components/Team/TeamImage';
import { TabsContent } from '@/components/ui/Tabs';
import { db } from '@/lib/db';
import type { User } from '@prisma/client';
import Link from 'next/link';
import { FC } from 'react';
import Username from '../../Username';

interface TeamProps {
  user: Pick<User, 'id'>;
}

const Team: FC<TeamProps> = async ({ user }) => {
  const dbUser = await db.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      team: {
        select: {
          id: true,
          cover: true,
          image: true,
          name: true,
          owner: {
            select: {
              name: true,
              color: true,
            },
          },
        },
      },
    },
  });
  if (!dbUser) return;

  return (
    <TabsContent
      value="team"
      forceMount
      className="data-[state=inactive]:hidden p-2 rounded-md bg-primary-foreground/50"
    >
      {!dbUser.team && <p>Người dùng này hiện chưa vào Team nào</p>}

      {!!dbUser.team && (
        <Link
          href={`/team/${dbUser.team.id}`}
          className="block rounded-md transition-colors bg-primary-foreground hover:bg-primary-foreground/70"
        >
          <div className="relative">
            <TeamCover team={dbUser.team} quality={60} />
            <div className="absolute left-[5%] md:left-[3%] bottom-0 w-1/3 h-1/3 md:w-1/5 md:h-1/5">
              <TeamImage
                team={dbUser.team}
                className="border-[6px] border-muted rounded-full bg-background"
              />
            </div>
          </div>
          <div className="ml-[42%] md:ml-[26%] mt-2 pb-[10%] space-y-1">
            <p className="text-2xl md:text-4xl font-semibold line-clamp-2">
              {dbUser.team.name}
            </p>
            <dl className="flex items-center space-x-1.5 max-sm:text-xs opacity-70">
              <dt>Owner:</dt>
              <dd>
                <Username user={dbUser.team.owner} />
              </dd>
            </dl>
          </div>
        </Link>
      )}
    </TabsContent>
  );
};

export default Team;
