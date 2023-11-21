import { db } from '@/lib/db';
import { nFormatter } from '@/lib/utils';
import type { Team } from '@prisma/client';
import { File, Users2 } from 'lucide-react';
import { FC } from 'react';

interface TeamInfoServerProps {
  team: Pick<Team, 'id'>;
}

const TeamInfoServer: FC<TeamInfoServerProps> = async ({ team }) => {
  const dbTeam = await db.team.findUnique({
    where: {
      id: team.id,
    },
    select: {
      _count: {
        select: {
          member: true,
          chapter: {
            where: {
              isPublished: true,
            },
          },
        },
      },
    },
  });
  if (!dbTeam) return null;

  return (
    <>
      <dl className="flex items-center gap-1">
        <dt className="font-semibold">
          {nFormatter(dbTeam._count.chapter, 1)}
        </dt>
        <dd>
          <File className="w-4 h-4" />
        </dd>
      </dl>
      <dl className="flex items-center gap-1">
        <dt className="font-semibold">{nFormatter(dbTeam._count.member, 1)}</dt>
        <dd>
          <Users2 className="w-5 h-5" />
        </dd>
      </dl>
    </>
  );
};

export default TeamInfoServer;
