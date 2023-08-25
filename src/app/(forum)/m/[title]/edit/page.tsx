import { getAuthSession } from '@/lib/auth';
import { FC } from 'react';
import { redirect, notFound } from 'next/navigation';
import { db } from '@/lib/db';
import dynamic from 'next/dynamic';
import ThreadSkeleton from '@/components/Forum/components/ThreadSkeleton';

const ThreadEditForm = dynamic(
  () => import('@/components/Forum/ThreadEditForm'),
  {
    ssr: false,
    loading: () => <ThreadSkeleton />,
  }
);

interface pageProps {
  params: {
    title: string;
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const session = await getAuthSession();
  if (!session) return redirect('/sign-in');

  const subForum = await db.subForum.findUnique({
    where: {
      title: params.title.split('-').join(' '),
      creatorId: session.user.id,
    },
    select: {
      id: true,
      title: true,
      canSend: true,
      banner: true,
    },
  });
  if (!subForum) return notFound();

  return (
    <div className="p-2 space-y-4 rounded-md dark:bg-zinc-900/70">
      <h1 className="text-xl font-medium p-2">Sửa cộng đồng</h1>

      <hr className="dark:bg-zinc-700 rounded-full h-[2px]" />

      <ThreadEditForm subForum={subForum} />
    </div>
  );
};

export default page;
