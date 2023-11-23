import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import type { User } from '@prisma/client';
import { FC } from 'react';
import FollowButton from './FollowButton';

interface SessionFunctionProps {
  user: Pick<User, 'id'>;
}

const SessionFunction: FC<SessionFunctionProps> = async ({ user }) => {
  const session = await getAuthSession();
  if (!session || session.user.id === user.id) return;

  const dbUser = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      following: {
        where: {
          id: user.id,
        },
      },
    },
  });
  if (!dbUser) return;

  return (
    !!session && (
      <FollowButton userId={user.id} isFollowing={!!dbUser.following.length} />
    )
  );
};

export default SessionFunction;
