import { db } from '@/lib/db';
import type { Post, SubForum, User } from '@prisma/client';
import PostForumCard from './PostForumCard';

export type TPost = Pick<
  Post,
  'id' | 'title' | 'plainTextContent' | 'createdAt'
> & {
  _count: {
    comments: number;
  };
  author: Pick<User, 'name' | 'image' | 'color'>;
  subForum: Pick<SubForum, 'title' | 'slug'>;
};

const LastActivityPostForum = async () => {
  const posts = await db.post.findMany({
    take: 10,
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      title: true,
      plainTextContent: true,
      createdAt: true,
      subForum: {
        select: {
          title: true,
          slug: true,
        },
      },
      author: {
        select: {
          name: true,
          image: true,
          color: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  return (
    <div className="max-h-[calc(208px*3)] space-y-3 overflow-y-auto hide_scrollbar">
      {posts.map((post) => (
        <PostForumCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default LastActivityPostForum;
