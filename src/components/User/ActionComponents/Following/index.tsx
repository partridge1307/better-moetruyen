import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { db } from '@/lib/db';
import type { User } from '@prisma/client';
import { FC } from 'react';
import FollowingInfo from './FollowingInfo';

interface FollowingProps {
  user: Pick<User, 'id'>;
}

const Following: FC<FollowingProps> = async ({ user }) => {
  const dbUser = await db.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      following: {
        take: INFINITE_SCROLL_PAGINATION_RESULTS,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          image: true,
          banner: true,
          name: true,
          color: true,
        },
      },
    },
  });
  if (!dbUser) return;

  return (
    <FollowingInfo
      userId={user.id}
      initialData={{
        data: dbUser.following,
        lastCursor:
          dbUser.following.length === INFINITE_SCROLL_PAGINATION_RESULTS
            ? dbUser.following[dbUser.following.length - 1].id
            : undefined,
      }}
    />
  );
};

export default Following;
