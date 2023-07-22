'use client';

import type { Team } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

interface ChapterTeamProps {
  team: Pick<Team, 'name' | 'image'> | null;
  teamId: number | null;
}

const ChapterTeam: FC<ChapterTeamProps> = ({ team, teamId }) => {
  return (
    team && (
      <Link href={`/team/${teamId}`} className="flex items-center gap-1">
        {team.image && (
          <span className="relative h-6 w-6">
            <Image
              fill
              sizes="0%"
              src={team.image}
              alt="Team Image"
              className="rounded-full"
            />
          </span>
        )}

        <p className="text-sm md:text-base font-medium">{team.name}</p>
      </Link>
    )
  );
};

export default ChapterTeam;
