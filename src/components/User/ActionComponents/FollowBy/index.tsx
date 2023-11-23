import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { db } from '@/lib/db';
import type { User } from '@prisma/client';
import { FC } from 'react';
import FollowByInfo from './FollowByInfo';

interface FollowByProps {
  user: Pick<User, 'id'>;
}

const FollowBy: FC<FollowByProps> = async ({ user }) => {
  const dbUser = await db.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      followedBy: {
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
    <FollowByInfo
      userId={user.id}
      initialData={{
        data: dbUser.followedBy,
        lastCursor:
          dbUser.followedBy.length === INFINITE_SCROLL_PAGINATION_RESULTS
            ? dbUser.followedBy[dbUser.followedBy.length - 1].id
            : undefined,
      }}
    />
  );
};

export default FollowBy;
