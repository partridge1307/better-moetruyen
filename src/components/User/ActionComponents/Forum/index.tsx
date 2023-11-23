import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { db } from '@/lib/db';
import type { User } from '@prisma/client';
import { FC } from 'react';
import ForumInfo from './ForumInfo';

interface ForumProps {
  user: Pick<User, 'id'>;
}

const Forum: FC<ForumProps> = async ({ user }) => {
  const dbUser = await db.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      subForum: {
        take: INFINITE_SCROLL_PAGINATION_RESULTS,
        orderBy: {
          subscriptions: {
            _count: 'desc',
          },
        },
        select: {
          id: true,
          slug: true,
          banner: true,
          title: true,
          _count: {
            select: {
              subscriptions: true,
            },
          },
        },
      },
    },
  });
  if (!dbUser) return;

  return (
    <ForumInfo
      userId={user.id}
      initialData={{
        data: dbUser.subForum,
        lastCursor:
          dbUser.subForum.length === INFINITE_SCROLL_PAGINATION_RESULTS
            ? dbUser.subForum[dbUser.subForum.length - 1].id
            : undefined,
      }}
    />
  );
};

export default Forum;
