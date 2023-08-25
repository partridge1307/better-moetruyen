import { FC } from 'react';
import dynamic from 'next/dynamic';
import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';

const CreatePostForm = dynamic(
  () => import('@/components/Forum/CreatePostForm'),
  { ssr: false }
);

interface pageProps {
  params: {
    title: string;
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const session = await getAuthSession();
  if (!session) return redirect('/sign-in');

  const subForum = await db.subForum.findFirst({
    where: {
      title: params.title.split('-').join(' '),
      OR: [
        {
          canSend: true,
          subscriptions: {
            some: {
              userId: session.user.id,
            },
          },
        },
        {
          creatorId: session.user.id,
        },
      ],
    },
    select: {
      id: true,
    },
  });
  if (!subForum) return notFound();

  return (
    <div className="p-2 lg:p-4 rounded-md dark:bg-zinc-900/50">
      <CreatePostForm id={subForum.id} />
    </div>
  );
};

export default page;
