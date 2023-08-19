import { db } from '@/lib/db';
import type { Session } from 'next-auth';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FC } from 'react';
import UserAvatar from '../User/UserAvatar';
import UserBanner from '../User/UserBanner';
import Username from '../User/Username';
const TeamJoinRequestButton = dynamic(
  () => import('@/components/Team/TeamJoinRequestButton'),
  { ssr: false }
);

interface TeamJoinRequestProps {
  teamId: number;
  session: Session | null;
}

const TeamJoinRequest: FC<TeamJoinRequestProps> = async ({
  teamId,
  session,
}) => {
  if (!session) return null;

  const teamJoinRequests = await db.teamJoinRequest.findMany({
    where: {
      teamId,
      team: {
        ownerId: session.user.id,
      },
    },
    select: {
      user: {
        select: {
          id: true,
          name: true,
          color: true,
          image: true,
          banner: true,
        },
      },
    },
  });

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      {teamJoinRequests.length ? (
        teamJoinRequests.map((request, idx) => (
          <div key={idx} className="p-2 rounded-md dark:bg-zinc-800">
            <Link href={`/user/${request.user.name?.split(' ').join('-')}`}>
              <div className="relative">
                <UserBanner user={request.user} className="rounded-md" />
                <UserAvatar
                  user={request.user}
                  className="absolute left-2 lg:left-3 bottom-0 translate-y-1/2 w-20 h-20 lg:w-28 lg:h-28 border-4"
                />
              </div>

              <Username
                user={request.user}
                className="text-start text-lg font-semibold pl-2 lg:pl-4 mt-16 lg:mt-20"
              />
            </Link>

            <TeamJoinRequestButton teamId={teamId} userId={request.user.id} />
          </div>
        ))
      ) : (
        <p>Không có ai xin gia nhập</p>
      )}
    </div>
  );
};

export default TeamJoinRequest;
