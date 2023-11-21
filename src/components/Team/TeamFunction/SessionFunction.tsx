import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import type { Team } from '@prisma/client';
import { notFound } from 'next/navigation';
import { FC } from 'react';
import dynamic from 'next/dynamic';
import FollowButton from './FollowButton';

const JoinLeaveButton = dynamic(() => import('./JoinLeaveButton'), {
  ssr: false,
  loading: () => (
    <div className="w-28 md:w-[18.5%] h-10 rounded-md bg-background" />
  ),
});

interface SessionFunctionProps {
  team: Pick<Team, 'id'>;
}

const SessionFunction: FC<SessionFunctionProps> = async ({ team }) => {
  const session = await getAuthSession();
  if (!session) return;

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      teamId: true,
      teamFollowing: {
        where: {
          id: team.id,
        },
        select: {
          id: true,
        },
      },
    },
  });
  if (!user) return notFound();

  return (
    <>
      {(!user.teamId || user.teamId === team.id) && (
        <JoinLeaveButton user={user} team={team} />
      )}
      <FollowButton
        team={team}
        isFollow={!!user.teamFollowing.length}
        inOtherTeam={!!user.teamId && user.teamId !== team.id}
      />
    </>
  );
};

export default SessionFunction;
