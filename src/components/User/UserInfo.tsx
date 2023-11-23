import { db } from '@/lib/db';
import { formatTimeToNow, nFormatter } from '@/lib/utils';
import type { User } from '@prisma/client';
import { Book, Clock, Tv, Users2, Wifi } from 'lucide-react';
import { FC } from 'react';

interface UserInfoProps {
  user: Pick<User, 'id'>;
}

const UserInfo: FC<UserInfoProps> = async ({ user }) => {
  const dbUser = await db.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      createdAt: true,
      _count: {
        select: {
          followedBy: true,
          following: true,
          subForum: true,
          manga: {
            where: {
              isPublished: true,
            },
          },
        },
      },
    },
  });
  if (!dbUser) return;

  return (
    <>
      <div className="flex items-center space-x-2 text-sm opacity-75">
        <time dateTime={dbUser.createdAt.toDateString()}>
          {formatTimeToNow(dbUser.createdAt)}
        </time>
        <Clock className="w-4 h-4" />
      </div>
      <div className="flex flex-wrap items-center space-x-4 md:space-x-6 text-lg md:text-base">
        <dl className="flex items-center space-x-1.5">
          <dt className="font-semibold">{dbUser._count.manga}</dt>
          <dd className="flex items-center gap-0.5 text-sm">
            <span className="max-sm:hidden">Manga</span>
            <Book className="w-4 h-4" />
          </dd>
        </dl>
        <dl className="flex items-center space-x-1.5">
          <dt className="font-semibold">{dbUser._count.subForum}</dt>
          <dd className="flex items-center gap-0.5 text-sm">
            <span className="max-sm:hidden">Forum</span>
            <Tv className="w-4 h-4" />
          </dd>
        </dl>

        <dl className="flex items-center space-x-1.5">
          <dt className="font-semibold">
            {nFormatter(dbUser._count.followedBy, 1)}
          </dt>
          <dd className="flex items-center gap-0.5 text-sm">
            <span className="max-sm:hidden">Theo dõi</span>
            <Wifi className="rotate-45 w-4 h-4" />
          </dd>
        </dl>
        <dl className="flex items-center space-x-1.5">
          <dt className="font-semibold">
            {nFormatter(dbUser._count.following, 1)}
          </dt>
          <dd className="flex items-center gap-1 text-sm">
            <span className="max-sm:hidden">Đang theo dõi</span>
            <Users2 className="w-5 h-5" />
          </dd>
        </dl>
      </div>
    </>
  );
};

export default UserInfo;
