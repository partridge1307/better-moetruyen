import { db } from '@/lib/db';
import { FC } from 'react';
import { notFound, redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import dynamic from 'next/dynamic';

const PostEditForm = dynamic(() => import('@/components/Forum/PostEditForm'), {
  ssr: false,
});

interface pageProps {
  params: {
    slug: string;
    postId: string;
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const session = await getAuthSession();
  if (!session) return redirect('/sign-in');

  const post = await db.post.findUnique({
    where: {
      id: +params.postId,
      authorId: session.user.id,
    },
    select: {
      id: true,
      title: true,
      content: true,
      subForum: {
        select: {
          title: true,
        },
      },
    },
  });
  if (!post) return notFound();

  return (
    <div className="p-2 lg:p-4 rounded-md dark:bg-zinc-900/50">
      <PostEditForm post={post} />
    </div>
  );
};

export default page;
