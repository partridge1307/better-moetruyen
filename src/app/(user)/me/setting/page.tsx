import LinkWithDiscord from '@/components/User/LinkWithDiscord';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import { notFound, redirect } from 'next/navigation';
import dynamic from 'next/dynamic';

const ChannelSend = dynamic(() => import('@/components/User/ChannelSend'), {
  ssr: false,
});

const page = async () => {
  const session = await getAuthSession();
  if (!session) return redirect('/sign-in');

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      account: {
        select: {
          providerAccountId: true,
          provider: true,
        },
      },
      discordChannel: {
        select: {
          channelId: true,
          channelName: true,
        },
      },
    },
  });
  if (!user) return notFound();

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1>Liên kết Discord</h1>
        <LinkWithDiscord account={user.account} />
      </div>
      <div className="space-y-2">
        <h1>Kênh gửi thông báo</h1>
        <div
          className={cn('flex items-center gap-10 w-fit p-2 rounded-md', {
            'bg-red-600': !user.discordChannel,
            'bg-green-600': user.discordChannel,
          })}
        >
          {!!user.discordChannel ? (
            <dl>
              <dt>
                <span>ID:</span> {user.discordChannel.channelId}
              </dt>
              <dd>
                <span>Tên:</span> {user.discordChannel.channelName}
              </dd>
            </dl>
          ) : (
            <p>Chưa có liên kết</p>
          )}
          <ChannelSend
            channel={user.discordChannel}
            isLinked={!!user.account.length}
          />
        </div>
      </div>
    </div>
  );
};

export default page;
