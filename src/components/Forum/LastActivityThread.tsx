import { db } from '@/lib/db';

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
        },
      },
    },
  });

  return (
    <ul className="divide-y dark:divide-zinc-700 rounded-lg dark:bg-zinc-900/70">
      {posts.map((post) => (
        <li key={post.id}>
          <a
            target="_blank"
            href={`/m/${post.subForum.title.split(' ').join('-')}/${
              post.id
            }/${post.title.split(' ').join('-')}`}
          >
            <dl className="p-4 rounded-lg hover:cursor-pointer hover:dark:bg-zinc-900">
              <dt className="font-medium">{post.title}</dt>
              <dd className="text-sm">m/{post.subForum.title}</dd>
            </dl>
          </a>
        </li>
      ))}
    </ul>
  );
};

export default LastActivityThread;
