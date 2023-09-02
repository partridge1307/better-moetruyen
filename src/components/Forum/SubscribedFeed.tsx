import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { db } from '@/lib/db';
import type { Session } from 'next-auth';
import { FC } from 'react';
import PostFeed from './PostFeed';
import { notFound } from 'next/navigation';

interface SubscribedFeedProps {
  session: Session;
}

const SubscribedFeed: FC<SubscribedFeedProps> = async ({ session }) => {
  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      subscription: {
        select: {
          subForumId: true,
        },
      },
      subForum: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!user) return notFound();

  const subForums = [
    ...user.subForum,
    ...user.subscription.map((sub) => ({ id: sub.subForumId })),
  ];

  const posts = await db.post.findMany({
    where: {
      subForum: {
        id: {
          in: subForums.map((subForum) => subForum.id),
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
          slug: true,
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

  return (
    <PostFeed
      initialPosts={{
        posts,
        lastCursor:
          posts.length === INFINITE_SCROLL_PAGINATION_RESULTS
            ? posts[posts.length - 1].id
            : undefined,
      }}
      session={session}
    />
  );
};

export default SubscribedFeed;
