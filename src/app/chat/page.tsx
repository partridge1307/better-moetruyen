import ForceSignOut from '@/components/ForceSignOut';
import Username from '@/components/User/Username';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { FC } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import ChatForm from '@/components/Chat/ChatForm';
const MessageList = dynamic(() => import('@/components/Chat/MessageList'), {
  ssr: false,
  loading: () => <Loader2 className="w-6 h-6 animate-spin" />,
});

interface pageProps {
  searchParams: {
    id?: string;
    [key: string]: string | string[] | undefined;
  };
}

const page: FC<pageProps> = async ({ searchParams }) => {
  const session = await getAuthSession();
  if (!session) return redirect('/sign-in');

  if (!searchParams.id)
    return (
      <div className="w-full h-full flex justify-center items-center">
        Chọn một đoạn hội thoại hoặc thêm
      </div>
    );

  const [user, conversation] = await db.$transaction([
    db.user.findFirst({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
      },
    }),
    db.conversation.findUnique({
      where: {
        id: parseInt(searchParams.id),
        users: {
          some: {
            id: session.user.id,
          },
        },
      },
      select: {
        id: true,
        users: {
          select: {
            id: true,
            name: true,
            color: true,
          },
          where: {
            id: {
              not: session.user.id,
            },
          },
        },
      },
    }),
  ]);
  if (!user) return <ForceSignOut />;
  if (!conversation) return notFound();

  const toUser = conversation.users.find((usr) => usr.id !== user.id);
  if (!toUser) return notFound();

  return (
    <div className="relative h-full flex flex-col">
      <div className="p-2 flex justify-center items-center dark:bg-zinc-800">
        <Username user={toUser} className="md:text-start text-lg" />
      </div>

      <MessageList me={user} conversation={conversation} />
      <ChatForm conversation={conversation} session={session} />
    </div>
  );
};

export default page;
