import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { db } from '@/lib/db';
import type { Session } from 'next-auth';
import { FC } from 'react';
import PostFeed from './PostFeed';

interface SubscribedFeedProps {
  session: Session;
}

const SubscribedFeed: FC<SubscribedFeedProps> = async ({ session }) => {
  const followedSubForums = await db.subscription.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        { subForum: { creatorId: session.user.id } },
      ],
    },
    select: {
      subForumId: true,
    },
  });

  const posts = await db.post.findMany({
    where: {
      subForum: {
        id: {
          in: followedSubForums.map((sub) => sub.subForumId),
        },
      },
    },
    orderBy: {
      votes: {
        _count: 'desc',
      },
    },
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      votes: true,
      subForum: {
        select: {
          title: true,
        },
      },
      author: {
        select: {
          name: true,
          color: true,
          image: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
    take: INFINITE_SCROLL_PAGINATION_RESULTS,
  });

  return <PostFeed initialPosts={posts} session={session} />;
};

export default SubscribedFeed;
