import { cn, formatTimeToNow } from '@/lib/utils';
import type { Chapter, Manga, Team, User } from '@prisma/client';
import { Clock, Edit, Loader2, Upload, Users2 } from 'lucide-react';
import type { Session } from 'next-auth';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import UserAvatar from '../User/UserAvatar';
import UserBanner from '../User/UserBanner';
import Username from '../User/Username';
import { buttonVariants } from '../ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';

const TeamChapterList = dynamic(
  () => import('@/components/Team/TeamChapterList'),
  { loading: () => <Loader2 className="w-6 h-6 animate-spin" /> }
);
const TeamMangaList = dynamic(() => import('@/components/Team/TeamMangaList'), {
  loading: () => <Loader2 className="w-6 h-6 animate-spin" />,
});
const TeamLeaveButton = dynamic(
  () => import('@/components/Team/TeamLeaveButton'),
  { ssr: false }
);
const TeamJoinFunc = dynamic(() => import('@/components/Team/TeamJoinFunc'));
const TeamJoinRequest = dynamic(
  () => import('@/components/Team/TeamJoinRequest')
);

interface TabInfoProps {
  team: Pick<Team, 'id' | 'image' | 'name' | 'description' | 'createdAt'> & {
    owner: Pick<User, 'id' | 'image' | 'name' | 'color'>;
    member: {
      user: Pick<User, 'id' | 'name' | 'banner' | 'image' | 'color'>;
    }[];
    chapter: (Pick<
      Chapter,
      'id' | 'name' | 'chapterIndex' | 'volume' | 'createdAt'
    > & {
      manga: Pick<Manga, 'slug' | 'name' | 'image'>;
    })[];
  };
  session: Session | null;
}

const TabInfo: FC<TabInfoProps> = ({ team, session }) => {
  return (
    <Tabs defaultValue="info">
      <TabsList className="md:space-x-4 dark:bg-zinc-800 max-sm:w-full max-sm:justify-start overflow-auto">
        <TabsTrigger value="info">Thông tin</TabsTrigger>
        <TabsTrigger value="member">Member</TabsTrigger>
        <TabsTrigger value="chapter">Chapter</TabsTrigger>
        <TabsTrigger value="manga">Manga</TabsTrigger>
        {team.owner.id === session?.user.id && (
          <TabsTrigger value="request">Request</TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="info" className="space-y-10">
        <div className="flex max-sm:flex-col max-sm:items-center max-sm:dark:bg-zinc-800   gap-6 rounded-xl p-4">
          {team.image && (
            <div className="relative w-32 h-32">
              <Image
                fill
                sizes="70vw"
                priority
                src={team.image}
                alt="Team Image"
                className="rounded-full object-cover"
              />
            </div>
          )}

          <div className="flex flex-col justify-between max-sm:gap-4">
            <p className="text-xl max-sm:text-center font-semibold row-span-5">
              {team.name}
            </p>
            <div className="space-y-1">
              <p className="text-sm max-sm:hidden">Owner:</p>
              <Link
                href={`/user/${team.owner.name?.split(' ').join('-')}`}
                className="flex justify-center items-center w-fit gap-4 dark:bg-zinc-700 px-3 py-2 rounded-xl"
              >
                <UserAvatar user={team.owner} />
                <Username user={team.owner} />
              </Link>
            </div>
          </div>
        </div>

        {team.owner.id === session?.user.id ? (
          <Link
            href={`/me/team/${team.id}/edit`}
            className={cn(buttonVariants(), 'space-x-2 max-sm:w-full')}
          >
            <p>Chỉnh sửa</p>
            <Edit className="w-5 h-5" />
          </Link>
        ) : team.member.some(
            (member) => member.user.id === session?.user.id
          ) ? (
          <TeamLeaveButton id={team.id} />
        ) : (
          <TeamJoinFunc session={session} teamId={team.id} />
        )}

        <div>
          <h1>Mô tả</h1>
          <p className="p-1 rounded-md dark:bg-zinc-800">{team.description}</p>
        </div>

        <div className="flex max-sm:flex-col gap-2 md:gap-10 px-4">
          <dl className="flex gap-2">
            <dt>Đã đăng:</dt>
            <dd className="flex items-center gap-1">
              {team.chapter.length}
              <Upload className="w-5 h-5" />
            </dd>
          </dl>
          <dl className="flex gap-2">
            <dt>Member:</dt>
            <dd className="flex items-center gap-1">
              {team.member.length}
              <Users2 className="w-5 h-5" />
            </dd>
          </dl>
          <dl className="flex gap-2">
            <dt>Tạo từ:</dt>
            <dl className="flex items-center gap-1">
              {formatTimeToNow(team.createdAt)}
              <Clock className="w-4 md:w-5 h-4 md:h-5" />
            </dl>
          </dl>
        </div>
      </TabsContent>

      <TabsContent value="member">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.member.map((mem, idx) => (
            <Link
              key={idx}
              href={`/user/${mem.user.name?.split(' ').join('-')}`}
              className="relative p-2 transition-colors rounded-md dark:bg-zinc-800 hover:dark:bg-zinc-700"
            >
              <div className="relative">
                <UserBanner user={mem.user} className="rounded-md" />
                <UserAvatar
                  user={mem.user}
                  className="w-24 h-24 lg:w-28 lg:h-28 border-4 absolute left-2 lg:left-4 bottom-0 translate-y-1/2"
                />
              </div>
              <Username
                user={mem.user}
                className="text-lg font-semibold text-start pl-4 lg:pl-6 mt-16 lg:mt-20"
              />
            </Link>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="chapter" className="space-y-4">
        <TeamChapterList chapter={team.chapter} />
      </TabsContent>

      <TabsContent value="manga">
        <TeamMangaList chapter={team.chapter} />
      </TabsContent>

      <TabsContent value="request">
        <TeamJoinRequest teamId={team.id} session={session} />
      </TabsContent>
    </Tabs>
  );
};

export default TabInfo;
