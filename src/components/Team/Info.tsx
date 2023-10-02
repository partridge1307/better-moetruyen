import type { Team, User } from '@prisma/client';
import { format } from 'date-fns';
import vi from 'date-fns/locale/vi';
import { Clock, Newspaper, Users2, Wifi } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import Username from '../User/Username';
import { TabsContent } from '../ui/Tabs';

const FollowButton = dynamic(() => import('@/components/Team/FollowButton'), {
  ssr: false,
  loading: () => (
    <div className="w-14 h-10 rounded-md animate-pulse bg-background" />
  ),
});
const JoinButton = dynamic(() => import('./JoinButton'), {
  ssr: false,
  loading: () => (
    <div className="w-28 h-10 rounded-md animate-pulse bg-background" />
  ),
});

interface TeamInfoProps {
  team: Pick<Team, 'id' | 'image' | 'name' | 'description' | 'createdAt'> & {
    _count: {
      member: number;
      chapter: number;
      follows: number;
    };
    owner: Pick<User, 'id' | 'image' | 'name' | 'color'>;
    follows: Pick<User, 'id'>[];
    member: Pick<User, 'id'>[];
  };
  sessionUserId?: string;
  isMember: boolean;
}

const TeamInfo: FC<TeamInfoProps> = ({ team, sessionUserId, isMember }) => {
  return (
    <TabsContent value="info" className="space-y-6">
      <section className="grid grid-cols-[.95fr_1fr] md:grid-cols-[.3fr_1fr] lg:grid-cols-[.2fr_1fr] gap-2 md:gap-8 lg:gap-10 p-1.5 lg:p-2 rounded-md dark:bg-zinc-900/60">
        <div className="relative aspect-square">
          <Image
            fill
            sizes="(max-width: 640px) 25vw, 30vw"
            quality={40}
            src={team.image}
            alt={`${team.name} Thumbnail`}
            className="object-cover rounded-full border-4 dark:border-zinc-900 dark:bg-zinc-900"
          />
        </div>

        <div className="space-y-6">
          <h1 className="text-xl font-semibold">{team.name}</h1>

          <dl className="space-y-2">
            <dt>Owner:</dt>
            <dd>
              <Link
                href={`/user/${team.owner.name?.split(' ').join('-')}`}
                className="w-fit flex items-center gap-2 lg:gap-2.5 p-1.5 rounded-md dark:bg-zinc-800"
              >
                {!!team.owner.image && (
                  <div className="relative aspect-square w-12 h-12 lg:w-16 lg:h-16">
                    <Image
                      fill
                      sizes="(max-width: 640px) 15vw, 20vw"
                      quality={40}
                      src={team.owner.image}
                      alt={`${team.owner.name} Avatar`}
                      className="object-cover rounded-full border-4 dark:border-zinc-900 dark:bg-zinc-900"
                    />
                  </div>
                )}

                <Username
                  user={team.owner}
                  className="text-start font-semibold max-sm:line-clamp-2"
                />
              </Link>
            </dd>
          </dl>
        </div>
      </section>

      <section className="p-1.5 lg:p-2 space-y-10 rounded-md dark:bg-zinc-900/60">
        <div className="flex flex-wrap items-center gap-6">
          {!!sessionUserId && sessionUserId !== team.owner.id && isMember && (
            <JoinButton team={team} sessionUserId={sessionUserId} />
          )}

          {!!sessionUserId && (
            <FollowButton team={team} sessionUserId={sessionUserId} />
          )}
        </div>

        <dl className="space-y-1">
          <dt className="text-lg font-semibold">Mô tả</dt>
          <dd className="p-1 rounded-md dark:bg-zinc-800">
            {team.description}
          </dd>
        </dl>

        <div className="flex flex-wrap justify-between items-center gap-2">
          <dl className="flex items-center gap-1.5">
            <dt>Theo dõi:</dt>
            <dd className="flex items-center gap-1">
              {team._count.follows} <Wifi className="rotate-45 w-5 h-5" />
            </dd>
          </dl>

          <dl className="flex items-center gap-1.5">
            <dt>Member:</dt>
            <dd className="flex items-center gap-1">
              {team._count.member} <Users2 className="w-5 h-5" />
            </dd>
          </dl>

          <dl className="flex items-center gap-1.5">
            <dt>Chapter:</dt>
            <dd className="flex items-center gap-1">
              {team._count.chapter} <Newspaper className="w-5 h-5" />
            </dd>
          </dl>

          <dl className="flex items-center gap-1.5">
            <dt>Tạo từ:</dt>
            <dd className="flex items-center gap-1">
              <time dateTime={team.createdAt.toDateString()}>
                {format(new Date(team.createdAt), 'd MMM y', { locale: vi })}
              </time>
              <Clock className="w-5 h-5" />
            </dd>
          </dl>
        </div>
      </section>
    </TabsContent>
  );
};

export default TeamInfo;
