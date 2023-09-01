import { db } from '@/lib/db';
import LastActivityList from './components/LastActivityList';

const LastActivityThread = async () => {
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

  return <LastActivityList posts={posts} />;
};

export default LastActivityThread;
