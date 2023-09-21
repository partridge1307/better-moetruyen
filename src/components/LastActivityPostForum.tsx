import { db } from '@/lib/db';
import LastActivityPostList from './LastActivityPostList';

const LastActivityPostForum = async () => {
  const posts = await db.post.findMany({
    take: 10,
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      title: true,
      subForum: {
        select: {
          title: true,
          slug: true,
        },
      },
    },
  });

  return <LastActivityPostList posts={posts} />;
};

export default LastActivityPostForum;
