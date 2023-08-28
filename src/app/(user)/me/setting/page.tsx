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
          roleId: true,
          roleName: true,
        },
      },
    },
  });
  if (!user) return notFound();

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <label htmlFor="discord-link">Liên kết Discord</label>
        <LinkWithDiscord account={user.account} />
      </div>
      <div className="space-y-2">
        <h1>Kênh gửi thông báo</h1>
        {/* <div
          className={cn('flex flex-col gap-4 w-fit py-2 px-4 rounded-md', {
            'bg-red-700': !user.discordChannel,
            'bg-green-700': user.discordChannel,
          })}
        >
          {!!user.discordChannel ? (
            <div>
              <dl>
                <dt>
                  <span>ID:</span> {user.discordChannel.channelId}
                </dt>
                <dd>
                  <span>Tên:</span> {user.discordChannel.channelName}
                </dd>
              </dl>
              {!!user.discordChannel.roleId &&
                !!user.discordChannel.roleName && (
                  <dl>
                    <dt>
                      <span>ID:</span> {user.discordChannel.roleId}
                    </dt>
                    <dd>
                      <span>Tên:</span> {user.discordChannel.roleName}
                    </dd>
                  </dl>
                )}
            </div>
          ) : (
            <p>Chưa có liên kết</p>
          )}
          <ChannelSend
            channel={user.discordChannel}
            isLinked={!!user.account.length}
          />
        </div> */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 lg:gap-6">
            <div
              className={cn('flex-1 p-2 rounded-md', {
                'bg-green-900': user.discordChannel,
                'bg-red-900': !user.discordChannel,
              })}
            >
              <label htmlFor="channel-info">Kênh</label>
              {!!user.discordChannel ? (
                <dl id="channel-info">
                  <dt>
                    <span>ID:</span> {user.discordChannel.channelId}
                  </dt>
                  <dd className="line-clamp-1">
                    <span>Tên:</span> {user.discordChannel.channelName}
                  </dd>
                </dl>
              ) : (
                <p id="channel-info">Chưa có liên kết</p>
              )}
            </div>
            <div
              className={cn('flex-1 p-2 rounded-md', {
                'bg-green-900': user.discordChannel?.roleId,
                'bg-red-900': !user.discordChannel?.roleId,
              })}
            >
              <label htmlFor="role-info">Role</label>
              {!!user.discordChannel?.roleId &&
              !!user.discordChannel.roleName ? (
                <dl id="role-info">
                  <dt>
                    <span>ID:</span> {user.discordChannel.roleId}
                  </dt>
                  <dd className="line-clamp-1">
                    <span>Tên:</span> {user.discordChannel.roleName}
                  </dd>
                </dl>
              ) : (
                <p id="role-info">Chưa có liên kết</p>
              )}
            </div>
          </div>
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
