import ShareButton from '@/components/ShareButton';
import type { Team } from '@prisma/client';
import dynamic from 'next/dynamic';
import { FC } from 'react';

const SessionFunction = dynamic(() => import('./SessionFunction'), {
  loading: () => (
    <>
      <div className="w-28 md:w-[18.5%] h-10 rounded-md animate-pulse bg-background" />
      <div className="w-14 h-10 rounded-md animate-pulse bg-background" />
    </>
  ),
});

interface TeamFunctionProps {
  team: Pick<Team, 'id' | 'name'>;
}

const TeamFunction: FC<TeamFunctionProps> = ({ team }) => {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <SessionFunction team={team} />
      <ShareButton title={team.name} url={`/team/${team.id}`} />
    </div>
  );
};

export default TeamFunction;
