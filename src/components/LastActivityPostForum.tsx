import { db } from '@/lib/db';
import { MessageSquare } from 'lucide-react';

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
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  return (
    <div className="space-y-2 md:space-y-3">
      {posts.map((post) => (
        <a
          key={post.id}
          target="_blank"
          href={`${process.env.NEXT_PUBLIC_FORUM_URL}/${post.subForum.slug}/${post.id}`}
          className="block p-1 rounded-md space-y-1.5 transition-colors bg-background/10 hover:bg-background/30"
        >
          <p className="text-xl">{post.title}</p>

          <dl className="flex justify-between items-center">
            <dt>m/{post.title}</dt>
            <dd className="flex items-center gap-1.5">
              {post._count.comments} <MessageSquare className="w-5 h-5" />
            </dd>
          </dl>
        </a>
      ))}
    </div>
  );
};

export default LastActivityPostForum;
