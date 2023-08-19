import { db } from '@/lib/db';
import type { Session } from 'next-auth';
import { FC } from 'react';
import dynamic from 'next/dynamic';
const TeamJoinButton = dynamic(() => import('./TeamJoinButton'), {
  ssr: false,
});

interface TeamJoinButtonProps {
  teamId: number;
  session: Session | null;
}

const TeamJoinFunc: FC<TeamJoinButtonProps> = async ({ teamId, session }) => {
  if (!session) return null;

  const hasTeam = await db.memberOnTeam.findFirst({
    where: {
      userId: session.user.id,
    },
  });
  if (hasTeam) return null;

  return <TeamJoinButton teamId={teamId} />;
};

export default TeamJoinFunc;
